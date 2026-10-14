import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams({ tab: "invoice" }),
  usePathname: () => "/settings/billing",
}));

vi.mock("../../data/mutations/billing-settings-mutations", () => ({
  updateBillingSettingsAction: vi.fn(),
  allocateDocumentNumberAction: vi.fn(),
}));

import { BillingSettingsPage } from "./BillingSettingsPage";
import { DocumentSettingsForm } from "../forms/DocumentSettingsForm";
import { DocumentNumberPreviewCard } from "../components/DocumentNumberPreviewCard";
import type { BillingDocumentType } from "../../domain/entities/billing-settings";
import type { BillingSettingsDto } from "../../data/dto/billing-settings-dto";

const mockSettingsRecord: Record<BillingDocumentType, BillingSettingsDto> = {
  INVOICE: {
    id: "bset-1",
    organizationId: "org-1",
    documentType: "INVOICE",
    prefix: "INV-",
    suffix: null,
    nextNumber: 1,
    padding: 4,
    defaultNotes: "Invoice test notes",
    defaultTerms: "Invoice test terms",
    previewNumber: "INV-0001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  DEBIT_NOTE: {
    id: "bset-2",
    organizationId: "org-1",
    documentType: "DEBIT_NOTE",
    prefix: "DN-",
    suffix: null,
    nextNumber: 5,
    padding: 4,
    defaultNotes: "Debit note test notes",
    defaultTerms: "Debit note test terms",
    previewNumber: "DN-0005",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  CREDIT_NOTE: {
    id: "bset-3",
    organizationId: "org-1",
    documentType: "CREDIT_NOTE",
    prefix: "CN-",
    suffix: null,
    nextNumber: 10,
    padding: 4,
    defaultNotes: "Credit note test notes",
    defaultTerms: "Credit note test terms",
    previewNumber: "CN-0010",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  RECURRING_INVOICE: {
    id: "bset-4",
    organizationId: "org-1",
    documentType: "RECURRING_INVOICE",
    prefix: "REC-",
    suffix: "/2026",
    nextNumber: 2,
    padding: 5,
    defaultNotes: "Recurring template notes",
    defaultTerms: "Recurring template terms",
    previewNumber: "REC-00002/2026",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

describe("BillingSettingsPage Presentation", () => {
  it("renders the page header and all 4 document tabs", () => {
    const html = renderToStaticMarkup(
      createElement(BillingSettingsPage, {
        initialSettings: mockSettingsRecord,
      }),
    );

    expect(html).toContain("Billing Settings");
    expect(html).toContain("Configure document numbering, default notes, and terms for your organization.");
    expect(html).toContain("Invoice");
    expect(html).toContain("Debit Note");
    expect(html).toContain("Credit Note");
    expect(html).toContain("Recurring Invoice");
  });

  it("renders invoice tab content with numbering fields and default notes", () => {
    const html = renderToStaticMarkup(
      createElement(BillingSettingsPage, {
        initialSettings: mockSettingsRecord,
      }),
    );

    expect(html).toContain("Document Numbering");
    expect(html).toContain("INV-");
    expect(html).toContain("Default Notes");
    expect(html).toContain("Invoice test notes");
    expect(html).toContain("Invoice test terms");
    expect(html).toContain("Save Invoice Settings");
  });

  it("renders DocumentNumberPreviewCard with formatted preview", () => {
    const html = renderToStaticMarkup(
      createElement(DocumentNumberPreviewCard, {
        prefix: "INV-",
        nextNumber: 42,
        padding: 4,
        suffix: "/26",
        documentLabel: "Invoice",
      }),
    );

    expect(html).toContain("INV-0042/26");
    expect(html).toContain("Next Invoice Number Preview");
    expect(html).toContain("Format Preview");
  });

  it("renders DocumentSettingsForm for Credit Note with correct labels", () => {
    const html = renderToStaticMarkup(
      createElement(DocumentSettingsForm, {
        documentType: "CREDIT_NOTE",
        initialSettings: mockSettingsRecord.CREDIT_NOTE,
      }),
    );

    expect(html).toContain("Credit Note Configuration");
    expect(html).toContain("CN-");
    expect(html).toContain("Credit note test notes");
    expect(html).toContain("Save Credit Note Settings");
  });
});
