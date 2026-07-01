# KifCover Pro — Microservices Monorepo

Embedded Insurance Infrastructure Platform for Ethiopia.
**10 independent NestJS microservices + API Gateway + Next.js 14 frontend**, all in one Git repository.

---

## Architecture

```
                   ┌──────────────────────────────┐
                   │   Next.js 14 Web App         │  :4000
                   │   apps/web                   │
                   └─────────────┬────────────────┘
                                 │ HTTP
                   ┌─────────────▼────────────────┐
                   │   API Gateway                │  :3000
                   │   apps/gateway               │
                   │   · JWT auth & RBAC          │
                   │   · Request routing          │
                   │   · Swagger /api/docs        │
                   └──────┬───────────────────────┘
                          │ NestJS TCP (MessagePattern)
     ┌────────────────────┼──────────────────────────────────┐
     │                    │                                  │
 ┌───▼──────┐  ┌──────────▼──────┐  ┌──────────────────────▼─┐
 │svc-auth  │  │  svc-users      │  │  svc-products           │
 │  :3001   │  │   :3002         │  │   :3003                 │
 └──────────┘  └─────────────────┘  └────────────────────────┘
 ┌──────────┐  ┌─────────────────┐  ┌────────────────────────┐
 │svc-quotes│  │  svc-policies   │  │  svc-claims            │
 │  :3004   │  │   :3005         │  │   :3006                │
 └──────────┘  └─────────────────┘  └────────────────────────┘
 ┌──────────┐  ┌─────────────────┐  ┌────────────────────────┐
 │svc-pay   │  │  svc-kyc        │  │  svc-partners          │
 │  :3007   │  │   :3008         │  │   :3009                │
 └──────────┘  └─────────────────┘  └────────────────────────┘
                   ┌─────────────────┐
                   │  svc-analytics  │
                   │   :3010         │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │   PostgreSQL    │  :5432
                   └─────────────────┘
```

**Communication model:**
- Browser/Web → Gateway: **HTTP REST**
- Gateway → Services: **NestJS TCP** (`MessagePattern` / `MSG.*` constants)
- Domain contracts: **`packages/shared-types`** (enums, DTOs, `MSG.*`)
- Event schemas: **`packages/shared-events`** (ready for Redis/RabbitMQ upgrade)

---

## Repo Structure

```
kifcover_pro/
├── apps/
│   ├── gateway/          API Gateway — HTTP entry point, JWT, routing
│   ├── svc-auth/         Authentication & JWT issuance           :3001
│   ├── svc-users/        User management & profiles              :3002
│   ├── svc-products/     Insurance product catalog               :3003
│   ├── svc-quotes/       Dynamic premium calculation engine      :3004
│   ├── svc-policies/     Policy issuance & lifecycle             :3005
│   ├── svc-claims/       Claims FSM workflow                     :3006
│   ├── svc-payments/     Payment initiation & confirmation       :3007
│   ├── svc-kyc/          KYC document upload & verification      :3008
│   ├── svc-partners/     Partner management & API keys           :3009
│   ├── svc-analytics/    Platform KPIs & trend analytics         :3010
│   └── web/              Next.js 14 App Router frontend          :4000
├── packages/
│   ├── prisma/           Shared Prisma schema, migrations, seed
│   ├── shared-types/     MSG.* constants, DTOs, enums
│   └── shared-events/    Domain event contracts
├── infrastructure/
│   ├── docker-compose.yml
│   ├── Dockerfile.service
│   └── Dockerfile.web
├── .env.example
└── README.md
```

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+ and Yarn (`npm i -g yarn`)
- PostgreSQL running locally

### 1. Install

```bash
yarn install
```

### 2. Configure environment

```bash
cp .env.example apps/gateway/.env
# Each service has a pre-filled .env in apps/svc-*/.env
# Update DATABASE_URL in each if your Postgres credentials differ
```

### 3. Run database migrations + seed

```bash
# From repo root
DATABASE_URL="postgresql://postgres:yourpass@localhost:5432/kifcoverdb" yarn db:migrate
DATABASE_URL="postgresql://postgres:yourpass@localhost:5432/kifcoverdb" node packages/prisma/seed.js
```

### 4. Start all services

```bash
yarn dev
# Starts: gateway + 10 microservices + web app in parallel with coloured output
```

Or start individual services:

```bash
yarn dev:gateway    # → http://localhost:3000
yarn dev:auth       # → TCP :3001
yarn dev:products   # → TCP :3003
yarn dev:web        # → http://localhost:4000
```

---

## Service / Port Map

| App | Role | Port |
|-----|------|------|
| `gateway` | HTTP API entry point, Swagger | 3000 |
| `svc-auth` | Register, login, JWT | 3001 |
| `svc-users` | User CRUD, profiles | 3002 |
| `svc-products` | Insurance product catalog | 3003 |
| `svc-quotes` | Dynamic quote/premium engine | 3004 |
| `svc-policies` | Policy issuance & management | 3005 |
| `svc-claims` | Claims FSM (submit → review → pay) | 3006 |
| `svc-payments` | Telebirr / bank payment flow | 3007 |
| `svc-kyc` | Document upload & KYC verification | 3008 |
| `svc-partners` | Partner registration & API keys | 3009 |
| `svc-analytics` | KPIs, trends, GWP | 3010 |
| `web` | Next.js 14 frontend | 4000 |
| PostgreSQL | Shared database | 5432 |

---

## URLs

| What | URL |
|------|-----|
| Web App | http://localhost:4000 |
| API Gateway | http://localhost:3000/api/v1 |
| Swagger Docs | http://localhost:3000/api/docs |

---

## Demo Credentials

After running seed:

| Role | Email | Password |
|------|-------|----------|
| Platform Admin | admin@kifcover.et | Admin@kifcover2024 |

---

## Docker

```bash
# Build and start everything (postgres + all services + web)
yarn docker:up

# Tail logs
yarn docker:logs

# Stop
yarn docker:down
```

---

## Upgrading to Event-Driven (Redis/RabbitMQ)

All services use `Transport.TCP` for sync calls. The `packages/shared-events` contracts are ready for async messaging.

To switch a service to Redis:

```typescript
// In any service main.ts — replace TCP with:
transport: Transport.REDIS,
options: { host: 'redis', port: 6379 }
```

No business logic changes needed — only the transport layer changes.
