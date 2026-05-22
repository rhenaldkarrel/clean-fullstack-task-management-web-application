# Backend Testing

## Menjalankan Test

```bash
yarn workspace @task-app/api test
```

Watch mode:

```bash
yarn workspace @task-app/api test:watch
```

## Test Environment Strategy

- Vitest menggunakan `apps/api/vitest.config.ts`.
- Setup file `src/test/setup-env.ts` akan:
  - load `.env.test` jika ada,
  - force `NODE_ENV=test`,
  - set fallback `DATABASE_URL` ke `DATABASE_URL_TEST` agar tidak memakai database development.

Salin example env test:

```bash
cp apps/api/.env.test.example apps/api/.env.test
```

Catatan:
- Suite test saat ini menggunakan dependency injection + in-memory repository untuk integration test auth/task.
- Artinya test tidak membutuhkan koneksi database aktif, tetapi guard `.env.test` tetap disiapkan untuk mencegah salah target DB jika nanti ada test berbasis Prisma.
