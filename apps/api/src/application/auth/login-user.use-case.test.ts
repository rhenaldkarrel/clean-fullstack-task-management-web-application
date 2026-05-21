import { describe, expect, it } from "vitest";
import { AppError } from "../../shared/errors/app-error.js";
import { LoginUserUseCase } from "./login-user.use-case.js";
import type { PasswordHasher } from "../contracts/password-hasher.js";
import type { TokenService } from "../contracts/token-service.js";
import type {
  CreateUserInput,
  UserRepository
} from "../contracts/user-repository.js";
import type { UserEntity } from "../../domain/entities/user.js";

class InMemoryUserRepository implements UserRepository {
  private readonly users: UserEntity[] = [];

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    const now = new Date();
    const newUser: UserEntity = {
      id: `user-${this.users.length + 1}`,
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      createdAt: now,
      updatedAt: now
    };
    this.users.push(newUser);
    return newUser;
  }
}

class FakePasswordHasher implements PasswordHasher {
  async hash(): Promise<string> {
    return "not-used";
  }

  async compare(
    plainTextPassword: string,
    passwordHash: string
  ): Promise<boolean> {
    return passwordHash === `hashed:${plainTextPassword}`;
  }
}

class FakeTokenService implements TokenService {
  signAccessToken(payload: { userId: string; email: string }): string {
    return `token:${payload.userId}:${payload.email}`;
  }

  verifyAccessToken(): { userId: string; email: string } {
    throw new Error("not implemented");
  }
}

describe("LoginUserUseCase", () => {
  it("returns token and user when credentials are valid", async () => {
    const repository = new InMemoryUserRepository();
    await repository.create({
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed:supersecret"
    });

    const useCase = new LoginUserUseCase(
      repository,
      new FakePasswordHasher(),
      new FakeTokenService()
    );

    const result = await useCase.execute({
      email: "john@example.com",
      password: "supersecret"
    });

    expect(result.user.email).toBe("john@example.com");
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(result.accessToken).toContain("token:");
  });

  it("throws unauthorized when credentials are invalid", async () => {
    const repository = new InMemoryUserRepository();
    await repository.create({
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed:supersecret"
    });

    const useCase = new LoginUserUseCase(
      repository,
      new FakePasswordHasher(),
      new FakeTokenService()
    );

    await expect(
      useCase.execute({
        email: "john@example.com",
        password: "wrongpassword"
      })
    ).rejects.toMatchObject({
      statusCode: 401,
      code: "INVALID_CREDENTIALS"
    } satisfies Partial<AppError>);
  });
});
