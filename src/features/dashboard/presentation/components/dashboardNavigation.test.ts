import { describe, expect, it } from "vitest";
import { dashboardNavigationSections } from "./dashboardNavigation";

const items = dashboardNavigationSections.flatMap((section) => section.items);

describe("dashboard mega menu navigation", () => {
  it("contains the 14 roadmap categories in product order", () => {
    expect(dashboardNavigationSections.map((section) => section.label)).toEqual([
      "Dashboard",
      "Sales",
      "Billing",
      "Purchases",
      "Expenses",
      "Tax & GST",
      "Products & Services",
      "Inventory & Stock",
      "Parties & Contacts",
      "Banking & Accounting",
      "Reports",
      "Organization & Team",
      "Settings & Integrations",
      "Account & Support",
    ]);
  });

  it("keeps the finalized item count for each category", () => {
    expect(dashboardNavigationSections.map((section) => section.items.length)).toEqual([
      3, 6, 6, 6, 4, 10, 6, 7, 5, 8, 9, 6, 7, 5,
    ]);
  });

  it("includes the required roadmap item metadata", () => {
    const requiredTitles = [
      "Organization Overview",
      "Invoices",
      "Purchase Orders",
      "Expenses",
      "E-Invoice",
      "E-Way Bill",
      "Chart of Accounts",
      "Journal Entries",
      "Integrations",
      "Import & Export",
      "Document Numbering",
      "Billing Settings",
      "Tax Settings",
      "Inventory Settings",
      "Notification Settings",
      "Help & Support",
    ];

    expect(requiredTitles.every((title) => items.some((item) => item.title === title))).toBe(true);

    for (const section of dashboardNavigationSections) {
      expect(section.items.length).toBeGreaterThan(0);
      for (const item of section.items) {
        expect(item.id).not.toBe("");
        expect(item.title).not.toBe("");
        expect(item.description).not.toBe("");
        expect(item.icon).toBeDefined();
        expect(["available", "planned"]).toContain(item.availability);
      }
    }
  });

  it("uses unique IDs and never gives planned items a fake href", () => {
    const ids = items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const item of items) {
      if (item.availability === "planned") {
        expect("href" in item).toBe(false);
      }
    }
  });

  it("has exactly the verified active routes", () => {
    const available = items.filter((item) => item.availability === "available");

    expect(available).toHaveLength(8);
    expect(available.map((item) => item.href).sort()).toEqual([
      "/credit-notes",
      "/customers",
      "/dashboard",
      "/invoices",
      "/organization",
      "/products",
      "/services",
      "/settings/billing",
    ]);
    expect(new Set(available.map((item) => item.href)).size).toBe(8);

    const customersItem = items.find((item) => item.id === "sales-customers");
    expect(customersItem).toBeDefined();
    expect(customersItem?.availability).toBe("available");
    if (customersItem?.availability === "available") {
      expect(customersItem.href).toBe("/customers");
    }

    const invoicesItem = items.find((item) => item.id === "billing-invoices");
    expect(invoicesItem).toBeDefined();
    expect(invoicesItem?.availability).toBe("available");
    if (invoicesItem?.availability === "available") {
      expect(invoicesItem.href).toBe("/invoices");
    }

    const productsItem = items.find((item) => item.id === "products-products");
    expect(productsItem).toBeDefined();
    expect(productsItem?.availability).toBe("available");
    if (productsItem?.availability === "available") {
      expect(productsItem.href).toBe("/products");
    }

    const servicesItem = items.find((item) => item.id === "products-services");
    expect(servicesItem).toBeDefined();
    expect(servicesItem?.availability).toBe("available");
    if (servicesItem?.availability === "available") {
      expect(servicesItem.href).toBe("/services");
    }

    const billingSettingsItem = items.find((item) => item.id === "settings-billing");
    expect(billingSettingsItem).toBeDefined();
    expect(billingSettingsItem?.availability).toBe("available");
    if (billingSettingsItem?.availability === "available") {
      expect(billingSettingsItem.href).toBe("/settings/billing");
    }
  });

  it("contains the complete roadmap item count", () => {
    expect(items).toHaveLength(88);
  });
});
