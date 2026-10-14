export type BillingDocumentType =
  | "INVOICE"
  | "DEBIT_NOTE"
  | "CREDIT_NOTE"
  | "RECURRING_INVOICE";

export type BillingSettings = {
  id: string;
  organizationId: string;
  documentType: BillingDocumentType;
  prefix: string;
  suffix: string | null;
  nextNumber: number;
  padding: number;
  defaultNotes: string | null;
  defaultTerms: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DocumentNumberComponents = {
  prefix: string;
  nextNumber: number;
  padding: number;
  suffix?: string | null;
};
