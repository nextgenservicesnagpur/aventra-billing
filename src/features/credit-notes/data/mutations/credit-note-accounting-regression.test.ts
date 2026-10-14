import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createCreditNoteAction,
  issueCreditNoteAction,
} from "./credit-note-mutations";
import { InvoiceStatus as PrismaInvoiceStatus } from "@/generated/prisma/enums";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../context/credit-note-context", () => ({
  resolveCreditNoteContext: vi.fn().mockResolvedValue({
    organizationId: "org-acme-prod",
    userId: "user-accountant-001",
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
const mockGetSettings = vi.fn();
vi.mock(
  "@/features/billing-settings/infrastructure/repositories/prisma-billing-settings-repository",
  () => ({
    billingSettingsRepository: {
      allocateNextNumber: (...args: unknown[]) => mockAllocateNextNumber(...args),
      getSettings: (...args: unknown[]) => mockGetSettings(...args),
    },
  }),
);

const mockInvoiceUpdate = vi.fn().mockResolvedValue({});
const mockTx = {
  $queryRaw: vi.fn().mockResolvedValue([]),
  creditNote: {
    findUnique: vi.fn().mockResolvedValue(null),
  },
  invoice: {
    update: (...args: unknown[]) => mockInvoiceUpdate(...args),
  },
};

vi.mock("@/shared/lib/prisma", () => ({
  getPrisma: () => ({
    $transaction: vi.fn(async (callback: (tx: typeof mockTx) => Promise<unknown>) => {
      return await callback(mockTx);
    }),
  }),
}));

describe("Credit Note Accounting Flow & Billing Settings Regression Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSettings.mockResolvedValue({
      prefix: "CN-",
      suffix: "",
      padding: 4,
      nextNumber: 1,
      defaultNotes: "Persisted settings default note",
      defaultTerms: "Persisted settings default terms",
    });
    mockAllocateNextNumber.mockResolvedValue({
      allocatedNumber: "CN-0001",
      nextNumber: 2,
    });
  });

  describe("Billing Settings Authoritative Consumption", () => {
    it("allocates credit note sequence atomically from billing settings repository and consumes default notes/terms", async () => {
      const invoice100k = {
        id: "inv-100k",
        number: "INV-100K",
        customer: "Client Corp",
        customerId: "cust-1",
        taxMode: "CGST_SGST",
        status: "Issued",
        items: [
          {
            id: "line-1",
            item: "Advisory Service",
            quantity: 1,
            unitPrice: 84745.76,
            discount: 0,
            taxRate: 18,
          },
        ],
        amountPaid: 0,
        creditedAmount: 0,
      };
      mockInvoiceFindById.mockResolvedValue(invoice100k);
      mockGetIssuedTotalForInvoice.mockResolvedValue(0);
      mockCreditNoteCreate.mockImplementation(async (payload) => ({
        ...payload,
        id: "cn-created-1",
      }));

      const res = await createCreditNoteAction({
        invoiceId: "inv-100k",
        issueDate: "2026-10-15",
        status: "Draft",
        reason: "Billing correction",
        // Omitted notes & terms to verify billing-settings fallback
        items: [
          {
            item: "Adjustment",
            quantity: 1,
            unitPrice: 10000,
            discount: 0,
            taxRate: 18,
          },
        ],
      });

      expect(res.success).toBe(true);
      // Atomic allocation called
      expect(mockAllocateNextNumber).toHaveBeenCalledWith("org-acme-prod", "CREDIT_NOTE", mockTx);
      // Settings loaded and applied for defaults
      expect(mockGetSettings).toHaveBeenCalledWith("org-acme-prod", "CREDIT_NOTE", mockTx);
      const created = mockCreditNoteCreate.mock.calls[0][0];
      expect(created.notes).toBe("Persisted settings default note");
      expect(created.terms).toBe("Persisted settings default terms");
    });
  });

  describe("Accounting Effects on Original Invoice & Receivables", () => {
    it("does NOT update original invoice status when saving as a Draft credit note", async () => {
      const invoice = {
        id: "inv-active",
        number: "INV-ACTIVE",
        customer: "Acme",
        taxMode: "CGST_SGST",
        status: "Issued",
        items: [
          {
            id: "it-1",
            item: "Product A",
            quantity: 1,
            unitPrice: 10000,
            discount: 0,
            taxRate: 18,
          },
        ],
        amountPaid: 0,
      };
      mockInvoiceFindById.mockResolvedValue(invoice);
      mockGetIssuedTotalForInvoice.mockResolvedValue(0);
      mockCreditNoteCreate.mockImplementation(async (payload) => ({ ...payload, id: "cn-draft-1" }));

      const res = await createCreditNoteAction({
        invoiceId: "inv-active",
        issueDate: "2026-10-15",
        status: "Draft",
        reason: "Defective item",
        items: [
          {
            item: "Product A",
            quantity: 1,
            unitPrice: 5000,
            discount: 0,
            taxRate: 18,
          },
        ],
      });

      expect(res.success).toBe(true);
      // In PostgreSQL, invoice.update is NOT called for Draft
      expect(mockInvoiceUpdate).not.toHaveBeenCalled();
    });

    it("issues a partial credit note (e.g. 20,000 against 100,000 receivable) and updates invoice to PARTIALLY_PAID", async () => {
      const invoice = {
        id: "inv-100k",
        number: "INV-100K",
        customer: "Client A",
        taxMode: "CGST_SGST",
        status: "Issued",
        items: [
          {
            id: "it-1",
            item: "Consulting",
            quantity: 1,
            unitPrice: 84745.76,
            discount: 0,
            taxRate: 18,
          },
        ],
        amountPaid: 0,
      };
      mockInvoiceFindById.mockResolvedValue(invoice);
      mockGetIssuedTotalForInvoice.mockResolvedValue(0);
      mockCreditNoteCreate.mockImplementation(async (payload) => ({ ...payload, id: "cn-20k" }));

      const res = await createCreditNoteAction({
        invoiceId: "inv-100k",
        issueDate: "2026-10-15",
        status: "Issued",
        reason: "Rate adjustment",
        items: [
          {
            item: "Partial adjustment",
            quantity: 1,
            unitPrice: 16949.15,
            discount: 0,
            taxRate: 18,
          },
        ],
      });

      expect(res.success).toBe(true);
      expect(mockInvoiceUpdate).toHaveBeenCalledWith({
        where: { id: "inv-100k" },
        data: { status: PrismaInvoiceStatus.PARTIALLY_PAID },
      });
    });

    it("issues a full settlement credit note and marks invoice as PAID", async () => {
      const draftCreditNote = {
        id: "cn-full",
        creditNoteNumber: "CN-0005",
        invoiceId: "inv-target",
        customerId: "cust-1",
        customerName: "Acme",
        issueDate: "2026-10-15",
        status: "Draft",
        reason: "Order cancellation",
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
        notes: null,
        terms: null,
        items: [
          {
            id: "cn-item-1",
            item: "Full credit",
            quantity: 1,
            unitPrice: 10000,
            discount: 0,
            taxRate: 18,
          },
        ],
      };
      const invoice = {
        id: "inv-target",
        number: "INV-TARGET",
        customer: "Acme",
        taxMode: "CGST_SGST",
        status: "Issued",
        items: [
          {
            id: "it-1",
            item: "Hardware unit",
            quantity: 1,
            unitPrice: 10000,
            discount: 0,
            taxRate: 18,
          },
        ],
        amountPaid: 0,
      };

      mockCreditNoteFindById.mockResolvedValue(draftCreditNote);
      mockInvoiceFindById.mockResolvedValue(invoice);
      mockGetIssuedTotalForInvoice.mockResolvedValue(0);
      mockCreditNoteUpdate.mockImplementation(async (_orgId, _id, payload) => ({
        ...payload,
        id: "cn-full",
      }));

      const res = await issueCreditNoteAction("cn-full");

      expect(res.success).toBe(true);
      expect(mockInvoiceUpdate).toHaveBeenCalledWith({
        where: { id: "inv-target" },
        data: { status: PrismaInvoiceStatus.PAID },
      });
    });

    it("rejects over-crediting when credit note amount exceeds remaining available invoice credit", async () => {
      const invoice = {
        id: "inv-50k",
        number: "INV-50K",
        customer: "Beta",
        taxMode: "CGST_SGST",
        status: "Issued",
        items: [
          {
            id: "it-1",
            item: "Services",
            quantity: 1,
            unitPrice: 10000,
            discount: 0,
            taxRate: 18,
          },
        ],
        amountPaid: 0,
      }; // Total is 11,800
      mockInvoiceFindById.mockResolvedValue(invoice);
      // Already credited 10,000 previously
      mockGetIssuedTotalForInvoice.mockResolvedValue(10000);

      const res = await createCreditNoteAction({
        invoiceId: "inv-50k",
        issueDate: "2026-10-15",
        status: "Issued",
        reason: "Excess credit attempt",
        items: [
          {
            item: "Attempting 5000 credit when only 1800 remains",
            quantity: 1,
            unitPrice: 5000,
            discount: 0,
            taxRate: 18,
          },
        ],
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("exceeds remaining creditable balance");
      expect(mockInvoiceUpdate).not.toHaveBeenCalled();
    });

    it("rejects issuing a credit note that is not in Draft status", async () => {
      mockCreditNoteFindById.mockResolvedValue({
        id: "cn-already-issued",
        status: "Issued",
        invoiceId: "inv-1",
      });

      const res = await issueCreditNoteAction("cn-already-issued");

      expect(res.success).toBe(false);
      expect(res.error).toContain("Cannot perform operation 'issue'");
      expect(mockInvoiceUpdate).not.toHaveBeenCalled();
    });
  });
});
