/*
  Warnings:

  - A unique constraint covering the columns `[clientId,alias]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `province` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "province" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingMethod" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Address_clientId_alias_key" ON "Address"("clientId", "alias");
