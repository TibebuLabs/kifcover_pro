-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('NATIONAL_ID', 'SELFIE', 'ADDRESS_PROOF', 'PASSPORT');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "kyc_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DocType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "DocStatus" NOT NULL DEFAULT 'PENDING',
    "ocrData" JSONB,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kyc_records_userId_key" ON "kyc_records"("userId");

-- CreateIndex
CREATE INDEX "kyc_records_status_idx" ON "kyc_records"("status");

-- CreateIndex
CREATE INDEX "kyc_documents_userId_idx" ON "kyc_documents"("userId");

-- AddForeignKey
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "kyc_records"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
