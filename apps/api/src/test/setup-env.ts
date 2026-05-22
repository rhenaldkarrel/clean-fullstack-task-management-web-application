import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

process.env.NODE_ENV = "test";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL_TEST ??
    "mysql://task_user:task_password@localhost:3306/task_management_test";
}

if (!process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL_TEST = process.env.DATABASE_URL;
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-secret";
}

if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = "1d";
}

if (!process.env.BCRYPT_ROUNDS) {
  process.env.BCRYPT_ROUNDS = "10";
}
