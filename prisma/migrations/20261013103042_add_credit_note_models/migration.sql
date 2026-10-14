-- CreateEnum
CREATE TYPE "CreditNoteStatus" AS ENUM ('DRAFT', 'ISSUED', 'CANCELLED');

-- CreateTable
CREATE TABLE "credit_note" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "creditNoteNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerAddress" TEXT,
    "customerGstin" TEXT,
    "customerPlaceOfSupply" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "status" "CreditNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "reason" TEXT NOT NULL,
    "taxMode" TEXT NOT NULL DEFAULT 'CGST_SGST',
    "currency" TEXT NOT NULL DEFAULT 'INR (₹)',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "lineDiscountTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(14,2) NOT NULL,
    "cgst" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgst" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igst" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalTax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_note_item" (
    "id" TEXT NOT NULL,
    "creditNoteId" TEXT NOT NULL,
    "invoiceItemId" TEXT,
    "productId" TEXT,
    "item" TEXT NOT NULL,
    "description" TEXT,
    "hsnSac" TEXT,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "discount" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "taxableAmount" DECIMAL(14,2) NOT NULL,
    "taxAmount" DECIMAL(14,2) NOT NULL,
    "lineTotal" DECIMAL(14,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_note_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credit_note_organizationId_idx" ON "credit_note"("organizationId");

-- CreateIndex
CREATE INDEX "credit_note_organizationId_status_idx" ON "credit_note"("organizationId", "status");

-- CreateIndex
CREATE INDEX "credit_note_organizationId_issueDate_idx" ON "credit_note"("organizationId", "issueDate");

-- CreateIndex
CREATE INDEX "credit_note_invoiceId_idx" ON "credit_note"("invoiceId");

-- CreateIndex
CREATE INDEX "credit_note_customerId_idx" ON "credit_note"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "credit_note_organizationId_creditNoteNumber_key" ON "credit_note"("organizationId", "creditNoteNumber");

-- CreateIndex
CREATE INDEX "credit_note_item_creditNoteId_idx" ON "credit_note_item"("creditNoteId");

-- CreateIndex
CREATE INDEX "credit_note_item_productId_idx" ON "credit_note_item"("productId");

-- CreateIndex
CREATE INDEX "credit_note_item_invoiceItemId_idx" ON "credit_note_item"("invoiceItemId");

-- AddForeignKey
ALTER TABLE "credit_note" ADD CONSTRAINT "credit_note_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note" ADD CONSTRAINT "credit_note_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note" ADD CONSTRAINT "credit_note_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_item" ADD CONSTRAINT "credit_note_item_creditNoteId_fkey" FOREIGN KEY ("creditNoteId") REFERENCES "credit_note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note_item" ADD CONSTRAINT "credit_note_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
