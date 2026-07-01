-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('TELEBIRR', 'BANK', 'CARD');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "policyId" TEXT,
    "claimId" TEXT,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "PaymentProvider" NOT NULL,
    "providerRef" TEXT,
    "checkoutUrl" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_policyId_idx" ON "payments"("policyId");

-- CreateIndex
CREATE INDEX "payments_claimId_idx" ON "payments"("claimId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");
