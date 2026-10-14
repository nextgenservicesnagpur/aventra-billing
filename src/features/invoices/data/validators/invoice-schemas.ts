import { z } from "zod";

export const invoiceLineItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  item: z.string().trim().min(1, "Item or service name is required."),
  description: z.string().optional().default(""),
  hsnSac: z.string().trim().optional(),
  quantity: z.coerce.number().positive("Quantity must be greater than zero."),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative."),
  discount: z.coerce.number().min(0).max(100, "Discount must be between 0 and 100%.").default(0),
  taxRate: z.coerce.number().min(0).max(100, "Tax rate must be between 0 and 100%.").default(18),
});

export const createInvoiceSchema = z
  .object({
    invoiceNumber: z.string().trim().optional(),
    customerId: z.string().trim().optional(),
    customerName: z.string().trim().min(1, "Select or enter a customer."),
    customerEmail: z.string().trim().email("Enter a valid email address.").or(z.literal("")).optional(),
    customerAddress: z.string().trim().optional(),
    customerGstin: z.string().trim().optional(),
    customerPlaceOfSupply: z.string().trim().optional(),
    issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be in YYYY-MM-DD format."),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format."),
    paymentTerms: z.string().trim().default("Net 15 days"),
    status: z.enum(["Draft", "Issued", "Partially Paid", "Paid", "Overdue", "Cancelled"]).default("Draft"),
    taxMode: z.enum(["CGST_SGST", "IGST"]).default("CGST_SGST"),
    notes: z.string().optional(),
    terms: z.string().optional(),
    items: z.array(invoiceLineItemSchema).min(1, "Add at least one line item."),
    amountPaid: z.coerce.number().min(0).default(0),
    additionalCharges: z.coerce.number().min(0).default(0),
    additionalChargesLabel: z.string().trim().optional(),
    additionalDiscount: z.coerce.number().min(0).default(0),
    additionalDiscountType: z.enum(["percentage", "fixed"]).default("fixed"),
    additionalDiscountLabel: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.issueDate && data.dueDate) {
        return data.dueDate >= data.issueDate;
      }
      return true;
    },
    {
      message: "Due date must be on or after issue date.",
      path: ["dueDate"],
    },
  )
  .refine(
    (data) => {
      if (data.additionalDiscountType === "percentage") {
        return data.additionalDiscount <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%.",
      path: ["additionalDiscount"],
    },
  );

export const updateInvoiceSchema = createInvoiceSchema.extend({
  id: z.string().min(1, "Invoice ID is required."),
});
