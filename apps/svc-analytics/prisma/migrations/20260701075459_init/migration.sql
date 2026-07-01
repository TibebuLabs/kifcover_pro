-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "service" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_snapshots" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "totalPolicies" INTEGER NOT NULL DEFAULT 0,
    "newPolicies" INTEGER NOT NULL DEFAULT 0,
    "activePolicies" INTEGER NOT NULL DEFAULT 0,
    "totalClaims" INTEGER NOT NULL DEFAULT 0,
    "newClaims" INTEGER NOT NULL DEFAULT 0,
    "grossWrittenPremium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPaymentsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_service_idx" ON "audit_logs"("service");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "daily_snapshots_date_key" ON "daily_snapshots"("date");

-- CreateIndex
CREATE INDEX "daily_snapshots_date_idx" ON "daily_snapshots"("date");
