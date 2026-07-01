-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'PARTNER_ADMIN', 'PLATFORM_ADMIN', 'INSURANCE_PROVIDER');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "partnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_phone_key" ON "user_profiles"("phone");

-- CreateIndex
CREATE INDEX "user_profiles_email_idx" ON "user_profiles"("email");

-- CreateIndex
CREATE INDEX "user_profiles_partnerId_idx" ON "user_profiles"("partnerId");
