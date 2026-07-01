# KifCover Pro — Microservices Monorepo

Embedded Insurance Infrastructure Platform for Ethiopia.  
Built as a **microservices monorepo** — 10 independent services + 1 API Gateway + 1 Next.js frontend, all in one Git repo.

---

## Architecture

```
                        ┌─────────────────────────┐
                        │   Next.js Web App        │  :4000
                        │   (apps/web)             │
                        └────────────┬────────────┘
                                     │ HTTP
                        ┌────────────▼────────────┐
                        │   API Gateway           │  :3000
                        │   (apps/gateway)        │
                        │   JWT auth, routing,    │
                        │   Swagger docs          │
                        └──────┬──────────────────┘
                               │ NestJS TCP
          ┌────────────────────┼────────────────────────────┐
          │                    │                            │
    ┌─────▼──────┐  ┌──────────▼──────┐  ┌────────────────▼──┐
    │ svc-auth   │  │  svc-users      │  │  svc-products      │
    │  :3001     │  │   :3002         │  │   :3003            │
    └────────────┘  └─────────────────┘  └────────────────────┘
    ┌────────────┐  ┌─────────────────┐  ┌────────────────────┐
    │ svc-quotes │  │  svc-policies   │  │  svc-claims        │
    │  :3004     │  │   :3005         │  │   :3006            │
    └────────────┘  └─────────────────┘  └────────────────────┘
    ┌────────────┐  ┌─────────────────┐  ┌────────────────────┐
    │svc-payments│  │  svc-kyc        │  │  svc-partners      │
    │  :3007     │  │   :3008         │  │   :3009            │
    └────────────┘  └─────────────────┘  └────────────────────┘
                        ┌─────────────────┐
                        │  svc-analytics  │
                        │   :3010         │
                        └─────────────────┘
                               │
                        ┌──────▼──────────┐
                        │   PostgreSQL    │  :5432
                        └─────────────────┘
```

**Communication:**
- Client → Gateway: **HTTP/REST**
- Gateway → Services: **NestJS TCP** (MessagePattern)
- Domain events: **shared-events** contracts (ready for Redis/RabbitMQ upgrade)

---

## Repo Structure

```
kifcover_pro/
├── apps/
│   ├── gateway/          API Gateway — routes all HTTP to TCP services
│   ├── svc-auth/         Authentication, JWT issuance
│   ├── svc-users/        User CRUD, profile management
│   ├── svc-products/     Insurance product catalog
│   ├── svc-quotes/       Dynamic premium calculation engine
│   ├── svc-policies/     Policy issuance & lifecycle
│   ├── svc-claims/       Claims submission & FSM workflow
│   ├── svc-payments/     Payment initiation & confirmation
│   ├── svc-kyc/          Identity verification & document upload
│   ├── svc-partners/     Partner management & API keys
│   ├── svc-analytics/    Platform KPIs & trends
│   ├── api/              Legacy monolith (kept for reference)
│   └── web/              Next.js 14 frontend
├── packages/
│   ├── shared-types/     DTOs, enums, message pattern constants (MSG.*)
│   └── shared-events/    Domain event contracts
├── infrastructure/
│   ├── docker-compose.yml
│   ├── Dockerfile.service
│   └── Dockerfile.web
└── README.md
```

---

## Running Locally (Dev Mode)

### Prerequisites
- Node.js 20+
- Yarn (`npm install -g yarn`)
- PostgreSQL running locally

### 1. Install dependencies

```bash
yarn install
```

### 2. Set up environment

```bash
cp .env.example apps/gateway/.env
# Each service has its own .env already pre-configured in apps/svc-*/.env
# Update DATABASE_URL in each if your Postgres credentials differ
```

### 3. Run database migrations

```bash
# From apps/api (Prisma lives here)
cd apps/api
node_modules/.bin/prisma migrate dev
```

### 4. Start all services

```bash
# From repo root — starts all 10 services + gateway + web in parallel
yarn dev
```

Or start individual services:

```bash
yarn dev:gateway    # API Gateway      → localhost:3000
yarn dev:auth       # Auth Service     → TCP :3001
yarn dev:users      # Users Service    → TCP :3002
yarn dev:products   # Products Service → TCP :3003
yarn dev:quotes     # Quotes Service   → TCP :3004
yarn dev:policies   # Policies Service → TCP :3005
yarn dev:claims     # Claims Service   → TCP :3006
yarn dev:payments   # Payments Service → TCP :3007
yarn dev:kyc        # KYC Service      → TCP :3008
yarn dev:partners   # Partners Service → TCP :3009
yarn dev:analytics  # Analytics Service→ TCP :3010
yarn dev:web        # Next.js Frontend → localhost:4000
```

### URLs in dev

| Service | URL |
|---------|-----|
| Web App | http://localhost:4000 |
| API Gateway | http://localhost:3000/api/v1 |
| Swagger Docs | http://localhost:3000/api/docs |

---

## Running with Docker

```bash
# Build and start everything
yarn docker:up

# View logs
yarn docker:logs

# Stop
yarn docker:down
```

---

## Service Port Map

| Service | Protocol | Port |
|---------|----------|------|
| API Gateway | HTTP | 3000 |
| svc-auth | TCP | 3001 |
| svc-users | TCP | 3002 |
| svc-products | TCP | 3003 |
| svc-quotes | TCP | 3004 |
| svc-policies | TCP | 3005 |
| svc-claims | TCP | 3006 |
| svc-payments | TCP | 3007 |
| svc-kyc | TCP | 3008 |
| svc-partners | TCP | 3009 |
| svc-analytics | TCP | 3010 |
| Web Frontend | HTTP | 4000 |
| PostgreSQL | TCP | 5432 |

---

## Deploying Individual Services

Each service is independently deployable:

```bash
# Build just one service
yarn build:claims

# Deploy svc-claims independently
docker build --build-arg SERVICE=svc-claims \
  -f infrastructure/Dockerfile.service \
  -t kifcover/svc-claims:latest .
```

Scale horizontally with:
```bash
docker compose up --scale svc-claims=3
```

---

## Upgrading to Redis/RabbitMQ

The `packages/shared-events` contracts are ready.  
Replace `Transport.TCP` with `Transport.REDIS` or `Transport.RMQ` in each service's `main.ts`:

```typescript
// Before (TCP)
transport: Transport.TCP, options: { host, port }

// After (Redis)
transport: Transport.REDIS, options: { host: 'redis', port: 6379 }
```
