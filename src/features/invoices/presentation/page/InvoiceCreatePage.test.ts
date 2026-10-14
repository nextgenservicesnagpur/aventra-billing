import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { CustomerSection } from "../components/CustomerSection";
import { InvoiceDetailsSection } from "../components/InvoiceDetailsSection";
import { InvoiceItemsSection, sampleProducts } from "../components/InvoiceItemsSection";
import { InvoiceSummarySection } from "../components/InvoiceSummarySection";
import { AdditionalInfoSection } from "../components/AdditionalInfoSection";
import { AdditionalChargesAndDiscountSection } from "../components/AdditionalChargesAndDiscountSection";
import {
  calculateInvoiceTotals,
  validateInvoice,
  type Invoice,
  type InvoiceLineItem,
} from "../../domain/invoice";

const mockCustomers = [
  {
    name: "Acme Enterprises",
    email: "billing@acme.in",
    address: "14 Tech Park, Whitefield, Bengaluru",
    gstin: "29AABCA1234F1Z5",
  },
  {
    name: "TechSol Pvt. Ltd.",
    email: "accounts@techsol.in",
    address: "88 Cyber City, Gurugram",
    gstin: "06AAACT5678B1Z2",
  },
];

const mockItems: InvoiceLineItem[] = [
  {
    id: "l-1",
    item: "Enterprise cloud integration",
    description: "Architecture and migration support",
    hsnSac: "998313",
    quantity: 1,
    unitPrice: 100000,
    discount: 10,
    taxRate: 18,
  },
  {
    id: "l-2",
    item: "Cloud security audit",
    description: "SOC2 compliance review",
    hsnSac: "998315",
    quantity: 2,
    unitPrice: 50000,
    discount: 0,
    taxRate: 18,
  },
];

