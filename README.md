# Task Management Application

Monorepo task management app dengan:
- `apps/web`: React + Vite + TypeScript
- `apps/api`: Express + TypeScript + Prisma + MySQL + Zod
- `packages/shared`: shared package

## Prerequisites

- Node.js `>=20`
- Yarn classic `1.22.x`
- Docker Desktop (untuk MySQL lokal)

## Setup Awal

```bash
yarn install
cp apps/api/.env.example apps/api/.env
```

## Environment Backend (`apps/api/.env`)

Key utama:

- `NODE_ENV=development`
- `PORT=4000`
- `CORS_ORIGIN=http://localhost:5173`
- `DATABASE_URL="mysql://task_user:task_password@localhost:3306/task_management"`
- `DATABASE_URL_TEST="mysql://task_user:task_password@localhost:3306/task_management_test"`
- `JWT_SECRET="change-me-in-production"`
- `JWT_EXPIRES_IN=1d`
- `BCRYPT_ROUNDS=10`

Catatan: `BCRYPT_SALT_ROUNDS` masih didukung sebagai alias backward-compatible.

## Local Database Setup (Phase 2.5)

Start MySQL via Docker Compose:

```bash
yarn db:up
```

Service ini akan membuat database:
- `task_management`
- `task_management_test`

Stop service:

```bash
yarn db:down
```

## Prisma / DB Scripts

Jalankan dari root repo:

```bash
yarn db:generate
yarn db:migrate
yarn db:studio
yarn db:seed
yarn db:reset
```

Catatan:
- `db:reset` bersifat destruktif (drop + recreate schema). Hanya untuk local development.

## Menjalankan Development

Backend saja:

```bash
yarn dev:api
```

Frontend saja:

```bash
yarn dev:web
```

Keduanya:

```bash
yarn dev
```

Health check backend:

- `GET http://localhost:4000/health`

## Manual Auth Test (curl)

Register:

```bash
curl -i -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"password123"}'
```

Login:

```bash
curl -i -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

Test endpoint terproteksi (`/api/auth/me`):

```bash
curl -i http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
