import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("mysql://task_user:task_password@localhost:3306/task_management"),
  DATABASE_URL_TEST: z
    .string()
    .min(1)
    .default("mysql://task_user:task_password@localhost:3306/task_management_test"),
  JWT_SECRET: z.string().min(1).default("change-me-in-production"),
  JWT_EXPIRES_IN: z.string().min(1).default("1d"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).optional(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment variables: ${message}`);
}

const bcryptRounds =
  parsed.data.BCRYPT_ROUNDS ?? parsed.data.BCRYPT_SALT_ROUNDS ?? 10;

export const env = {
  ...parsed.data,
  BCRYPT_ROUNDS: bcryptRounds,
  // Backward compatible alias untuk kode lama.
  BCRYPT_SALT_ROUNDS: bcryptRounds
};
