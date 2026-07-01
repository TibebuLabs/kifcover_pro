-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "period" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_slug_key" ON "partners"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "partners_apiKey_key" ON "partners"("apiKey");

-- CreateIndex
CREATE INDEX "payouts_partnerId_idx" ON "payouts"("partnerId");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
