import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createInvoiceAction,
  updateInvoiceAction,
  deleteInvoiceAction,
} from "./invoice-mutations";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../context/invoice-context", () => ({
  resolveInvoiceContext: vi.fn().mockResolvedValue({
    organizationId: "org-test-123",
    userId: "user-test-456",
  }),
}));

const mockInvoiceCreate = vi.fn();
const mockInvoiceUpdate = vi.fn();
const mockInvoiceDelete = vi.fn();
const mockInvoiceFindById = vi.fn();
const mockInvoiceFindByNumber = vi.fn();

vi.mock("../../infrastructure/repositories/prisma-invoice-repository", () => ({
  invoiceRepository: {
    create: (...args: unknown[]) => mockInvoiceCreate(...args),
    update: (...args: unknown[]) => mockInvoiceUpdate(...args),
    delete: (...args: unknown[]) => mockInvoiceDelete(...args),
    findById: (...args: unknown[]) => mockInvoiceFindById(...args),
    findByNumber: (...args: unknown[]) => mockInvoiceFindByNumber(...args),
  },
}));

const mockCustomerFindById = vi.fn();
vi.mock("@/features/customers/infrastructure/repositories/prisma-customer-repository", () => ({
  customerRepository: {
    findById: (...args: unknown[]) => mockCustomerFindById(...args),
  },
}));

const mockAllocateNextNumber = vi.fn();
vi.mock(
  "@/features/billing-settings/infrastructure/repositories/prisma-billing-settings-repository",
  () => ({
    billingSettingsRepository: {
      allocateNextNumber: (...args: unknown[]) => mockAllocateNextNumber(...args),
    },
  }),
);

vi.mock("../queries/get-supplier-tax-context", () => ({
  getSupplierTaxContext: vi.fn().mockResolvedValue({
    state: "27-Maharashtra",
    gstNumber: "27ABCDE1234F1Z5",
    organizationName: "Aventra Tech Solutions",
  }),
}));

