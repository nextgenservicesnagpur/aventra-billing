import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DatePicker, formatDisplayDate } from "./DatePicker";

describe("Shared DatePicker Component", () => {
  it("renders trigger button with formatted date and hidden input", () => {
    const html = renderToStaticMarkup(
      createElement(DatePicker, {
        id: "invoice-issue-date",
        name: "issueDate",
        value: "2025-01-24",
      }),
    );

    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain("24 Jan 2025");
    expect(html).toContain('type="hidden"');
    expect(html).toContain('value="2025-01-24"');
    expect(html).toContain('name="issueDate"');
  });

  it("renders placeholder when value is empty", () => {
    const html = renderToStaticMarkup(
      createElement(DatePicker, {
        id: "empty-date",
        placeholder: "Select issue date...",
        value: "",
      }),
    );

    expect(html).toContain("Select issue date...");
    expect(html).toContain('value=""');
  });

  it("renders error border and accessible attributes when error is present", () => {
    const html = renderToStaticMarkup(
      createElement(DatePicker, {
        id: "invalid-date",
        "aria-invalid": true,
        "aria-describedby": "date-error",
      }),
    );

    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="date-error"');
    expect(html).toContain("border-danger");
  });

  it("renders disabled state properly", () => {
    const html = renderToStaticMarkup(
      createElement(DatePicker, {
        id: "disabled-date",
        disabled: true,
        value: "2025-01-24",
      }),
    );

    expect(html).toContain("disabled");
    expect(html).toContain("cursor-not-allowed");
  });

  describe("Date calculations & formatting", () => {
    it("correctly handles leap year February (29 days) vs regular year (28 days)", () => {
      // 2024 is a leap year -> Feb has 29 days
      const leapDays = new Date(2024, 2, 0).getDate();
      expect(leapDays).toBe(29);

      // 2025 is not a leap year -> Feb has 28 days
      const regularDays = new Date(2025, 2, 0).getDate();
      expect(regularDays).toBe(28);

      // 2000 was a leap year (divisible by 400) -> 29 days
      const centuryLeap = new Date(2000, 2, 0).getDate();
      expect(centuryLeap).toBe(29);

      // 1900 was not a leap year -> 28 days
      const regularCentury = new Date(1900, 2, 0).getDate();
      expect(regularCentury).toBe(28);
    });

    it("correctly formats date strings without timezone shift", () => {
      expect(formatDisplayDate("2025-01-24")).toBe("24 Jan 2025");
      expect(formatDisplayDate("2025-12-31")).toBe("31 Dec 2025");
      expect(formatDisplayDate("2024-02-29")).toBe("29 Feb 2024");
      expect(formatDisplayDate("")).toBe("");
    });

    it("calculates correct weekday offset for first day of month", () => {
      // Jan 1, 2025 was a Wednesday (day 3)
      const jan1Weekday = new Date(2025, 0, 1).getDay();
      expect(jan1Weekday).toBe(3);

      // Feb 1, 2025 was a Saturday (day 6)
      const feb1Weekday = new Date(2025, 1, 1).getDay();
      expect(feb1Weekday).toBe(6);
    });
  });
});
