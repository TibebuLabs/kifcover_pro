-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('AUTO', 'HEALTH', 'TRAVEL', 'GADGET', 'LIFE', 'AGRICULTURE');

-- CreateTable
CREATE TABLE "insurance_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "coverageAmount" DOUBLE PRECISION NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "features" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "insurance_products_category_idx" ON "insurance_products"("category");

-- CreateIndex
CREATE INDEX "insurance_products_isActive_idx" ON "insurance_products"("isActive");
