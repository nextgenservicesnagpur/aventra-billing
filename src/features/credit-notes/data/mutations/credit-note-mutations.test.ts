import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createCreditNoteAction,
  updateCreditNoteAction,
  issueCreditNoteAction,
  deleteCreditNoteAction,
} from "./credit-note-mutations";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../context/credit-note-context", () => ({
  resolveCreditNoteContext: vi.fn().mockResolvedValue({
    organizationId: "org-test-123",
    userId: "user-test-456",
  }),
}));

const mockCreditNoteCreate = vi.fn();
const mockCreditNoteUpdate = vi.fn();
const mockCreditNoteDelete = vi.fn();
const mockCreditNoteFindById = vi.fn();
const mockGetIssuedTotalForInvoice = vi.fn();

vi.mock("../../infrastructure/repositories/prisma-credit-note-repository", () => ({
  creditNoteRepository: {
    create: (...args: unknown[]) => mockCreditNoteCreate(...args),
    update: (...args: unknown[]) => mockCreditNoteUpdate(...args),
    delete: (...args: unknown[]) => mockCreditNoteDelete(...args),
    findById: (...args: unknown[]) => mockCreditNoteFindById(...args),
    getIssuedTotalForInvoice: (...args: unknown[]) => mockGetIssuedTotalForInvoice(...args),
  },
}));

const mockInvoiceFindById = vi.fn();
vi.mock("@/features/invoices/infrastructure/repositories/prisma-invoice-repository", () => ({
  invoiceRepository: {
    findById: (...args: unknown[]) => mockInvoiceFindById(...args),
  },
}));

const mockAllocateNextNumber = vi.fn();
const mockGetSettings = vi.fn().mockResolvedValue({
  defaultNotes: "Standard note",
  defaultTerms: "Standard terms",
});
vi.mock(
  "@/features/billing-settings/infrastructure/repositories/prisma-billing-settings-repository",
  () => ({
    billingSettingsRepository: {
      allocateNextNumber: (...args: unknown[]) => mockAllocateNextNumber(...args),
      getSettings: (...args: unknown[]) => mockGetSettings(...args),
    },
  }),
);

const mockTx = {
  $queryRaw: vi.fn().mockResolvedValue([]),
  creditNote: {
    findUnique: vi.fn().mockResolvedValue(null),
  },
  invoice: {
    update: vi.fn().mockResolvedValue({}),
  },
};

vi.mock("@/shared/lib/prisma", () => ({
  getPrisma: () => ({
    $transaction: vi.fn(async (callback: (tx: typeof mockTx) => Promise<unknown>) => {
      return await callback(mockTx);
    }),
  }),
}));

