-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "premium" DOUBLE PRECISION NOT NULL,
    "coverageAmount" DOUBLE PRECISION NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quotes_userId_idx" ON "quotes"("userId");

-- CreateIndex
CREATE INDEX "quotes_productId_idx" ON "quotes"("productId");

-- CreateIndex
CREATE INDEX "quotes_expiresAt_idx" ON "quotes"("expiresAt");
