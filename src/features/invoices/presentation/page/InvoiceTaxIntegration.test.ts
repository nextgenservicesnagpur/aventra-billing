import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { CustomerSection } from "../components/CustomerSection";
import { InvoiceSummarySection } from "../components/InvoiceSummarySection";
import { InvoiceDocument } from "../components/InvoiceDocument";
import {
  calculateInvoiceTotals,
  type Invoice,
  type InvoiceLineItem,
} from "../../domain/invoice";
import {
  determineTaxMode,
  validateServerTaxDecision,
} from "../../domain/rules/tax-rules";
import type { CustomerDto } from "@/features/customers/data/dto/customer-dto";

const karnatakaCustomer: CustomerDto = {
  id: "cust-karnataka",
  organizationId: "org-1",
  name: "Southern Cloud Tech Ltd",
  customerType: "BUSINESS",
  gstTreatment: "REGISTERED_BUSINESS_REGULAR",
  status: "ACTIVE",
  billingAddress: {
    addressLine1: "100 MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pinCode: "560001",
    country: "India",
  },
  shippingAddress: {
    addressLine1: "100 MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pinCode: "560001",
    country: "India",
  },
  sameAsBillingAddress: true,
  gstin: "29AABCA1234F1Z5",
  currency: "INR (₹)",
  placeOfSupply: "29-Karnataka",
  paymentTerms: "Net 30 days",
  defaultTaxPreference: "18% (IGST)",
  priceList: "Default Price List",
  tags: [],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const maharashtraCustomer: CustomerDto = {
  id: "cust-maharashtra",
  organizationId: "org-1",
  name: "Western Systems Pvt Ltd",
  customerType: "BUSINESS",
  gstTreatment: "REGISTERED_BUSINESS_REGULAR",
  status: "ACTIVE",
  billingAddress: {
    addressLine1: "50 Nariman Point",
    city: "Mumbai",
    state: "Maharashtra",
    pinCode: "400021",
    country: "India",
  },
  shippingAddress: {
    addressLine1: "50 Nariman Point",
    city: "Mumbai",
    state: "Maharashtra",
    pinCode: "400021",
    country: "India",
  },
  sameAsBillingAddress: true,
  gstin: "27NGPI00837E1D7",
  currency: "INR (₹)",
  placeOfSupply: "27-Maharashtra",
  paymentTerms: "Net 15 days",
  defaultTaxPreference: "18% (GST)",
  priceList: "Default Price List",
  tags: [],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const sampleItems: InvoiceLineItem[] = [
  {
    id: "item-1",
    item: "Cloud Infrastructure Setup",
    description: "Multi-region cluster provisioning",
    quantity: 2,
    unitPrice: 50000,
    discount: 10, // Subtotal = 100,000, Discount = 10,000, Taxable = 90,000
    taxRate: 18,  // Tax = 16,200
  },
];

describe("Invoice Place of Supply Integration Tests (Section 8)", () => {
  const supplierState = "27-Maharashtra";
  const supplierGstin = "27AAACN1234F1Z5";

  // 8. Customer Place of Supply persists correctly
  it("8. Customer Place of Supply is preserved in customer model and DTO", () => {
    expect(karnatakaCustomer.placeOfSupply).toBe("29-Karnataka");
    expect(maharashtraCustomer.placeOfSupply).toBe("27-Maharashtra");
  });

  // 9. Selecting Karnataka customer derives IGST based on Place of Supply
  it("9. Selecting Karnataka customer derives IGST based on Place of Supply", () => {
    const decision = determineTaxMode({
      supplierState,
      supplierGstin,
      customerPlaceOfSupply: karnatakaCustomer.placeOfSupply,
      customerGstin: karnatakaCustomer.gstin,
      gstTreatment: karnatakaCustomer.gstTreatment,
    });

    expect(decision.isValid).toBe(true);
    expect(decision.isInterState).toBe(true);
    expect(decision.taxMode).toBe("IGST");
    expect(decision.supplierStateCode).toBe("27");
    expect(decision.customerStateCode).toBe("29");
  });

  // 10. Changing customers recalculates the tax treatment correctly
  it("10. Changing customers from Karnataka to Maharashtra recalculates taxMode to CGST_SGST", () => {
    // Step 1: Select Karnataka
    const decisionKarnataka = determineTaxMode({
      supplierState,
      supplierGstin,
      customerPlaceOfSupply: karnatakaCustomer.placeOfSupply,
      customerGstin: karnatakaCustomer.gstin,
    });
    expect(decisionKarnataka.taxMode).toBe("IGST");

    // Step 2: Switch to Maharashtra
    const decisionMaharashtra = determineTaxMode({
      supplierState,
      supplierGstin,
      customerPlaceOfSupply: maharashtraCustomer.placeOfSupply,
      customerGstin: maharashtraCustomer.gstin,
    });
    expect(decisionMaharashtra.taxMode).toBe("CGST_SGST");
    expect(decisionMaharashtra.isInterState).toBe(false);
  });

  // 11. Invoice summary displays the same breakdown as the underlying calculation
  it("11. Invoice summary displays the same breakdown as the underlying calculation", () => {
    // For Karnataka Customer (IGST)
    const igstTotals = calculateInvoiceTotals({
      items: sampleItems,
      amountPaid: 0,
      taxMode: "IGST",
    });

    expect(igstTotals.taxable).toBe(90000);
    expect(igstTotals.tax).toBe(16200);
    expect(igstTotals.igst).toBe(16200);
    expect(igstTotals.cgst).toBe(0);
    expect(igstTotals.sgst).toBe(0);

    const igstHtml = renderToStaticMarkup(
      createElement(InvoiceSummarySection, {
        totals: igstTotals,
        taxMode: "IGST",
        items: sampleItems,
      }),
    );

    expect(igstHtml).toContain("Integrated GST (IGST)");
    expect(igstHtml).toContain("16,200");
    expect(igstHtml).not.toContain("Central GST (CGST)");

    // For Maharashtra Customer (CGST + SGST)
    const intraTotals = calculateInvoiceTotals({
      items: sampleItems,
      amountPaid: 0,
      taxMode: "CGST_SGST",
    });

    expect(intraTotals.taxable).toBe(90000);
    expect(intraTotals.tax).toBe(16200);
    expect(intraTotals.cgst).toBe(8100);
    expect(intraTotals.sgst).toBe(8100);
    expect(intraTotals.igst).toBe(0);

    const intraHtml = renderToStaticMarkup(
      createElement(InvoiceSummarySection, {
        totals: intraTotals,
        taxMode: "CGST_SGST",
        items: sampleItems,
      }),
    );

    expect(intraHtml).toContain("Central GST (CGST)");
    expect(intraHtml).toContain("State GST (SGST)");
    expect(intraHtml).toContain("8,100");
    expect(intraHtml).not.toContain("Integrated GST (IGST)");
  });

  // 12. Preview and server-side calculation agree
  it("12. Preview and calculation agree on tax type and amounts", () => {
    const invoice: Invoice = {
      id: "inv-test-1",
      number: "INV-2026-0001",
      customer: karnatakaCustomer.name,
      customerEmail: karnatakaCustomer.email ?? "",
      customerAddress: "100 MG Road, Bengaluru, Karnataka, 560001",
      customerGstin: karnatakaCustomer.gstin ?? "",
      customerPlaceOfSupply: karnatakaCustomer.placeOfSupply,
      issueDate: "2026-02-01",
      dueDate: "2026-03-03",
      status: "Draft",
      taxMode: "IGST",
      notes: "",
      paymentTerms: "Net 30 days",
      terms: "",
      items: sampleItems,
      amountPaid: 0,
    };

    const totals = calculateInvoiceTotals(invoice);
    const html = renderToStaticMarkup(createElement(InvoiceDocument, { invoice }));

    expect(html).toContain("Place of Supply: 29-Karnataka");
    expect(html).toContain("IGST");
    expect(html).toContain("16,200");
    expect(html).not.toContain("CGST");
    expect(html).not.toContain("SGST");
    expect(totals.igst).toBe(16200);
  });

  // 13. No invoice charges both IGST and CGST + SGST on the same taxable amount
  it("13. No invoice charges both IGST and CGST + SGST on the same taxable amount", () => {
    const igstTotals = calculateInvoiceTotals({
      items: sampleItems,
      amountPaid: 0,
      taxMode: "IGST",
    });
    expect(igstTotals.igst).toBe(16200);
    expect(igstTotals.cgst).toBe(0);
    expect(igstTotals.sgst).toBe(0);

    const intraTotals = calculateInvoiceTotals({
      items: sampleItems,
      amountPaid: 0,
      taxMode: "CGST_SGST",
    });
    expect(intraTotals.cgst + intraTotals.sgst).toBe(16200);
    expect(intraTotals.igst).toBe(0);
  });

  // 14. CustomerSection renders customer Place of Supply
  it("14. CustomerSection displays Place of Supply correctly", () => {
    const html = renderToStaticMarkup(
      createElement(CustomerSection, {
        selectedCustomer: karnatakaCustomer.name,
        customers: [
          {
            name: karnatakaCustomer.name,
            email: karnatakaCustomer.email ?? "",
            address: "100 MG Road, Bengaluru",
            gstin: karnatakaCustomer.gstin ?? "",
            placeOfSupply: karnatakaCustomer.placeOfSupply,
            paymentTerms: karnatakaCustomer.paymentTerms,
          },
        ],
      }),
    );

    expect(html).toContain("Place of Supply");
    expect(html).toContain("29-Karnataka");
  });

  // 15. Manipulated client tax breakdown cannot bypass server-side validation
  it("15. Manipulated client tax breakdown cannot bypass server-side validation", () => {
    // Client sends CGST_SGST for a Karnataka supply from a Maharashtra supplier
    const result = validateServerTaxDecision({
      invoiceTaxMode: "CGST_SGST",
      supplierState,
      supplierGstin,
      customerPlaceOfSupply: karnatakaCustomer.placeOfSupply,
    });

    expect(result.isValid).toBe(false);
    expect(result.expectedTaxMode).toBe("IGST");
    expect(result.error).toContain("Tax treatment mismatch");
  });
});
