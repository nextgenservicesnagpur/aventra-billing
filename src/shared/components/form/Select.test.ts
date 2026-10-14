import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Select } from "./Select";

describe("Shared Select Component", () => {
  it("renders combobox trigger with accessible ARIA semantics and display label", () => {
    const html = renderToStaticMarkup(
      createElement(
        Select,
        {
          id: "country-select",
          name: "country",
          value: "IN",
          options: [
            { value: "IN", label: "India" },
            { value: "US", label: "United States" },
          ],
        },
      ),
    );

    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain('id="country-select"');
    expect(html).toContain("India");
    expect(html).toContain('name="country"');
  });

  it("renders placeholder when value is empty or unmatched", () => {
    const html = renderToStaticMarkup(
      createElement(
        Select,
        {
          id: "role-select",
          placeholder: "Select your role...",
          value: "",
          options: [
            { value: "admin", label: "Administrator" },
            { value: "viewer", label: "Viewer" },
          ],
        },
      ),
    );

    expect(html).toContain("Select your role...");
    expect(html).toContain("Administrator");
    expect(html).toContain("Viewer");
  });

  it("renders accessible error and validation state attributes", () => {
    const html = renderToStaticMarkup(
      createElement(
        Select,
        {
          id: "error-select",
          "aria-invalid": true,
          "aria-describedby": "error-msg",
          placeholder: "Choose option",
        },
      ),
    );

    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="error-msg"');
    expect(html).toContain("border-danger");
  });

  it("renders disabled state correctly", () => {
    const html = renderToStaticMarkup(
      createElement(
        Select,
        {
          id: "disabled-select",
          disabled: true,
          placeholder: "Disabled selection",
        },
      ),
    );

    expect(html).toContain("disabled");
    expect(html).toContain("cursor-not-allowed");
  });

  it("parses option children correctly and supports string options", () => {
    const html = renderToStaticMarkup(
      createElement(
        Select,
        {
          id: "options-children-select",
          value: "Net 30 days",
        },
        createElement("option", { value: "Net 15 days" }, "Net 15 days"),
        createElement("option", { value: "Net 30 days" }, "Net 30 days"),
      ),
    );

    expect(html).toContain("Net 30 days");
    expect(html).toContain("Net 15 days");
  });
});
