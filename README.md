# KifCover Pro

Ethiopian embedded insurance platform — 5 role-based microservices, single PostgreSQL database.

## Architecture

```
[Web / Partner API / Mobile / USSD]
           ↓
   [API Gateway :3000]  ← JWT · Role Guard · Swagger
           ↓
┌──────────────────────────────────────┐
│  5 NestJS TCP Microservices          │
│                                      │
│  svc-auth     (3001) 🔐              │
│  svc-customer (3002) 👤              │
│  svc-insurer  (3003) 🏦              │
│  svc-partner  (3004) 🤝              │
│  svc-admin    (3005) 🛡️              │
│                                      │
│  All → PostgreSQL :5432/kifdb        │
└──────────────────────────────────────┘
```

## Service Responsibilities

| Service | Port | Domain |
|---------|------|--------|
| `svc-auth` | 3001 | Register, login, OTP (Telebirr SMS), JWT issuance, password management |
| `svc-customer` | 3002 | Users, KYC verification, quotes, policies, claims, payments |
| `svc-insurer` | 3003 | Insurance products, pricing rules, premium tiers, underwriting rules |
| `svc-partner` | 3004 | Partner accounts, API keys (prod/sandbox), commissions, payouts, webhooks |
| `svc-admin` | 3005 | Platform KPIs, audit logs, compliance flags, user/partner/product management |

## User Roles & Portals

| Role | Portal | Access |
|------|--------|--------|
| `CUSTOMER` | `/dashboard` | Buy insurance, manage policies/claims, payments |
| `PARTNER_ADMIN` | `/partner` | Sell insurance, view commissions, API keys |
| `INSURANCE_PROVIDER` | `/insurer` | Manage products, review claims |
| `PLATFORM_ADMIN` | `/admin` | Full platform oversight, compliance, financials |

## Database

Single PostgreSQL database: **`kifdb`** on port `5432`.

Each service has its own Prisma schema but all connect to the same DB — tables are separated by naming convention.

## Quick Start

### 1. Start database
```bash
cd kifcover_pro
docker compose -f infrastructure/docker-compose.dbs.yml up -d
# or with full stack:
docker compose -f infrastructure/docker-compose.yml up --build
```

### 2. Run migrations
```bash
node infrastructure/migrate-all.js
```

### 3. Seed data
```bash
yarn db:seed
```

### 4. Start services (development)
```bash
yarn dev
# or individually:
yarn dev:auth
yarn dev:customer
yarn dev:insurer
yarn dev:partner
yarn dev:admin
yarn dev:gateway
yarn dev:web
```

## Service Ports

| Service | Port |
|---------|------|
| Web Frontend | 4000 |
| API Gateway | 3000 |
| svc-auth | 3001 |
| svc-customer | 3002 |
| svc-insurer | 3003 |
| svc-partner | 3004 |
| svc-admin | 3005 |

## API Documentation

Swagger UI: `http://localhost:3000/api/docs`

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kifcover.et | Admin@kifcover2024 |
| Customer | demo@kifcover.et | demo123 |
| Partner | partner@kifcover.et | partner123 |
| Insurer | insurer@kifcover.et | insurer123 |

## Key Features (PRD-aligned)

- **Customer Portal** — OTP login, quote-to-policy flow, claim timeline, payment history, KYC
- **Partner Portal** — Embedded insurance workflow, commission ledger, API key management (prod/sandbox), webhook config
- **Insurer Portal** — Product catalog with premium tiers, pricing rules engine, claims queue with FSM transitions
- **Admin Portal** — Platform KPIs, compliance/KYC queue, AML flags, partner approval, financial reconciliation, immutable audit logs
- **Auth** — Email+password and OTP (phone) dual-mode, JWT 7-day, bcrypt(12)
- **Payments** — Telebirr, Bank Transfer, Card; automatic commission split on confirmation

## Tech Stack

- **Backend**: NestJS (TCP microservices), Prisma ORM, PostgreSQL 16
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Material Symbols
- **Auth**: JWT (7-day), bcrypt, OTP via Telebirr SMS API, role-based guards
- **Infrastructure**: Docker Compose, Node.js migration runner
