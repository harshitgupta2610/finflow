# FinFlow - Production-Grade Cloud Accounting & Business Management Platform

**FinFlow** is an enterprise-ready, cloud-first accounting and business management system inspired by the functional accounting capabilities of leading Indian accounting products (such as BUSY). FinFlow is built from scratch with an original modern architecture, strict financial double-entry transaction safety, Decimal-precision monetary calculations, multi-tenancy, and multi-branch support.

---

## 🏗️ 1. ARCHITECTURE OVERVIEW

```mermaid
graph TD
    Client[Next.js 14 Web Application / Tailwind / Recharts] -->|REST APIs + JWT| API[NestJS API Gateway]
    
    subgraph NestJS Core Application Architecture
        API --> Auth[Auth & RBAC Module]
        API --> Org[Organization & Company Module]
        API --> FY[Financial Year Module]
        API --> Audit[Audit Logging Engine]
        API --> Acc[Accounting & Double-Entry Engine]
        API --> Inv[Stock & Inventory Engine]
        API --> GST[GST & E-Invoice Provider Mock Service]
    end

    Auth & Org & FY & Audit & Acc -->|Prisma ORM - Decimal Precision| DB[(PostgreSQL Database)]
    API -.->|Future Caching & Queues| Redis[(Redis Storage)]
```

---

## 📁 2. MONOREPO PROJECT STRUCTURE

```text
FinFlow/
├── apps/
│   ├── backend/                 # NestJS 10 REST API Server
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # PostgreSQL Prisma Schema (Decimal precision)
│   │   │   └── seed.ts         # Seeding script for Roles, Permissions, Org & Super Admin
│   │   ├── src/
│   │   │   ├── common/         # JWT Auth Guards, RBAC Permissions Guard, Decorators
│   │   │   ├── prisma/         # Global Prisma Database Service
│   │   │   └── modules/
│   │   │       ├── auth/       # Registration, JWT Auth, Refresh Tokens, Passwords
│   │   │       ├── organization/ # Organization & Company Hierarchy
│   │   │       ├── company/    # Company profiles, GSTIN, PAN, Bank Details
│   │   │       ├── financial-year/ # FY Creation, FY Locking & Active FY Switcher
│   │   │       ├── user/       # User & Role Management
│   │   │       └── audit/      # System Mutation Audit Logs
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── frontend/                # Next.js 14 App Router SaaS Dashboard
│       ├── app/
│       │   ├── page.tsx        # Responsive Financial Dashboard
│       │   ├── login/          # User Login Interface
│       │   ├── register/       # Organisation & Admin Registration
│       │   ├── globals.css     # Dark Mode & Glassmorphism Design System
│       │   ├── layout.tsx
│       │   └── providers.tsx
│       ├── components/
│       │   ├── Header.tsx      # Top Nav with Company & Financial Year Switchers
│       │   ├── Sidebar.tsx     # Navigation Sidebar
│       │   ├── DashboardMetrics.tsx # 12 Financial KPI Cards
│       │   ├── SalesTrendChart.tsx  # Interactive Recharts Area Visualizations
│       │   ├── ReceivablesChart.tsx # Ageing Analysis Bar Visualizations
│       │   ├── RecentTransactionsWidget.tsx # Audited Vouchers Widget
│       │   ├── OverdueInvoicesWidget.tsx   # Receivables Ageing Widget
│       │   └── LowStockWidget.tsx         # Inventory Alert Widget
│       ├── lib/
│       │   ├── api.ts          # Axios Client with Auto Token Refresh
│       │   └── auth-context.tsx# React Auth Context & State
│       ├── Dockerfile
│       └── package.json
│
├── docker-compose.yml           # Multi-container orchestrator (Postgres, Redis, Backend, Frontend)
├── .env.example                 # Environment variable template
├── README.md                    # System architecture documentation
└── package.json                 # Monorepo root workspace config
```

---

## 🗄️ 3. DATABASE ERD & SCHEMAS

### Core Tenant & Accounting Entities:

1. **Organization**: Multi-company container.
2. **Company**: Multi-branch financial entity isolated by GSTIN, PAN, Currency.
3. **Branch**: Branch-level data access control (`isHeadOffice`).
4. **FinancialYear**: FY scoping (`startDate`, `endDate`, `isLocked`, `isCurrent`).
5. **User / Role / UserRole / Permission / RolePermission**: Fine-grained RBAC with system roles (`OWNER`, `ADMIN`, `ACCOUNTANT`, `SALES`, `PURCHASE`, `INVENTORY_MANAGER`, `AUDITOR`, `VIEWER`).
6. **RefreshToken**: Sha256 hashed refresh token session management.
7. **AuditLog**: Transactional record of all data mutations storing `beforeState` & `afterState`.
8. **AccountGroup / Account**: Double-entry chart of accounts using `@db.Decimal(18, 4)`.
9. **Party / Item**: Master definitions for Customers, Suppliers, and SKUs with GST rates.
10. **Voucher / JournalEntry / JournalEntryLine**: Strict balanced entries (`SUM(debit) == SUM(credit)`).