describe("Invoice Server Mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createInvoiceAction", () => {
    it("returns validation failure when customer is missing", async () => {
      const res = await createInvoiceAction({
        customerName: "",
        issueDate: "2026-10-15",
        dueDate: "2026-10-30",
        status: "Draft",
        items: [
          {
            item: "Design System",
            quantity: 1,
            unitPrice: 10000,
          },
        ],
      });

      expect(res.success).toBe(false);
      expect(res.fieldErrors?.customerName).toBeDefined();
      expect(mockInvoiceCreate).not.toHaveBeenCalled();
    });

    it("fails when customerId does not belong to organization", async () => {
      mockCustomerFindById.mockResolvedValue(null);

      const res = await createInvoiceAction({
        customerId: "foreign-cust-id",
        customerName: "Unknown Foreign Corp",
        issueDate: "2026-10-15",
        dueDate: "2026-10-30",
        status: "Draft",
        items: [
          {
            item: "Product License",
            quantity: 1,
            unitPrice: 5000,
          },
        ],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("foreign-cust-id");
      expect(mockInvoiceCreate).not.toHaveBeenCalled();
    });

    it("recalculates inter-state IGST tax correctly and allocates invoice number on issue", async () => {
      mockAllocateNextNumber.mockResolvedValue({
        allocatedNumber: "INV-2026-0099",
        nextNumber: 100,
      });

      mockInvoiceCreate.mockImplementation(async (input) => ({
        ...input,
        id: "inv-created-id",
      }));

      const res = await createInvoiceAction({
        customerName: "Bengaluru Tech Ltd",
        customerPlaceOfSupply: "29-Karnataka",
        issueDate: "2026-10-15",
        dueDate: "2026-10-30",
        status: "Issued",
        items: [
          {
            item: "Cloud Architecture",
            quantity: 2,
            unitPrice: 50000,
            discount: 10,
            taxRate: 18,
          },
        ],
      });

      expect(res.success).toBe(true);
      expect(mockAllocateNextNumber).toHaveBeenCalledWith("org-test-123", "INVOICE");

      // Verify that created invoice had IGST recalculated server-side
      const createdPayload = mockInvoiceCreate.mock.calls[0][0];
      expect(createdPayload.invoiceNumber).toBe("INV-2026-0099");
      expect(createdPayload.taxMode).toBe("IGST");
      expect(createdPayload.subtotal).toBe(100000);
      expect(createdPayload.taxableAmount).toBe(90000); // 100000 - 10%
      expect(createdPayload.igst).toBe(16200); // 18% of 90000
      expect(createdPayload.cgst).toBe(0);
      expect(createdPayload.sgst).toBe(0);
      expect(createdPayload.total).toBe(106200); // 90000 + 16200
    });

    it("recalculates intra-state CGST + SGST tax when customer is in same state", async () => {
      mockAllocateNextNumber.mockResolvedValue({
        allocatedNumber: "INV-2026-0100",
        nextNumber: 101,
      });

      mockInvoiceCreate.mockImplementation(async (input) => ({
        ...input,
        id: "inv-created-2",
      }));

      const res = await createInvoiceAction({
        customerName: "Mumbai Trading Co",
        customerPlaceOfSupply: "27-Maharashtra",
        issueDate: "2026-10-15",
        dueDate: "2026-10-30",
        status: "Issued",
        items: [
          {
            item: "Security Audit",
            quantity: 1,
            unitPrice: 100000,
            discount: 0,
            taxRate: 18,
          },
        ],
      });

      expect(res.success).toBe(true);
      const createdPayload = mockInvoiceCreate.mock.calls[0][0];
      expect(createdPayload.taxMode).toBe("CGST_SGST");
      expect(createdPayload.cgst).toBe(9000);
      expect(createdPayload.sgst).toBe(9000);
      expect(createdPayload.igst).toBe(0);
      expect(createdPayload.total).toBe(118000);
    });
  });

  describe("updateInvoiceAction", () => {
    it("fails when invoice is not found in organization", async () => {
      mockInvoiceFindById.mockResolvedValue(null);

      const res = await updateInvoiceAction({
        id: "non-existent-id",
        customerName: "Acme",
        issueDate: "2026-10-15",
        dueDate: "2026-10-30",
        items: [{ item: "Audit", quantity: 1, unitPrice: 100 }],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("was not found");
      expect(mockInvoiceUpdate).not.toHaveBeenCalled();
    });

    it("fails when invoice is already Issued or Paid", async () => {
      mockInvoiceFindById.mockResolvedValue({
        id: "inv-issued-1",
        number: "INV-2026-0001",
        status: "Issued",
      });

      const res = await updateInvoiceAction({
        id: "inv-issued-1",
        customerName: "Acme",
        issueDate: "2026-10-15",
        dueDate: "2026-10-30",
        items: [{ item: "Audit", quantity: 1, unitPrice: 100 }],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Cannot edit invoice in "Issued" status');
      expect(mockInvoiceUpdate).not.toHaveBeenCalled();
    });
  });

  describe("deleteInvoiceAction", () => {
    it("allows deleting draft invoices only", async () => {
      mockInvoiceFindById.mockResolvedValue({
        id: "inv-draft-1",
        status: "Draft",
      });

      const res = await deleteInvoiceAction("inv-draft-1");
      expect(res.success).toBe(true);
      expect(mockInvoiceDelete).toHaveBeenCalledWith("org-test-123", "inv-draft-1");
    });

    it("rejects deleting issued invoices", async () => {
      mockInvoiceFindById.mockResolvedValue({
        id: "inv-issued-1",
        status: "Issued",
      });

      const res = await deleteInvoiceAction("inv-issued-1");
      expect(res.success).toBe(false);
      expect(res.error).toContain('Cannot delete invoice in "Issued" status');
      expect(mockInvoiceDelete).not.toHaveBeenCalled();
    });
  });
});
