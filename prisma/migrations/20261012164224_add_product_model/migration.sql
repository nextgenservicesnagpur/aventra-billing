-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProductType" NOT NULL DEFAULT 'PRODUCT',
    "sku" TEXT,
    "category" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "sellingPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "purchasePrice" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'INR (₹)',
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "hsnSac" TEXT,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "taxPreference" TEXT NOT NULL DEFAULT 'Taxable',
    "trackInventory" BOOLEAN NOT NULL DEFAULT false,
    "reorderPoint" DECIMAL(14,2),
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_organizationId_idx" ON "product"("organizationId");

-- CreateIndex
CREATE INDEX "product_organizationId_type_idx" ON "product"("organizationId", "type");

-- CreateIndex
CREATE INDEX "product_organizationId_status_idx" ON "product"("organizationId", "status");

-- CreateIndex
CREATE INDEX "product_organizationId_name_idx" ON "product"("organizationId", "name");

-- CreateIndex
CREATE INDEX "product_organizationId_sku_idx" ON "product"("organizationId", "sku");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
