import { describe, expect, it } from "vitest";
import { findNextEnabledOption, findOptionByPrefix } from "./selectNavigation";

const options = [
  { value: "a", label: "Australia" },
  { value: "b", label: "Austria", disabled: true },
  { value: "c", label: "Canada" },
  { value: "d", label: "India" },
];

describe("Select keyboard navigation", () => {
  it("skips disabled options and wraps in both directions", () => {
    expect(findNextEnabledOption(options, 0, 1)).toBe(2);
    expect(findNextEnabledOption(options, 2, -1)).toBe(0);
    expect(findNextEnabledOption(options, 3, 1)).toBe(0);
    expect(findNextEnabledOption(options, 0, -1)).toBe(3);
  });
  it("handles empty and fully disabled lists", () => {
    expect(findNextEnabledOption([], -1, 1)).toBe(-1);
    expect(findNextEnabledOption(options.map((option) => ({ ...option, disabled: true })), -1, 1)).toBe(-1);
  });
  it("finds typed prefixes without selecting unavailable options", () => {
    expect(findOptionByPrefix(options, "ca", 0)).toBe(2);
    expect(findOptionByPrefix(options, "AUS", 0)).toBe(0);
    expect(findOptionByPrefix(options, "zzz", 0)).toBe(-1);
  });
});
