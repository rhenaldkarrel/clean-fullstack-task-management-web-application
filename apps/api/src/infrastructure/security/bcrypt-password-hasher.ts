import bcrypt from "bcrypt";
import type { PasswordHasher } from "../../application/contracts/password-hasher.js";
import { env } from "../../shared/config/env.js";

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, env.BCRYPT_SALT_ROUNDS);
  }

  async compare(
    plainTextPassword: string,
    passwordHash: string
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, passwordHash);
  }
}
