# Store Rating Web Application

A full-stack, production-ready web application for discovering, managing, and rating stores.

---

## Features

- **Three user roles** — System Admin, Normal User, Store Owner, with role-based dashboards and protected routes
- **Authentication** — JWT-based login/signup shared across all roles, bcrypt password hashing
- **Admin Dashboard** — User and store management with search, filter, sort, and pagination
- **Store Listing** — Normal users browse all stores, submit or edit star ratings (1–5)
- **Owner Dashboard** — Store owners see their average rating, total ratings, and a paginated list of reviewers
- **Change Password** — Available to all authenticated users from the navbar
- **Server-side search, sort, and pagination** — All listing queries are handled on the backend via query params
- **Input validation** — Enforced on both frontend (Zod + React Hook Form) and backend (Zod middleware)
- **Toast notifications** — Success/error feedback on all mutations
- **Responsive UI** — Mobile-friendly sidebar navigation, card grids, and tables

---

## Tech Stack

| Layer       | Technology                                   |
|-------------|----------------------------------------------|
| Frontend    | Next.js 14 (App Router) + TypeScript         |
| Styling     | Tailwind CSS                                 |
| Forms       | React Hook Form + Zod                        |
| Backend     | Node.js + Express.js + TypeScript            |
| Database    | PostgreSQL                                   |
| ORM         | Prisma                                       |
| Auth        | JWT (jsonwebtoken)                           |
| Hashing     | bcryptjs                                     |
| Testing     | Jest + Supertest (backend)                   |

---

## Architecture

```
Rolex/
├── backend/               # Express API
│   ├── prisma/
│   │   ├── schema.prisma  # DB models + enums
│   │   └── seed.ts        # Seed script
│   ├── src/
│   │   ├── config/        # env.ts, prisma.ts
│   │   ├── controllers/   # auth, admin, store, owner
│   │   ├── middleware/     # auth, error, validate, cors
│   │   ├── repositories/  # DB query layer
│   │   ├── routes/        # Route definitions
│   │   ├── services/      # Business logic
│   │   ├── types/         # Shared TS types
│   │   ├── utils/         # response, errors, logger
│   │   ├── validators/    # Zod schemas
│   │   ├── app.ts         # Express app factory
│   │   └── index.ts       # Server entry point
│   └── tests/             # Jest test suites
│
└── frontend/              # Next.js app
    └── src/
        ├── app/           # App Router pages
        │   ├── login/
        │   ├── signup/
        │   ├── admin/     # dashboard, users, stores, add-user, add-store
        │   ├── user/      # stores, stores/[id]
        │   └── owner/     # dashboard, ratings
        ├── components/
        │   ├── layout/    # Sidebar, Navbar, DashboardLayout, ChangePasswordDialog
        │   └── ui/        # Button, Input, Select, Modal, Table, Pagination, Rating,
        │                  #   SearchBar, DashboardCard, Badge, LoadingSpinner, EmptyState, ErrorState, ConfirmDialog
        ├── hooks/         # useAuth, useToast
        ├── lib/           # utils.ts, constants.ts
        ├── providers/     # AuthProvider, ToastProvider
        ├── schemas/       # Zod schemas (auth, admin)
        ├── services/      # Axios API clients (auth, admin, store, owner)
        └── types/         # Shared TS types
```

---

## Database Schema

### User
| Field        | Type     | Notes                          |
|-------------|----------|--------------------------------|
| id           | UUID     | Primary key                    |
| name         | String   | 20–60 chars                    |
| email        | String   | Unique, indexed                |
| passwordHash | String   | bcrypt hash — never exposed    |
| address      | String?  | Max 400 chars                  |
| role         | Role     | SYSTEM_ADMIN / NORMAL_USER / STORE_OWNER |
| createdAt    | DateTime |                                |
| updatedAt    | DateTime |                                |

### Store
| Field     | Type     | Notes                        |
|-----------|----------|------------------------------|
| id        | UUID     | Primary key                  |
| name      | String   | Indexed                      |
| email     | String   |                              |
| address   | String?  | Indexed                      |
| ownerId   | UUID FK  | References User (STORE_OWNER)|
| createdAt | DateTime |                              |
| updatedAt | DateTime |                              |

### Rating
| Field     | Type     | Notes                             |
|-----------|----------|-----------------------------------|
| id        | UUID     | Primary key                       |
| userId    | UUID FK  | References User                   |
| storeId   | UUID FK  | References Store                  |
| rating    | Int      | 1–5                               |
| createdAt | DateTime |                                   |
| updatedAt | DateTime |                                   |

**Unique constraint:** `userId + storeId` — one rating per user per store.  
Overall store rating is always computed live from the `Rating` table (no cached value).

---

## Setup Instructions

### Prerequisites

- Node.js >= 18
- PostgreSQL database (local or hosted)
- npm >= 9

### 1. Clone / navigate to the project

