/*
  Warnings:

  - You are about to drop the column `businessName` on the `organization_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNumber` on the `organization_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `registrationType` on the `organization_tax_profile` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `organization_tax_profile` table. All the data in the column will be lost.
  - Added the required column `gstNumber` to the `organization_tax_profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `panNumber` to the `organization_tax_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organization_tax_profile" DROP COLUMN "businessName",
DROP COLUMN "registrationNumber",
DROP COLUMN "registrationType",
DROP COLUMN "taxId",
ADD COLUMN     "gstNumber" TEXT NOT NULL,
ADD COLUMN     "panNumber" TEXT NOT NULL,
ADD COLUMN     "registeredBusinessName" TEXT;
