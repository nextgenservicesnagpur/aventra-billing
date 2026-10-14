import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatCustomerAddress,
  getCustomerInitials,
} from "./customer";

describe("customer domain helpers", () => {
  it("computes initials correctly for single-word and multi-word names", () => {
    expect(getCustomerInitials("Global Traders")).toBe("GT");
    expect(getCustomerInitials("Acme")).toBe("AC");
    expect(getCustomerInitials("NextGen Services Nagpur")).toBe("NN");
    expect(getCustomerInitials("")).toBe("CU");
  });

  it("formats customer address cleanly", () => {
    const address = {
      addressLine1: "22 Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400021",
      country: "India",
    };
    expect(formatCustomerAddress(address)).toBe(
      "22 Nariman Point, Mumbai, Maharashtra, 400021",
    );

    expect(formatCustomerAddress()).toBe("");
  });

  it("formats currency in INR format", () => {
    const formatted = formatCurrency(100000, "INR");
    expect(formatted).toContain("1,00,000");
  });
});