```bash
cd Rolex
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/store_rating"
JWT_SECRET="change-me-to-a-long-random-secret"
JWT_EXPIRES_IN="1d"
PORT=4000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

The `.env.local` file is already included with the development default:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Database Migration Commands

```bash
# From the backend/ directory:

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Generate Prisma client (run after schema changes)
npx prisma generate

# Deploy migrations to production
npx prisma migrate deploy

# Open Prisma Studio (GUI for data browsing)
npx prisma studio
```

---

## Seed Commands

```bash
# From the backend/ directory:
npx prisma db seed
```

This creates:

- 1 System Admin
- 3 Normal Users
- 2 Store Owners
- 5 Stores
- 12 Ratings across various user–store combinations

---

## Development Commands

### Backend

```bash
cd backend

# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start compiled production build
npm start
```

### Frontend

```bash
cd frontend

# Start Next.js development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

---

## Test Commands

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npx jest --coverage
```

Tests cover:
- Signup (normal flow, duplicate email rejection)
- Password hashing (bcrypt, never plain text)
- Login (correct credentials, wrong password, non-existent user)
- Change password (current-password verification)
- Admin user creation (any role)
- Store creation (valid owner, invalid owner, non-existent owner)
- Rating submission and average calculation
- Duplicate rating prevention (upsert behavior)
- Rating modification
- Store listing with user rating
- User details with store info for STORE_OWNER
- Role-based middleware (authenticate, requireRole, 401/403 responses)

---

## API Documentation

### Base URL
```
http://localhost:4000/api
```

### Health Check
```
GET /api/health
```

---

### Auth Routes

| Method | Endpoint                 | Auth     | Description                 |
|--------|--------------------------|----------|-----------------------------|
| POST   | /auth/signup             | Public   | Register as NORMAL_USER     |
| POST   | /auth/login              | Public   | Login (all roles)           |
| GET    | /auth/me                 | Any role | Get current user            |
| POST   | /auth/change-password    | Any role | Change own password         |
| POST   | /auth/logout             | Any role | Logout (client clears token)|

### Admin Routes (SYSTEM_ADMIN only)

| Method | Endpoint           | Description                         |
|--------|--------------------|-------------------------------------|
| GET    | /admin/dashboard   | Stats: total users, stores, ratings |
| GET    | /admin/users       | Paginated, searchable user list     |
| POST   | /admin/users       | Create user (any role)              |
| GET    | /admin/users/:id   | User detail (with store if owner)   |
| GET    | /admin/stores      | Paginated, searchable store list    |
| POST   | /admin/stores      | Create store                        |

**Query params for listings:**
```
?page=1&limit=10&sortBy=name&sortOrder=asc&search=alice&role=NORMAL_USER
```

### Store Routes (authenticated)

| Method | Endpoint              | Auth         | Description                        |
|--------|-----------------------|--------------|------------------------------------|
| GET    | /stores               | All roles    | Paginated store list + user rating |
| GET    | /stores/:id           | All roles    | Single store + user rating         |
| POST   | /stores/:id/rating    | NORMAL_USER  | Submit a rating (1–5)              |
| PUT    | /stores/:id/rating    | NORMAL_USER  | Update existing rating             |

### Owner Routes (STORE_OWNER only)

| Method | Endpoint         | Description                          |
|--------|------------------|--------------------------------------|
| GET    | /owner/dashboard | Store name, avg rating, total ratings|
| GET    | /owner/ratings   | Paginated list of users who rated    |

---

## Sample Login Credentials

| Role         | Email                    | Password     |
|--------------|--------------------------|--------------|
| System Admin | admin@rolex.com          | Admin@123    |
| Normal User  | alice@example.com        | Password@123 |
| Normal User  | bob@example.com          | Password@123 |
| Normal User  | carol@example.com        | Password@123 |
| Store Owner  | owner1@example.com       | Owner@123    |
| Store Owner  | owner2@example.com       | Owner@123    |

> Requires seed data to be loaded: `npx prisma db seed`

---

## How to Run

### Start Backend

```bash
cd backend
# (first time only)
npx prisma migrate dev --name init
npx prisma db seed

# Then:
npm run dev
```

Backend runs at: `http://localhost:4000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:3000`

Open `http://localhost:3000` in your browser. You'll be redirected to `/login`.

---

## Assumptions Made

1. **One store per owner** — Each STORE_OWNER can own at most one store. The admin cannot assign a second store to an owner who already has one.
2. **Store owners cannot rate stores** — Only `NORMAL_USER` role can submit/update ratings. Store owners and admins are blocked at the API level.
3. **JWT is stateless** — Logout clears the token on the client. A Redis-based blocklist could be added for production.
4. **No email verification** — Signup immediately activates the account.
5. **Store email uniqueness** — Not enforced at DB level (only user email is unique); multiple stores may share an email if needed.
6. **Overall rating is computed live** — No cached `averageRating` column in the Store table; always aggregated from the Rating table.

---

## Known Limitations

- No email verification or password reset via email
- No file upload for store images
- No real-time rating updates (no WebSocket)
- JWT logout is client-side only (no server-side token revocation)
- Tests use an in-memory mock of Prisma — integration tests against a real database would require a test DB
