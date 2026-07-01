-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID');

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'SUBMITTED',
    "description" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "claimAmount" DOUBLE PRECISION NOT NULL,
    "approvedAmount" DOUBLE PRECISION,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "adminNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claims_claimNumber_key" ON "claims"("claimNumber");

-- CreateIndex
CREATE INDEX "claims_userId_idx" ON "claims"("userId");

-- CreateIndex
CREATE INDEX "claims_policyId_idx" ON "claims"("policyId");

-- CreateIndex
CREATE INDEX "claims_status_idx" ON "claims"("status");

-- CreateIndex
CREATE INDEX "claims_createdAt_idx" ON "claims"("createdAt");
