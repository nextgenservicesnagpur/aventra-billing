import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/customers",
}));

import type { CustomerDto } from "../../data/dto/customer-dto";
import { CustomerFilterBar } from "../components/CustomerFilterBar";
import { CustomerTable } from "../components/CustomerTable";
import { Pagination } from "@/shared/components/table";
import { CustomerListPage } from "./CustomerListPage";

const testCustomers: CustomerDto[] = [
  {
    id: "cust-1",
    organizationId: "org-1",
    name: "Global Traders",
    customerType: "BUSINESS",
    gstTreatment: "REGISTERED_BUSINESS_REGULAR",
    status: "ACTIVE",
    contactPerson: "Vikram Malhotra",
    email: "info@globaltraders.in",
    phone: "+91 98220 54321",
    alternatePhone: null,
    billingAddress: {
      addressLine1: "22 Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400021",
      country: "India",
    },
    shippingAddress: {
      addressLine1: "22 Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400021",
      country: "India",
    },
    sameAsBillingAddress: true,
    gstin: "27AABCG9912D1Z9",
    pan: "AABCG9912D",
    currency: "INR (₹)",
    placeOfSupply: "27-Maharashtra",
    paymentTerms: "Net 30 days",
    creditLimit: 250000,
    defaultDiscount: 0,
    defaultTaxPreference: "18% (IGST)",
    priceList: "Default Price List",
    internalNotes: null,
    tags: ["Wholesale"],
    outstandingBalance: 12500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cust-2",
    organizationId: "org-1",
    name: "TechSol Pvt. Ltd.",
    customerType: "BUSINESS",
    gstTreatment: "REGISTERED_BUSINESS_REGULAR",
    status: "ACTIVE",
    contactPerson: "Priya Verma",
    email: "accounts@techsol.in",
    phone: "+91 98112 34567",
    alternatePhone: null,
    billingAddress: {
      addressLine1: "88 Cyber City",
      city: "Gurugram",
      state: "Haryana",
      pinCode: "122002",
      country: "India",
    },
    shippingAddress: {
      addressLine1: "88 Cyber City",
      city: "Gurugram",
      state: "Haryana",
      pinCode: "122002",
      country: "India",
    },
    sameAsBillingAddress: true,
    gstin: "06AAACT5678B1Z2",
    pan: "AAACT5678B",
    currency: "INR (₹)",
    placeOfSupply: "06-Haryana",
    paymentTerms: "Net 15 days",
    creditLimit: 100000,
    defaultDiscount: 0,
    defaultTaxPreference: "18% (IGST)",
    priceList: "Default Price List",
    internalNotes: null,
    tags: ["IT"],
    outstandingBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("Customer List UI", () => {
  describe("Filter Bar", () => {
    it("renders search input, customer type select, and status select", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerFilterBar, {
          query: "",
          onQueryChange: () => {},
          customerType: "All",
          onCustomerTypeChange: () => {},
          status: "All",
          onStatusChange: () => {},
          onReset: () => {},
        }),
      );

      expect(html).toContain("Search customers by name, email, phone, or GSTIN...");
      expect(html).toContain("All Customer Types");
      expect(html).toContain("All Statuses");
      expect(html).not.toContain("Reset");
    });

    it("displays reset button when filters are active", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerFilterBar, {
          query: "Acme",
          onQueryChange: () => {},
          customerType: "BUSINESS",
          onCustomerTypeChange: () => {},
          status: "ACTIVE",
          onStatusChange: () => {},
          onReset: () => {},
        }),
      );

      expect(html).toContain("Reset");
    });
  });

  describe("Customer Table", () => {
    it("renders table headers and customer records", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerTable, {
          customers: testCustomers,
          isFiltered: false,
        }),
      );

      expect(html).toContain("Customer");
      expect(html).toContain("Type");
      expect(html).toContain("Contact");
      expect(html).toContain("GSTIN / Tax ID");
      expect(html).toContain("Balance");
      expect(html).toContain("Status");
      expect(html).toContain("Actions");

      // Verify specific customer rows
      expect(html).toContain("Global Traders");
      expect(html).toContain("27AABCG9912D1Z9");
      expect(html).toContain("TechSol Pvt. Ltd.");
      expect(html).toContain("Active");
    });

    it("renders empty search results state when filtered list has no matches", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerTable, {
          customers: [],
          isFiltered: true,
          onClearFilters: () => {},
        }),
      );

      expect(html).toContain("No matching customers");
      expect(html).toContain("Clear filters");
    });

    it("renders empty state when there are no customers at all", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerTable, {
          customers: [],
          isFiltered: false,
        }),
      );

      expect(html).toContain("No customers yet");
      expect(html).toContain("Add Customer");
    });
  });

  describe("Pagination", () => {
    it("renders pagination with customers item label", () => {
      const html = renderToStaticMarkup(
        createElement(Pagination, {
          currentPage: 1,
          totalPages: 2,
          totalCount: 15,
          pageSize: 8,
          onPageChange: () => {},
          itemName: "customers",
        }),
      );

      expect(html).toContain("Showing");
      expect(html).toContain("1");
      expect(html).toContain("8");
      expect(html).toContain("15");
      expect(html).toContain("customers");
    });
  });

  describe("CustomerListPage integration", () => {
    it("renders complete page with header, Add Customer button, and table", () => {
      const html = renderToStaticMarkup(
        createElement(CustomerListPage, {
          initialCustomers: testCustomers,
        }),
      );

      expect(html).toContain("Customers");
      expect(html).toContain("Manage customer records and billing information.");
      expect(html).toContain("Add Customer");
      expect(html).toContain("href=\"/customers/new\"");
      expect(html).toContain("Global Traders");
    });
  });
});
