"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  ReceiptText,
  RotateCcw,
  Repeat,
} from "lucide-react";
import { Tabs, type TabItem } from "@/shared/components/Tabs";
import { BillingSettingsHeader } from "../components/BillingSettingsHeader";
import { InvoiceSettingsForm } from "../forms/InvoiceSettingsForm";
import { DebitNoteSettingsForm } from "../forms/DebitNoteSettingsForm";
import { CreditNoteSettingsForm } from "../forms/CreditNoteSettingsForm";
import { RecurringInvoiceSettingsForm } from "../forms/RecurringInvoiceSettingsForm";
import type { BillingDocumentType } from "../../domain/entities/billing-settings";
import type { BillingSettingsDto } from "../../data/dto/billing-settings-dto";

export type BillingSettingsPageProps = {
  initialSettings: Record<BillingDocumentType, BillingSettingsDto>;
};

const TAB_MAPPINGS: Record<string, BillingDocumentType> = {
  invoice: "INVOICE",
  "debit-note": "DEBIT_NOTE",
  "credit-note": "CREDIT_NOTE",
  "recurring-invoice": "RECURRING_INVOICE",
};

export const BillingSettingsPage = ({
  initialSettings,
}: BillingSettingsPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") || "invoice";
  const activeTab = TAB_MAPPINGS[tabParam] ? tabParam : "invoice";

  const tabs: readonly TabItem[] = useMemo(
    () => [
      {
        id: "invoice",
        label: "Invoice",
        icon: <FileText size={16} />,
      },
      {
        id: "debit-note",
        label: "Debit Note",
        icon: <ReceiptText size={16} />,
      },
      {
        id: "credit-note",
        label: "Credit Note",
        icon: <RotateCcw size={16} />,
      },
      {
        id: "recurring-invoice",
        label: "Recurring Invoice",
        icon: <Repeat size={16} />,
      },
    ],
    [],
  );

  const handleTabChange = (tabId: string) => {
    router.replace(`/settings/billing?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <BillingSettingsHeader />

      {/* Horizontal Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        ariaLabel="Billing Document Types"
      />

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === "invoice" && (
          <div
            id="tabpanel-invoice"
            role="tabpanel"
            aria-labelledby="tab-invoice"
            tabIndex={0}
            className="outline-none"
          >
            <InvoiceSettingsForm initialSettings={initialSettings.INVOICE} />
          </div>
        )}

        {activeTab === "debit-note" && (
          <div
            id="tabpanel-debit-note"
            role="tabpanel"
            aria-labelledby="tab-debit-note"
            tabIndex={0}
            className="outline-none"
          >
            <DebitNoteSettingsForm initialSettings={initialSettings.DEBIT_NOTE} />
          </div>
        )}

        {activeTab === "credit-note" && (
          <div
            id="tabpanel-credit-note"
            role="tabpanel"
            aria-labelledby="tab-credit-note"
            tabIndex={0}
            className="outline-none"
          >
            <CreditNoteSettingsForm initialSettings={initialSettings.CREDIT_NOTE} />
          </div>
        )}

        {activeTab === "recurring-invoice" && (
          <div
            id="tabpanel-recurring-invoice"
            role="tabpanel"
            aria-labelledby="tab-recurring-invoice"
            tabIndex={0}
            className="outline-none"
          >
            <RecurringInvoiceSettingsForm
              initialSettings={initialSettings.RECURRING_INVOICE}
            />
          </div>
        )}
      </div>
    </div>
  );
};