describe("Credit Note Server Mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleEligibleInvoice = {
    id: "inv-eligible-1",
    number: "INV-2026-0001",
    customer: "Acme Enterprises",
    customerId: "cust-1",
    customerEmail: "billing@acme.com",
    customerAddress: "Mumbai, MH",
    customerGstin: "27ABCDE1234F1Z5",
    customerPlaceOfSupply: "27-Maharashtra",
    issueDate: "2026-10-10",
    dueDate: "2026-10-25",
    status: "Issued" as const,
    taxMode: "CGST_SGST" as const,
    currency: "INR (₹)",
    subtotal: 100000,
    lineDiscountTotal: 0,
    additionalDiscount: 0,
    additionalCharges: 0,
    taxableAmount: 100000,
    cgst: 9000,
    sgst: 9000,
    igst: 0,
    totalTax: 18000,
    total: 118000,
    amountPaid: 0,
    items: [
      {
        id: "inv-item-1",
        item: "Web Platform Development",
        quantity: 1,
        unitPrice: 100000,
        discount: 0,
        taxRate: 18,
      },
    ],
  };

  describe("createCreditNoteAction", () => {
    it("returns validation failure when reason or items are missing", async () => {
      const res = await createCreditNoteAction({
        invoiceId: "inv-1",
        issueDate: "2026-10-15",
        status: "Draft",
        reason: "",
        items: [],
      });

      expect(res.success).toBe(false);
      expect(res.fieldErrors?.reason).toBeDefined();
      expect(res.fieldErrors?.items).toBeDefined();
      expect(mockCreditNoteCreate).not.toHaveBeenCalled();
    });

    it("fails when invoice does not exist in the user's organization", async () => {
      mockInvoiceFindById.mockResolvedValue(null);

      const res = await createCreditNoteAction({
        invoiceId: "inv-non-existent",
        issueDate: "2026-10-15",
        status: "Draft",
        reason: "Cancelled service",
        items: [{ item: "Service", quantity: 1, unitPrice: 1000, discount: 0, taxRate: 0 }],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("does not exist or does not belong to your organization");
      expect(mockCreditNoteCreate).not.toHaveBeenCalled();
    });

    it("rejects creating a credit note against a Draft invoice", async () => {
      mockInvoiceFindById.mockResolvedValue({
        ...sampleEligibleInvoice,
        status: "Draft",
      });

      const res = await createCreditNoteAction({
        invoiceId: "inv-draft-1",
        issueDate: "2026-10-15",
        status: "Draft",
        reason: "Test",
        items: [{ item: "Service", quantity: 1, unitPrice: 1000, discount: 0, taxRate: 0 }],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("is ineligible for credit");
      expect(mockCreditNoteCreate).not.toHaveBeenCalled();
    });

    it("rejects credit note if amount exceeds invoice remaining available credit", async () => {
      mockInvoiceFindById.mockResolvedValue(sampleEligibleInvoice);
      // Already issued 100000 out of 118000 (remaining available is 18000)
      mockGetIssuedTotalForInvoice.mockResolvedValue(100000);

      const res = await createCreditNoteAction({
        invoiceId: sampleEligibleInvoice.id,
        issueDate: "2026-10-15",
        status: "Issued",
        reason: "Overcharge",
        items: [
          {
            item: "Web Platform Development",
            quantity: 1,
            unitPrice: 50000, // Total with 18% tax = 59000 > 18000
            discount: 0,
            taxRate: 18,
          },
        ],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("exceeds remaining creditable balance");
      expect(mockCreditNoteCreate).not.toHaveBeenCalled();
    });

    it("successfully creates and allocates credit note number when valid", async () => {
      mockInvoiceFindById.mockResolvedValue(sampleEligibleInvoice);
      mockGetIssuedTotalForInvoice.mockResolvedValue(0);
      mockAllocateNextNumber.mockResolvedValue({
        allocatedNumber: "CN-2026-0001",
        nextNumber: 2,
      });
      mockCreditNoteCreate.mockImplementation(async (payload) => ({
        ...payload,
        id: "cn-created-1",
      }));

      const res = await createCreditNoteAction({
        invoiceId: sampleEligibleInvoice.id,
        issueDate: "2026-10-15",
        status: "Draft",
        reason: "Partial adjustment",
        items: [
          {
            item: "Web Platform Development",
            quantity: 1,
            unitPrice: 20000,
            discount: 0,
            taxRate: 18,
          },
        ],
      });

      expect(res.success).toBe(true);
      expect(mockAllocateNextNumber).toHaveBeenCalledWith("org-test-123", "CREDIT_NOTE", mockTx);
      expect(mockCreditNoteCreate).toHaveBeenCalled();
      const payload = mockCreditNoteCreate.mock.calls[0][0];
      expect(payload.creditNoteNumber).toBe("CN-2026-0001");
      expect(payload.taxMode).toBe("CGST_SGST");
      expect(payload.subtotal).toBe(20000);
      expect(payload.cgst).toBe(1800);
      expect(payload.sgst).toBe(1800);
      expect(payload.total).toBe(23600);
    });
  });

  describe("updateCreditNoteAction", () => {
    it("fails when credit note does not exist", async () => {
      mockCreditNoteFindById.mockResolvedValue(null);

      const res = await updateCreditNoteAction({
        id: "cn-missing",
        issueDate: "2026-10-15",
        status: "Draft",
        reason: "Updated reason",
        items: [{ item: "Item", quantity: 1, unitPrice: 100, discount: 0, taxRate: 0 }],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("was not found");
      expect(mockCreditNoteUpdate).not.toHaveBeenCalled();
    });

    it("fails when editing an already issued credit note", async () => {
      mockCreditNoteFindById.mockResolvedValue({
        id: "cn-issued-1",
        creditNoteNumber: "CN-2026-0001",
        status: "Issued",
        invoiceId: sampleEligibleInvoice.id,
      });

      const res = await updateCreditNoteAction({
        id: "cn-issued-1",
        issueDate: "2026-10-15",
        status: "Draft",
        reason: "Attempt edit",
        items: [{ item: "Item", quantity: 1, unitPrice: 100, discount: 0, taxRate: 0 }],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("is financially immutable and cannot be modified");
      expect(mockCreditNoteUpdate).not.toHaveBeenCalled();
    });
  });

  describe("issueCreditNoteAction", () => {
    it("issues a draft credit note successfully after availability check", async () => {
      mockCreditNoteFindById.mockResolvedValue({
        id: "cn-draft-1",
        creditNoteNumber: "CN-2026-0001",
        invoiceId: sampleEligibleInvoice.id,
        status: "Draft",
        reason: "Return",
        taxMode: "CGST_SGST",
        currency: "INR (₹)",
        subtotal: 10000,
        lineDiscountTotal: 0,
        taxableAmount: 10000,
        cgst: 900,
        sgst: 900,
        igst: 0,
        totalTax: 1800,
        total: 11800,
        items: [
          {
            id: "cn-item-1",
            item: "Item",
            quantity: 1,
            unitPrice: 10000,
            discount: 0,
            taxRate: 18,
          },
        ],
      });
      mockInvoiceFindById.mockResolvedValue(sampleEligibleInvoice);
      mockGetIssuedTotalForInvoice.mockResolvedValue(0);
      mockCreditNoteUpdate.mockImplementation(async (_org, _id, payload) => ({
        ...payload,
        id: "cn-draft-1",
      }));

      const res = await issueCreditNoteAction("cn-draft-1");

      expect(res.success).toBe(true);
      expect(mockCreditNoteUpdate).toHaveBeenCalled();
      const updatedPayload = mockCreditNoteUpdate.mock.calls[0][2];
      expect(updatedPayload.status).toBe("Issued");
    });

    it("fails when trying to issue a credit note that is not Draft", async () => {
      mockCreditNoteFindById.mockResolvedValue({
        id: "cn-issued-1",
        creditNoteNumber: "CN-2026-0001",
        status: "Issued",
        invoiceId: sampleEligibleInvoice.id,
      });

      const res = await issueCreditNoteAction("cn-issued-1");

      expect(res.success).toBe(false);
      expect(res.error).toContain("Cannot perform operation 'issue'");
      expect(mockCreditNoteUpdate).not.toHaveBeenCalled();
    });
  });

  describe("deleteCreditNoteAction", () => {
    it("deletes a draft credit note", async () => {
      mockCreditNoteFindById.mockResolvedValue({
        id: "cn-draft-1",
        invoiceId: sampleEligibleInvoice.id,
        status: "Draft",
      });

      const res = await deleteCreditNoteAction("cn-draft-1");

      expect(res.success).toBe(true);
      expect(mockCreditNoteDelete).toHaveBeenCalledWith("org-test-123", "cn-draft-1");
    });

    it("rejects deleting an issued credit note", async () => {
      mockCreditNoteFindById.mockResolvedValue({
        id: "cn-issued-1",
        invoiceId: sampleEligibleInvoice.id,
        status: "Issued",
      });

      const res = await deleteCreditNoteAction("cn-issued-1");

      expect(res.success).toBe(false);
      expect(res.error).toContain("Cannot perform operation 'delete'");
      expect(mockCreditNoteDelete).not.toHaveBeenCalled();
    });
  });
});
