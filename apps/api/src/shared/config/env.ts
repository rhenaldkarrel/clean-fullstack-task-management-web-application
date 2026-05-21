import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("mysql://root:root@localhost:3306/task_management"),
  JWT_SECRET: z.string().min(1).default("change-me-in-production"),
  JWT_EXPIRES_IN: z.string().min(1).default("1d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment variables: ${message}`);
}

export const env = parsed.data;
