# Task Management Application

Aplikasi fullstack task management berbasis monorepo untuk technical test Fullstack Developer. Fokus utama implementasi ini adalah API design yang rapi, UI dashboard yang usable, error handling konsisten, dan code structure yang maintainable.

## Features

### Authentication
- Register user
- Login user
- Get current user (`/api/auth/me`)
- JWT access token auth

### Task Management
- Create, list, detail, update, delete task
- Task scoped per authenticated user
- Duplicate title prevention per user (case-insensitive + whitespace-insensitive)
- Search by title
- Filter by status
- Page-based pagination

### Frontend Dashboard
- Stats cards (Total, Todo, In Progress, Done, Canceled)
- Search + filter toolbar
- Paginated task list (desktop table + mobile cards)
- Create/edit task via right-side drawer
- Delete confirmation dialog
- Loading / error / empty states

## Tech Stack

### Backend
- Express.js
- TypeScript
- Prisma ORM
- MySQL
- Zod validation
- JWT (`jsonwebtoken`)
- bcrypt
- Vitest + Supertest

### Frontend
- React + Vite + TypeScript
- React Router
- TanStack Query
- Zustand
- React Hook Form + Zod
- Tailwind CSS + shadcn/ui style primitives

### Monorepo
- Yarn Workspaces (classic)

## Architecture Overview

Project memakai lightweight clean architecture:
- Domain logic terpisah dari HTTP layer.
- Use-case berada di application layer.
- Prisma implementation berada di infrastructure layer.
- Controller tipis: hanya mapping request/response ke use-case.

Tujuannya: tetap clean dan extensible, tapi tidak overengineering untuk scope technical test.

## Monorepo Structure

```text
.
├── apps
│   ├── api
│   │   ├── prisma
│   │   └── src
│   └── web
│       └── src
├── packages
│   └── shared
└── docker
    └── mysql
        └── init
```

## Backend Architecture (apps/api)

```text
src
├── domain
│   └── entities
├── application
│   ├── auth
│   ├── tasks
│   ├── health
│   └── contracts
├── infrastructure
│   ├── prisma
│   ├── repositories
│   └── security
├── presentation
│   └── http
│       ├── controllers
│       ├── routes
│       ├── middlewares
│       ├── schemas
│       └── dependencies
└── shared
    ├── config
    ├── errors
    ├── http
    └── validation
```

## Frontend Architecture (apps/web)

```text
src
├── app
│   ├── providers
│   └── router
├── features
│   ├── auth
│   └── tasks
├── shared
│   ├── components
│   └── lib
└── index.css
```

Prinsip state:
- TanStack Query: server state (fetch/mutation/invalidation).
- Zustand: UI-only state (drawer state, selected task).

## Database Schema Overview

### User
- `id` (PK)
- `name`
- `email` (unique)
- `passwordHash`
- `createdAt`
- `updatedAt`

### Task
- `id` (PK)
- `userId` (FK -> User)
- `title`
- `normalizedTitle`
- `description`
- `status` (`todo | in_progress | done | canceled`)
- `createdAt`
- `updatedAt`

### Constraints & Indexes
- Unique: `users.email`
- Unique: `(tasks.userId, tasks.normalizedTitle)`
- Index: `tasks.userId`
- Index: `tasks.status`
- Index: `tasks.createdAt`
- Composite index: `(tasks.userId, tasks.status)`

## API Documentation

Base URL default: `http://localhost:4000`

### Auth Endpoints

#### `POST /api/auth/register`
- Body:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- Response: `201`

#### `POST /api/auth/login`
- Body:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- Response: `200`

#### `GET /api/auth/me`
- Header: `Authorization: Bearer <access_token>`
- Response: `200`

### Task Endpoints

Semua endpoint task butuh header:
- `Authorization: Bearer <access_token>`

#### `POST /api/tasks`
- Body:
  ```json
  {
    "title": "Write docs",
    "description": "Prepare submission",
    "status": "todo"
  }
  ```
- Response: `201`

#### `GET /api/tasks?page=1&limit=10&search=report&status=done`
- Response: `200`
- Format:
  ```json
  {
    "data": [],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 0,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
  ```