---

## 🔌 4. REST API STRUCTURE

All API routes are prefixed with `/api/v1` and documentable via Swagger OpenAPI at `http://localhost:4000/api/docs`:

### Authentication APIs (`/api/v1/auth`)
* `POST /auth/register` - Create Organization, initial Company, Financial Year & Super User.
* `POST /auth/login` - Authenticate user, receive JWT Access (15m) & Refresh Token (7d).
* `POST /auth/refresh` - Issue new access token pair using valid refresh token.
* `POST /auth/logout` - Revoke refresh token session.
* `GET /auth/me` - Fetch authenticated user profile, roles, and permissions.

### Organization & Company APIs (`/api/v1/organizations`, `/api/v1/companies`)
* `GET /organizations/my` - Fetch current user organization details.
* `GET /companies` - List companies in organization.
* `POST /companies` - Create new company.
* `PUT /companies/:id` - Update company settings and tax configurations.

### Financial Year APIs (`/api/v1/financial-years`)
* `GET /financial-years?companyId=...` - List financial years for company.
* `POST /financial-years` - Create financial year.
* `PUT /financial-years/:id/activate` - Set active financial year.

### Audit Log APIs (`/api/v1/audit-logs`)
* `GET /audit-logs` - Query recent mutation logs.

---

## 🗺️ 5. PHASED ROADMAP & PLAN

- **[x] Phase 1: Foundation & Architecture** (Monorepo, Next.js, NestJS, Prisma Postgres, Auth, Org, Company, Financial Year, Dashboard Shell).
- **[ ] Phase 2: Masters Module** (Chart of Accounts, Party Master, Item Master with Barcodes & Units).
- **[ ] Phase 3: Double-Entry Accounting Engine** (Transactional Voucher Engine, Reversals, Ledger, Trial Balance, Profit & Loss, Balance Sheet).
- **[ ] Phase 4: Sales & Purchase Workflows** (Invoices, Cash/Credit, Quotations, Sales Orders, Purchase Orders, Returns, Tax Inclusivity, PDF Generation).
- **[ ] Phase 5: Stock & Inventory Engine** (Stock Movements, Warehouse Transfers, Stock Valuation, Adjustments).
- **[ ] Phase 6: GST Engine & E-Invoicing** (CGST/SGST/IGST Calculator, Mock Provider, IRN Generation, GSTR-1 & GSTR-3B Reports).
- **[ ] Phase 7: Reporting Engine** (Day Book, Cash/Bank Book, Sales Register, Stock Summary, Export to PDF/Excel).
- **[ ] Phase 8: Multi-User & Branch Security** (Branch isolation, Row-level RBAC).
- **[ ] Phase 9: Bank Reconciliation** (Bank Statement CSV Parser & Auto Matching).
- **[ ] Phase 10: AI Business Assistant** (Intent parsing & user confirmation wrapper).
- **[ ] Phase 11: Manufacturing Module** (Bill of Materials, WIP, Finished Goods).

---

## 🚀 6. COMMANDS TO RUN THE PROJECT

### Option A: Running with Docker Compose (Recommended)
```bash
# Start PostgreSQL, Redis, Backend & Frontend in Docker containers
docker-compose up -d --build
```
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API Gateway**: `http://localhost:4000/api/v1`
- **Swagger API Docs**: `http://localhost:4000/api/docs`

### Option B: Running Locally with Node.js
```bash
# 1. Install dependencies for all workspace apps
npm install

# 2. Setup PostgreSQL database connection in .env
# DATABASE_URL="postgresql://finflow_user:finflow_secure_password@localhost:5432/finflow_db?schema=public"

# 3. Generate Prisma Client & Run Database Migrations/Seed
npm run prisma:generate
npm run prisma:seed

# 4. Start NestJS Backend (Port 4000)
npm run dev:backend

# 5. In a second terminal, start Next.js Frontend (Port 3000)
npm run dev:frontend
```

---

## 🔐 7. DEFAULT DEMO CREDENTIALS

* **Email**: `admin@finflow.com`
* **Password**: `Admin@123`
* **Organization**: `DEMO_ORG` (FinFlow Enterprises Ltd)
* **Company**: `FinFlow Demo Private Limited`
* **Financial Year**: `FY 2024-25`
#   f i n f l o w  
 