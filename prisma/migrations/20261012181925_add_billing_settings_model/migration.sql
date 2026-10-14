-- CreateEnum
CREATE TYPE "BillingDocumentType" AS ENUM ('INVOICE', 'DEBIT_NOTE', 'CREDIT_NOTE', 'RECURRING_INVOICE');

-- CreateTable
CREATE TABLE "billing_settings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentType" "BillingDocumentType" NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT 'INV-',
    "suffix" TEXT,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "padding" INTEGER NOT NULL DEFAULT 4,
    "defaultNotes" TEXT,
    "defaultTerms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "billing_settings_organizationId_idx" ON "billing_settings"("organizationId");

-- CreateIndex
CREATE INDEX "billing_settings_organizationId_documentType_idx" ON "billing_settings"("organizationId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "billing_settings_organizationId_documentType_key" ON "billing_settings"("organizationId", "documentType");

-- AddForeignKey
ALTER TABLE "billing_settings" ADD CONSTRAINT "billing_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
