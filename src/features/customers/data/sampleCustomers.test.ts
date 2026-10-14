import { describe, expect, it } from "vitest";
import { filterCustomers, sampleCustomers } from "./sampleCustomers";

describe("sampleCustomers and filterCustomers", () => {
  it("provides non-empty realistic sample customers", () => {
    expect(sampleCustomers.length).toBeGreaterThan(0);
    const globalTraders = sampleCustomers.find((c) => c.name === "Global Traders");
    expect(globalTraders).toBeDefined();
    expect(globalTraders?.gstin).toBe("27AABCG9912D1Z9");
  });

  it("filters customers by search query across name, email, phone, and GSTIN", () => {
    const byName = filterCustomers(sampleCustomers, { query: "Acme" });
    expect(byName).toHaveLength(1);
    expect(byName[0]?.name).toBe("Acme Enterprises");

    const byEmail = filterCustomers(sampleCustomers, { query: "techsol" });
    expect(byEmail).toHaveLength(1);
    expect(byEmail[0]?.name).toBe("TechSol Pvt. Ltd.");

    const byGstin = filterCustomers(sampleCustomers, { query: "27AABCG9912D1Z9" });
    expect(byGstin).toHaveLength(1);
    expect(byGstin[0]?.name).toBe("Global Traders");

    const byPhone = filterCustomers(sampleCustomers, { query: "98220" });
    expect(byPhone).toHaveLength(1);
    expect(byPhone[0]?.name).toBe("Global Traders");
  });

  it("filters customers by customerType", () => {
    const businessOnly = filterCustomers(sampleCustomers, {
      customerType: "Business",
    });
    expect(businessOnly.every((c) => c.customerType === "Business")).toBe(true);

    const individualOnly = filterCustomers(sampleCustomers, {
      customerType: "Individual",
    });
    expect(individualOnly.every((c) => c.customerType === "Individual")).toBe(true);
  });

  it("filters customers by status", () => {
    const active = filterCustomers(sampleCustomers, { status: "Active" });
    expect(active.every((c) => c.status === "Active")).toBe(true);

    const inactive = filterCustomers(sampleCustomers, { status: "Inactive" });
    expect(inactive.every((c) => c.status === "Inactive")).toBe(true);
  });

  it("returns full list when all filters are default or empty", () => {
    const all = filterCustomers(sampleCustomers, {
      query: "",
      customerType: "All",
      status: "All",
    });
    expect(all).toHaveLength(sampleCustomers.length);
  });
});