#### `GET /api/tasks/:id`
- Response: `200`

#### `PATCH /api/tasks/:id`
- Body (minimal satu field):
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "status": "in_progress"
  }
  ```
- Response: `200`

#### `DELETE /api/tasks/:id`
- Response: `204`

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  }
}
```

## Setup (Local Development via Yarn)

### Prerequisites
- Node.js `>=20`
- Yarn classic `1.22.x`
- Docker Desktop (untuk MySQL lokal)

### Environment Setup

```bash
cp apps/api/.env.example apps/api/.env
cp apps/api/.env.test.example apps/api/.env.test
cp apps/web/.env.example apps/web/.env
```

### Install Dependencies

```bash
yarn install
```

### Start Database (MySQL)

```bash
yarn db:up
```

### Generate Prisma Client + Run Migration

```bash
yarn db:generate
yarn db:migrate
```

### Optional Seed

```bash
yarn db:seed
```

Catatan: seed default saat ini no-op (tidak memasukkan data demo).

### Run Development

Backend:
```bash
yarn dev:api
```

Frontend:
```bash
yarn dev:web
```

Keduanya:
```bash
yarn dev
```

## Docker Compose (Full Stack)

Compose service:
- `mysql`
- `api`
- `web`

Run full stack:
```bash
yarn docker:up
```

Stop:
```bash
yarn docker:down
```

Logs:
```bash
yarn docker:logs
```

Akses:
- Web: `http://localhost:5173`
- API: `http://localhost:4000`
- MySQL: `localhost:3306`

Catatan:
- Container API menjalankan `prisma migrate deploy` saat start.
- Volume MySQL persisten: `mysql_data`.

## Testing

Run backend tests:
```bash
yarn workspace @task-app/api test
```

Run all workspace tests:
```bash
yarn test
```

Detail testing strategy ada di:
- [`apps/api/TESTING.md`](apps/api/TESTING.md)

## Build

```bash
yarn build
```

Atau per app:
```bash
yarn build:api
yarn build:web
```

## Assumptions

- Single-user scope per account (tidak ada team/organization).
- JWT access token only (tanpa refresh token rotation).
- Task duplicate check berlaku per user dengan normalisasi title.
- Frontend test automation ditunda (sesuai keputusan scope).
- Deployment live ditunda kecuali diminta khusus.

## Tradeoffs / Technical Decisions

- Clean architecture dibuat ringan agar maintainable tapi tidak kompleks berlebihan.
- Integration test HTTP memakai in-memory dependency injection untuk stabilitas dan kecepatan.
- Compose web memakai `vite preview` untuk kesederhanaan technical-test submission.
- Stats cards dihitung dari query list per status (cukup untuk scope test; bisa dioptimasi endpoint aggregate khusus).

## Improvements with More Time

- Tambah endpoint aggregate stats di backend (lebih efisien dibanding multi-query).
- Tambah frontend automated tests (RTL + Vitest) untuk auth/dashboard flow.
- Tambah rate limiting dan security hardening tambahan (helmet, stricter CORS policy, request size limit tuning).
- Tambah CI pipeline (lint, test, build, migration checks).
- Tambah observability (structured logging, request id, error tracking).
- Tambah deployment IaC + staging workflow.

## Optional Deployment Notes

### Suggested Targets
- Frontend: Vercel
- Backend: Render / Railway / Fly.io
- Database: Railway MySQL / Aiven MySQL / PlanetScale-compatible MySQL

### Required Environment Variables (Backend)
- `NODE_ENV`
- `PORT`
- `CORS_ORIGIN`
- `DATABASE_URL`
- `DATABASE_URL_TEST` (optional, mainly for testing)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `BCRYPT_ROUNDS`

### Required Environment Variables (Frontend)
- `VITE_API_BASE_URL`

## Submission Notes

- Scope dioptimalkan untuk technical test: feature inti lengkap, structure rapi, error handling konsisten, dan test behavior kritikal tersedia.
- Tidak ada fitur di luar scope inti seperti RBAC, audit log, atau drag-and-drop kanban.
