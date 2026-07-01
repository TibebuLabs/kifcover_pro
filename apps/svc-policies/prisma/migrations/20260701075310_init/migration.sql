-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "partnerId" TEXT,
    "quoteId" TEXT,
    "status" "PolicyStatus" NOT NULL DEFAULT 'PENDING',
    "premium" DOUBLE PRECISION NOT NULL,
    "coverageAmount" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pdfUrl" TEXT,
    "qrCode" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "policies_policyNumber_key" ON "policies"("policyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "policies_quoteId_key" ON "policies"("quoteId");

-- CreateIndex
CREATE INDEX "policies_userId_idx" ON "policies"("userId");

-- CreateIndex
CREATE INDEX "policies_partnerId_idx" ON "policies"("partnerId");

-- CreateIndex
CREATE INDEX "policies_status_idx" ON "policies"("status");

-- CreateIndex
CREATE INDEX "policies_createdAt_idx" ON "policies"("createdAt");
