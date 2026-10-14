-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('BUSINESS', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "GstTreatment" AS ENUM ('REGISTERED_BUSINESS_REGULAR', 'CONSUMER_UNREGISTERED', 'OVERSEAS_EXPORT', 'SPECIAL_ECONOMIC_ZONE', 'DEEMED_EXPORT', 'COMPOSITION_SCHEME');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerType" "CustomerType" NOT NULL DEFAULT 'BUSINESS',
    "gstTreatment" "GstTreatment" NOT NULL DEFAULT 'REGISTERED_BUSINESS_REGULAR',
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "billingAddressLine1" TEXT,
    "billingAddressLine2" TEXT,
    "billingCity" TEXT,
    "billingState" TEXT,
    "billingPinCode" TEXT,
    "billingCountry" TEXT NOT NULL DEFAULT 'India',
    "sameAsBillingAddress" BOOLEAN NOT NULL DEFAULT true,
    "shippingAddressLine1" TEXT,
    "shippingAddressLine2" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingPinCode" TEXT,
    "shippingCountry" TEXT DEFAULT 'India',
    "gstin" TEXT,
    "pan" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR (₹)',
    "placeOfSupply" TEXT NOT NULL DEFAULT '27-Maharashtra',
    "paymentTerms" TEXT NOT NULL DEFAULT 'Net 15 days',
    "creditLimit" DECIMAL(14,2),
    "defaultDiscount" DECIMAL(5,2),
    "defaultTaxPreference" TEXT NOT NULL DEFAULT '18% (IGST)',
    "priceList" TEXT NOT NULL DEFAULT 'Default Price List',
    "internalNotes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_organizationId_idx" ON "customer"("organizationId");

-- CreateIndex
CREATE INDEX "customer_organizationId_name_idx" ON "customer"("organizationId", "name");

-- CreateIndex
CREATE INDEX "customer_organizationId_email_idx" ON "customer"("organizationId", "email");

-- CreateIndex
CREATE INDEX "customer_organizationId_status_idx" ON "customer"("organizationId", "status");

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