describe("Create Invoice UI Implementation", () => {
  describe("Customer Section", () => {
    it("renders Customer section heading, search input, and empty state placeholder", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerSection, {
          selectedCustomer: "",
          onSelectCustomer: () => {},
          customers: mockCustomers,
        }),
      );

      expect(html).toContain("Customer");
      expect(html).toContain("Select a customer for this invoice.");
      expect(html).toContain("Search and select a customer...");
      expect(html).toContain("Customer Details");
      expect(html).toContain("Select a customer to view their information.");
    });

    it("displays selected customer details when a customer is chosen", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerSection, {
          selectedCustomer: "Acme Enterprises",
          onSelectCustomer: () => {},
          customers: mockCustomers,
        }),
      );

      expect(html).toContain("Acme Enterprises");
      expect(html).toContain("billing@acme.in");
      expect(html).toContain("14 Tech Park, Whitefield, Bengaluru");
      expect(html).toContain("29AABCA1234F1Z5");
    });

    it("displays accessible validation error message when error prop is present", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerSection, {
          selectedCustomer: "",
          onSelectCustomer: () => {},
          customers: mockCustomers,
          error: "Select a customer before saving.",
        }),
      );

      expect(html).toContain('aria-invalid="true"');
      expect(html).toContain("Select a customer before saving.");
    });
  });

  describe("Invoice Details Section", () => {
    it("renders the 4 fields in one horizontal section with required indicators", () => {
      const html = renderToStaticMarkup(
        createElement(InvoiceDetailsSection, {
          invoiceNumber: "INV-2025-0025",
          onInvoiceNumberChange: () => {},
          issueDate: "2025-01-24",
          onIssueDateChange: () => {},
          dueDate: "2025-02-07",
          onDueDateChange: () => {},
          paymentTerms: "Net 15 days",
          onPaymentTermsChange: () => {},
        }),
      );

      expect(html).toContain("Invoice Details");
      expect(html).toContain("Invoice Number");
      expect(html).toContain("INV-2025-0025");
      expect(html).toContain("Issue Date");
      expect(html).toContain("2025-01-24");
      expect(html).toContain("Due Date");
      expect(html).toContain("2025-02-07");
      expect(html).toContain("Payment Terms");
      expect(html).toContain("Net 15 days");
    });
  });

  describe("Items Section", () => {
    it("renders compact item entry table with all required columns and sample products", () => {
      const html = renderToStaticMarkup(
        createElement(InvoiceItemsSection, {
          items: mockItems,
          onUpdateLine: () => {},
          onAddLine: () => {},
          onRemoveLine: () => {},
        }),
      );

      expect(html).toContain("Items");
      expect(html).toContain("Add products or services to this invoice.");
      expect(html).toContain("Item / Description");
      expect(html).toContain("HSN / SAC");
      expect(html).toContain("Qty");
      expect(html).toContain("Unit Price");
      expect(html).toContain("Discount");
      expect(html).toContain("Tax");
      expect(html).toContain("Amount");
      expect(html).toContain("Add Item");

      // Verify sample product names exist
      expect(sampleProducts.length).toBeGreaterThan(0);
      expect(html).toContain("Enterprise cloud integration");
      expect(html).toContain("Cloud security audit");
    });

    it("disables remove button when only one line item is present", () => {
      const html = renderToStaticMarkup(
        createElement(InvoiceItemsSection, {
          items: [mockItems[0]],
          onUpdateLine: () => {},
          onAddLine: () => {},
          onRemoveLine: () => {},
        }),
      );

      expect(html).toContain("disabled=\"\"");
    });
  });

  describe("Invoice Summary Section", () => {
    it("renders Subtotal, Discount, Taxable Amount, Tax Amount, and prominent Total Amount", () => {
      const totals = calculateInvoiceTotals({
        items: mockItems,
        amountPaid: 0,
      });

      const html = renderToStaticMarkup(
        createElement(InvoiceSummarySection, {
          totals,
        }),
      );

      expect(html).toContain("Invoice Summary");
      expect(html).toContain("Subtotal");
      expect(html).toContain("Discount");
      expect(html).toContain("Taxable Amount");
      expect(html).toContain("Tax Amount");
      expect(html).toContain("Total Amount");

      // Calculations check:
      // Line 1: 1 * 100,000 = 100,000; disc 10% = 10,000; taxable = 90,000; tax 18% = 16,200; total = 106,200
      // Line 2: 2 * 50,000 = 100,000; disc 0 = 0; taxable = 100,000; tax 18% = 18,000; total = 118,000
      // Subtotal: 200,000; Discount: 10,000; Taxable: 190,000; Tax: 34,200; Total: 224,200
      expect(totals.subtotal).toBe(200000);
      expect(totals.discount).toBe(10000);
      expect(totals.taxable).toBe(190000);
      expect(totals.tax).toBe(34200);
      expect(totals.total).toBe(224200);
    });

    it("renders ₹0.00 for empty/initial states matching the reference design", () => {
      const totals = calculateInvoiceTotals({
        items: [
          {
            id: "l-1",
            item: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            taxRate: 18,
          },
        ],
        amountPaid: 0,
      });

      const html = renderToStaticMarkup(
        createElement(InvoiceSummarySection, {
          totals,
        }),
      );

      expect(html).toContain("₹0.00");
    });

    it("renders GST summary with CGST and SGST for intra-state taxMode", () => {
      const totals = calculateInvoiceTotals({
        items: mockItems,
        amountPaid: 0,
      });

      const html = renderToStaticMarkup(
        createElement(InvoiceSummarySection, {
          totals,
          taxMode: "CGST_SGST",
          items: mockItems,
        }),
      );

      expect(html).toContain("GST Summary");
      expect(html).toContain("Central GST (CGST)");
      expect(html).toContain("State GST (SGST)");
      // Tax is 34,200 => CGST = 17,100, SGST = 17,100
      expect(html).toContain("17,100");
    });

    it("renders GST summary with IGST for inter-state taxMode", () => {
      const totals = calculateInvoiceTotals({
        items: mockItems,
        amountPaid: 0,
      });

      const html = renderToStaticMarkup(
        createElement(InvoiceSummarySection, {
          totals,
          taxMode: "IGST",
          items: mockItems,
        }),
      );

      expect(html).toContain("GST Summary");
      expect(html).toContain("Integrated GST (IGST)");
      expect(html).toContain("34,200");
    });
  });

  describe("Additional Charges & Discount Section", () => {
    it("renders charges and discount panels with presets and controls", () => {
      const html = renderToStaticMarkup(
        createElement(AdditionalChargesAndDiscountSection, {
          additionalCharges: 500,
          onAdditionalChargesChange: () => {},
          additionalChargesLabel: "Shipping & Handling",
          onAdditionalChargesLabelChange: () => {},
          additionalDiscount: 10,
          onAdditionalDiscountChange: () => {},
          additionalDiscountType: "percentage",
          onAdditionalDiscountTypeChange: () => {},
          additionalDiscountLabel: "Special Offer",
          onAdditionalDiscountLabelChange: () => {},
        }),
      );

      expect(html).toContain("Additional Charges &amp; Discount");
      expect(html).toContain("Additional Charges");
      expect(html).toContain("Shipping, handling, packaging");
      expect(html).toContain("Shipping &amp; Handling");
      expect(html).toContain("500");
      expect(html).toContain("Additional Discount");
      expect(html).toContain("Special Offer");
      expect(html).toContain("Shipping");
      expect(html).toContain("Packaging");
    });

    it("correctly integrates additional charges and percentage discount into calculateInvoiceTotals", () => {
      const totals = calculateInvoiceTotals({
        items: mockItems,
        amountPaid: 0,
        additionalCharges: 500,
        additionalDiscount: 10,
        additionalDiscountType: "percentage",
      });

      // Subtotal: 200,000, Line items discount: 10,000, Base taxable: 190,000
      // Extra discount (10% of 190,000) = 19,000. Total discount = 29,000
      // Taxable = 190,000 - 19,000 = 171,000
      // Tax = 34,200
      // Total = 171,000 + 34,200 + 500 (extra charges) = 205,700
      expect(totals.subtotal).toBe(200000);
      expect(totals.discount).toBe(29000);
      expect(totals.taxable).toBe(171000);
      expect(totals.tax).toBe(34200);
      expect(totals.additionalCharges).toBe(500);
      expect(totals.total).toBe(205700);
    });
  });

  describe("Additional Information Section", () => {
    it("renders notes and terms textareas with proper placeholders", () => {
      const html = renderToStaticMarkup(
        createElement(AdditionalInfoSection, {
          notes: "Thank you for choosing us.",
          onNotesChange: () => {},
          terms: "Payment due within 15 days.",
          onTermsChange: () => {},
        }),
      );

      expect(html).toContain("Additional Information");
      expect(html).toContain("Notes to Customer");
      expect(html).toContain("Enter any additional notes...");
      expect(html).toContain("Thank you for choosing us.");
      expect(html).toContain("Terms and Conditions");
      expect(html).toContain("Enter terms and conditions...");
      expect(html).toContain("Payment due within 15 days.");
    });
  });

  describe("Validation Logic", () => {
    const validInvoice: Pick<Invoice, "customer" | "issueDate" | "dueDate" | "items"> = {
      customer: "Acme Enterprises",
      issueDate: "2025-01-24",
      dueDate: "2025-02-07",
      items: mockItems,
    };

    it("passes validation with complete valid invoice", () => {
      const errors = validateInvoice(validInvoice);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it("flags missing customer", () => {
      const errors = validateInvoice({ ...validInvoice, customer: "" });
      expect(errors.customer).toBeTruthy();
    });

    it("flags dueDate before issueDate", () => {
      const errors = validateInvoice({
        ...validInvoice,
        issueDate: "2025-02-01",
        dueDate: "2025-01-15",
      });
      expect(errors.dueDate).toBeTruthy();
    });

    it("flags empty line item description or invalid values", () => {
      const errors = validateInvoice({
        ...validInvoice,
        items: [
          {
            id: "l-bad",
            item: "",
            description: "",
            quantity: 0,
            unitPrice: -50,
            discount: 150,
            taxRate: 18,
          },
        ],
      });

      expect(errors["item-0"]).toBeTruthy();
      expect(errors["quantity-0"]).toBeTruthy();
      expect(errors["price-0"]).toBeTruthy();
      expect(errors["discount-0"]).toBeTruthy();
    });
  });

  describe("Shared Component Integration in Invoice Feature", () => {
    it("renders DatePicker trigger with formatted date and hidden input", () => {
      const html = renderToStaticMarkup(
        createElement(InvoiceDetailsSection, {
          invoiceNumber: "INV-2025-0099",
          onInvoiceNumberChange: () => {},
          issueDate: "2025-01-24",
          onIssueDateChange: () => {},
          dueDate: "2025-02-07",
          onDueDateChange: () => {},
          paymentTerms: "Net 30 days",
          onPaymentTermsChange: () => {},
        }),
      );

      // Verify formatted dates on triggers
      expect(html).toContain("24 Jan 2025");
      expect(html).toContain("07 Feb 2025");

      // Verify underlying values for form submissions
      expect(html).toContain('value="2025-01-24"');
      expect(html).toContain('value="2025-02-07"');

      // Verify Select component for payment terms
      expect(html).toContain("Net 30 days");
    });

    it("verifies that changing issueDate validates due date on or after issue date", () => {
      // Valid: due date is on or after issue date
      const valid = validateInvoice({
        customer: "Acme Enterprises",
        issueDate: "2025-01-24",
        dueDate: "2025-01-24",
        items: mockItems,
      });
      expect(valid.dueDate).toBeUndefined();

      // Invalid: due date precedes issue date
      const invalid = validateInvoice({
        customer: "Acme Enterprises",
        issueDate: "2025-02-10",
        dueDate: "2025-02-05",
        items: mockItems,
      });
      expect(invalid.dueDate).toBe("Due date must be on or after issue date.");
    });

    it("renders line items using shared Table and Input components with accurate totals", () => {
      const html = renderToStaticMarkup(
        createElement(InvoiceItemsSection, {
          items: mockItems,
          onUpdateLine: () => {},
          onAddLine: () => {},
          onRemoveLine: () => {},
        }),
      );

      // Verify table markup
      expect(html).toContain("<table");
      expect(html).toContain("<thead");
      expect(html).toContain("<tbody");

      // Verify product values rendered in shared inputs/selects
      expect(html).toContain("Enterprise cloud integration");
      expect(html).toContain("Architecture and migration support");
      expect(html).toContain("1,06,200.00");
    });
  });

  describe("Full-Width Layout Rebalancing", () => {
    it("allocates the largest column share to Item / Description and keeps Amount right-aligned", () => {
      const html = renderToStaticMarkup(
        createElement(InvoiceItemsSection, {
          items: mockItems,
          onUpdateLine: () => {},
          onAddLine: () => {},
          onRemoveLine: () => {},
        }),
      );

      // Item / Description receives largest column share
      expect(html).toContain("w-[36%]");
      expect(html).toContain("min-w-[240px]");
      expect(html).toContain("Item / Description");

      // HSN / SAC receives sufficient room
      expect(html).toContain("w-[11%]");
      expect(html).toContain("min-w-[100px]");

      // Amount column is right-aligned
      expect(html).toContain("text-right");
      expect(html).toContain("Amount");
    });

    it("distributes invoice parameters across 4 balanced columns on desktop and constrains selector", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerSection, {
          selectedCustomer: "Acme Enterprises",
          customers: mockCustomers,
        }),
      );

      // 4-column balanced desktop grid for parameters
      expect(html).toContain("lg:grid-cols-4");
      expect(html).toContain("Invoice Number");
      expect(html).toContain("Issue Date");
      expect(html).toContain("Due Date");
      expect(html).toContain("Payment Terms");

      // Customer select constrained to prevent sparseness across ultrawide monitors
      expect(html).toContain("max-w-2xl");
    });

    it("distributes Additional Information into two balanced desktop columns", () => {
      const html = renderToStaticMarkup(
        createElement(AdditionalInfoSection, {
          notes: "Sample note",
          terms: "Sample terms",
          onNotesChange: () => {},
          onTermsChange: () => {},
        }),
      );

      expect(html).toContain("md:grid-cols-2");
      expect(html).toContain("Notes to Customer");
      expect(html).toContain("Terms and Conditions");
    });

    it("displays customer payment terms badge when selected customer has paymentTerms", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerSection, {
          selectedCustomer: "Acme Enterprises",
          customers: [
            {
              name: "Acme Enterprises",
              email: "billing@acme.in",
              address: "14 Tech Park, Whitefield, Bengaluru",
              gstin: "29AABCA1234F1Z5",
              paymentTerms: "Net 30 days",
            },
          ],
        }),
      );

      expect(html).toContain("Terms:");
      expect(html).toContain("Net 30 days");
    });
  });
});

