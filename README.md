# Task Management Application

Phase saat ini: **Phase 1 - Monorepo Setup**.

## Tech Stack (Current)

- Yarn workspace (monorepo)
- `apps/web`: React + Vite + TypeScript
- `apps/api`: Express + TypeScript
- `packages/shared`: shared TypeScript package

## Prerequisites

- Node.js `>=20`
- Yarn classic `1.22.x`

## Setup

```bash
yarn install
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
- Expected response: status `200` dengan body JSON sederhana.

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

Fitur auth, task CRUD, database, dan business logic belum diimplementasikan di phase ini. Semua itu akan masuk pada phase berikutnya.
