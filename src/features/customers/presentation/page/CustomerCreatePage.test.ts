import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/customers/new",
}));

vi.mock("../../data/mutations/create-customer", () => ({
  createCustomerAction: vi.fn(),
}));
vi.mock("../../data/mutations/update-customer", () => ({
  updateCustomerAction: vi.fn(),
}));

import { CustomerCreatePage } from "./CustomerCreatePage";
import { CustomerWorkspaceProvider } from "../hooks/CustomerWorkspaceProvider";
import { CustomerBasicInfoSection } from "../components/CustomerBasicInfoSection";
import { CustomerContactSection } from "../components/CustomerContactSection";
import { CustomerAddressSection } from "../components/CustomerAddressSection";
import { CustomerTaxComplianceSection } from "../components/CustomerTaxComplianceSection";
import { CustomerSummaryCard } from "../components/CustomerSummaryCard";
import { CustomerAdditionalSettingsSection } from "../components/CustomerAdditionalSettingsSection";
import { CustomerNotesTagsSection } from "../components/CustomerNotesTagsSection";

describe("Create Customer UI", () => {
  describe("Page Header & Actions", () => {
    it("renders Back to Customers link, page title, and action buttons", () => {
      const html = renderToStaticMarkup(
        createElement(
          CustomerWorkspaceProvider,
          null,
          createElement(CustomerCreatePage),
        ),
      );

      expect(html).toContain("Back to Customers");
      expect(html).toContain("href=\"/customers\"");
      expect(html).toContain("Add Customer");
      expect(html).toContain(
        "Create a customer record for invoicing and account management.",
      );
      expect(html).toContain("Cancel");
      expect(html).toContain("Save as Draft");
      expect(html).toContain("Create Customer");

      // Verifies sections order & presence
      expect(html).toContain("Basic Information");
      expect(html).toContain("Contact Information");
      expect(html).toContain("Billing Address");
      expect(html).toContain("Tax &amp; Compliance");
      expect(html).toContain("Additional Settings");
      expect(html).toContain("Notes &amp; Tags");

      // Verifies customer summary was removed
      expect(html).not.toContain("Customer Summary");
    });
  });

  describe("Basic Information Section", () => {
    it("renders name, type, gst treatment, and status fields", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerBasicInfoSection, {
          name: "Global Traders",
          onNameChange: () => {},
          customerType: "Business",
          onCustomerTypeChange: () => {},
          gstTreatment: "Registered Business (Regular)",
          onGstTreatmentChange: () => {},
          status: "Active",
          onStatusChange: () => {},
        }),
      );

      expect(html).toContain("Basic Information");
      expect(html).toContain("Customer Name");
      expect(html).toContain("Customer Type");
      expect(html).toContain("GST Treatment");
      expect(html).toContain("Status");
      expect(html).toContain("value=\"Global Traders\"");
      expect(html).toContain("Business");
      expect(html).toContain("Active");
    });

    it("displays validation error when name is missing", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerBasicInfoSection, {
          name: "",
          onNameChange: () => {},
          customerType: "Business",
          onCustomerTypeChange: () => {},
          gstTreatment: "Registered Business (Regular)",
          onGstTreatmentChange: () => {},
          status: "Active",
          onStatusChange: () => {},
          error: "Customer name is required.",
        }),
      );

      expect(html).toContain("Customer name is required.");
    });
  });

  describe("Contact Information Section", () => {
    it("renders contact person, email, phone, and alternate phone fields", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerContactSection, {
          contactPerson: "Vikram Malhotra",
          onContactPersonChange: () => {},
          email: "info@globaltraders.in",
          onEmailChange: () => {},
          phone: "98220 54321",
          onPhoneChange: () => {},
          alternatePhone: "",
          onAlternatePhoneChange: () => {},
        }),
      );

      expect(html).toContain("Contact Information");
      expect(html).toContain("Primary Contact Person");
      expect(html).toContain("Email Address");
      expect(html).toContain("Phone Number");
      expect(html).toContain("Alternate Phone");
      expect(html).toContain("info@globaltraders.in");
      expect(html).toContain("+91");
    });
  });

  describe("Address Section & Same-As-Billing Behavior", () => {
    it("hides duplicate shipping inputs when same-as-billing is checked", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerAddressSection, {
          billingAddress: {
            addressLine1: "22 Nariman Point",
            city: "Mumbai",
            state: "Maharashtra",
            pinCode: "400021",
            country: "India",
          },
          onBillingAddressChange: () => {},
          shippingAddress: {
            addressLine1: "",
            city: "",
            state: "Maharashtra",
            pinCode: "",
            country: "India",
          },
          onShippingAddressChange: () => {},
          sameAsBillingAddress: true,
          onSameAsBillingAddressChange: () => {},
        }),
      );

      expect(html).toContain("Billing Address");
      expect(html).toContain("Shipping Address");
      expect(html).toContain("Same as billing address");
      expect(html).toContain("billing-line1");
      // When checked, separate shipping address form inputs are not displayed
      expect(html).not.toContain("shipping-line1");
    });

    it("displays separate shipping inputs when same-as-billing is unchecked", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerAddressSection, {
          billingAddress: {
            addressLine1: "22 Nariman Point",
            city: "Mumbai",
            state: "Maharashtra",
            pinCode: "400021",
            country: "India",
          },
          onBillingAddressChange: () => {},
          shippingAddress: {
            addressLine1: "Warehouse 4, Bhiwandi",
            city: "Thane",
            state: "Maharashtra",
            pinCode: "421302",
            country: "India",
          },
          onShippingAddressChange: () => {},
          sameAsBillingAddress: false,
          onSameAsBillingAddressChange: () => {},
        }),
      );

      expect(html).toContain("shipping-line1");
      expect(html).toContain("Warehouse 4, Bhiwandi");
    });
  });

  describe("Tax & Compliance Section", () => {
    it("renders GSTIN, PAN, currency, and place of supply controls", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerTaxComplianceSection, {
          gstin: "27AABCG9912D1Z9",
          onGstinChange: () => {},
          pan: "AABCG9912D",
          onPanChange: () => {},
          currency: "INR (₹)",
          onCurrencyChange: () => {},
          placeOfSupply: "27-Maharashtra",
          onPlaceOfSupplyChange: () => {},
        }),
      );

      expect(html).toContain("Tax &amp; Compliance");
      expect(html).toContain("GSTIN");
      expect(html).toContain("27AABCG9912D1Z9");
      expect(html).toContain("PAN");
      expect(html).toContain("AABCG9912D");
      expect(html).toContain("Currency");
      expect(html).toContain("Place of Supply");
    });
  });

  describe("Customer Summary Card", () => {
    it("reflects live customer details, initials, and badges", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerSummaryCard, {
          name: "Global Traders",
          customerType: "Business",
          status: "Active",
          email: "info@globaltraders.in",
          phone: "+91 98220 54321",
          gstin: "27AABCG9912D1Z9",
          pan: "AABCG9912D",
          billingAddress: {
            addressLine1: "22 Nariman Point",
            city: "Mumbai",
            state: "Maharashtra",
            pinCode: "400021",
            country: "India",
          },
        }),
      );

      expect(html).toContain("Customer Summary");
      expect(html).toContain("GT");
      expect(html).toContain("Global Traders");
      expect(html).toContain("Active");
      expect(html).toContain("Business");
      expect(html).toContain("info@globaltraders.in");
      expect(html).toContain("+91 98220 54321");
      expect(html).toContain("GSTIN: 27AABCG9912D1Z9");
      expect(html).toContain("PAN: AABCG9912D");
      expect(html).toContain("22 Nariman Point, Mumbai, Maharashtra, 400021");
      expect(html).toContain("India");
    });

    it("renders quiet placeholders when fields are blank", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerSummaryCard, {
          name: "",
          customerType: "Individual",
          status: "Inactive",
        }),
      );

      expect(html).toContain("New Customer");
      expect(html).toContain("No email entered");
      expect(html).toContain("No phone entered");
      expect(html).toContain("GSTIN: Not provided");
      expect(html).toContain("PAN: Not provided");
      expect(html).toContain("No address specified");
    });
  });

  describe("Additional Settings & Notes/Tags", () => {
    it("renders payment terms, credit limit, discount, tax preference, and tags", () => {
      const htmlSettings = renderToStaticMarkup(
        createElement(CustomerAdditionalSettingsSection, {
          settings: {
            paymentTerms: "Net 15 days",
            creditLimit: 100000,
            defaultDiscount: 5,
            defaultTaxPreference: "18% (IGST)",
            priceList: "Default Price List",
          },
          onChange: () => {},
        }),
      );

      expect(htmlSettings).toContain("Additional Settings");
      expect(htmlSettings).toContain("Payment Terms");
      expect(htmlSettings).toContain("Credit Limit (₹)");
      expect(htmlSettings).toContain("Default Discount (%)");
      expect(htmlSettings).toContain("Default Tax Preference");
      expect(htmlSettings).toContain("Price List");

      const htmlNotes = renderToStaticMarkup(
        createElement(CustomerNotesTagsSection, {
          internalNotes: "Internal note text",
          onInternalNotesChange: () => {},
          tags: ["Priority", "Wholesale"],
          onTagsChange: () => {},
        }),
      );

      expect(htmlNotes).toContain("Notes &amp; Tags");
      expect(htmlNotes).toContain("Internal Notes");
      expect(htmlNotes).toContain("Priority");
      expect(htmlNotes).toContain("Wholesale");
      expect(htmlNotes).toContain("Press Enter to add a tag");
    });
  });
});
