-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "applyVat" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "discountPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ClientPricingConfig" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "markupPercentage" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPricingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuration" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientPricingConfig_clientId_key" ON "ClientPricingConfig"("clientId");

-- AddForeignKey
ALTER TABLE "ClientPricingConfig" ADD CONSTRAINT "ClientPricingConfig_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
