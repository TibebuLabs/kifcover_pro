-- ─────────────────────────────────────────────────────────────────────────────
-- KifCover Pro — Database-per-service initialisation
-- Run once as the postgres superuser:
--   psql -U postgres -f infrastructure/init-databases.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Auth Service
CREATE DATABASE kif_auth;

-- Users / Profile Service
CREATE DATABASE kif_users;

-- Insurance Products Catalog
CREATE DATABASE kif_products;

-- Quote Engine
CREATE DATABASE kif_quotes;

-- Policy Issuance & Lifecycle
CREATE DATABASE kif_policies;

-- Claims Processing
CREATE DATABASE kif_claims;

-- Payments
CREATE DATABASE kif_payments;

-- KYC / Identity Verification
CREATE DATABASE kif_kyc;

-- Partner Management
CREATE DATABASE kif_partners;

-- Analytics & Audit
CREATE DATABASE kif_analytics;

-- Grant all privileges to the application user
-- Replace 'postgres' with a dedicated app user in production
DO $$
DECLARE
  db TEXT;
  databases TEXT[] := ARRAY[
    'kif_auth','kif_users','kif_products','kif_quotes','kif_policies',
    'kif_claims','kif_payments','kif_kyc','kif_partners','kif_analytics'
  ];
BEGIN
  FOREACH db IN ARRAY databases LOOP
    EXECUTE format('GRANT ALL PRIVILEGES ON DATABASE %I TO postgres', db);
  END LOOP;
END;
$$;
