# Task Management Application

Phase saat ini: **Phase 2 - Backend Foundation**.

## Tech Stack (Current)

- Yarn workspace (monorepo)
- `apps/web`: React + Vite + TypeScript
- `apps/api`: Express + TypeScript + Prisma + MySQL + Zod
- `packages/shared`: shared TypeScript package

## Prerequisites

- Node.js `>=20`
- Yarn classic `1.22.x`

## Setup

```bash
yarn install
```

Backend environment:

```bash
cp apps/api/.env.example apps/api/.env
```

## Menjalankan Development

Jalankan frontend saja:

```bash
yarn dev:web
```

Jalankan backend saja:

```bash
yarn dev:api
```

Jalankan frontend + backend bersamaan:

```bash
yarn dev
```

Backend health check:

- URL: `http://localhost:4000/health`
- Expected response: status `200` dengan response format standar `{ data: ... }`.

## Prisma Commands

Validasi schema:

```bash
yarn workspace @task-app/api prisma:validate
```

Generate Prisma client:

```bash
yarn workspace @task-app/api prisma:generate
```

Buat dan jalankan migration di local:

```bash
yarn workspace @task-app/api prisma:migrate:dev --name init_foundation
```

Jalankan migration untuk environment deploy:

```bash
yarn workspace @task-app/api prisma:migrate:deploy
```

Seed strategy saat ini:

```bash
yarn workspace @task-app/api prisma:seed
```

Script seed default sengaja no-op (tidak membuat data), supaya tetap ringan dan bisa diisi saat phase feature.

## Build

```bash
yarn build
```

Atau per app:

```bash
yarn build:web
yarn build:api
```

## Catatan Scope Saat Ini

- Fondasi backend clean architecture ringan sudah disiapkan (`domain`, `application`, `infrastructure`, `presentation`, `shared`).
- Fitur auth dan task business logic penuh belum diimplementasikan. Itu akan masuk pada phase berikutnya.
