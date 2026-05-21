import { describe, expect, it } from "vitest";
import { AppError } from "../../shared/errors/app-error.js";
import { RegisterUserUseCase } from "./register-user.use-case.js";
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
  async hash(plainTextPassword: string): Promise<string> {
    return `hashed:${plainTextPassword}`;
  }

  async compare(): Promise<boolean> {
    return true;
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

describe("RegisterUserUseCase", () => {
  it("registers user and returns access token without password hash", async () => {
    const repository = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(
      repository,
      new FakePasswordHasher(),
      new FakeTokenService()
    );

    const result = await useCase.execute({
      name: "John Doe",
      email: "John@example.com",
      password: "supersecret"
    });

    expect(result.user.email).toBe("john@example.com");
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(result.accessToken).toContain("token:");

    const createdUser = await repository.findByEmail("john@example.com");
    expect(createdUser?.passwordHash).toBe("hashed:supersecret");
  });

  it("throws conflict error when email is already registered", async () => {
    const repository = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(
      repository,
      new FakePasswordHasher(),
      new FakeTokenService()
    );

    await useCase.execute({
      name: "John Doe",
      email: "john@example.com",
      password: "supersecret"
    });

    await expect(
      useCase.execute({
        name: "John Duplicate",
        email: "john@example.com",
        password: "supersecret"
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "EMAIL_ALREADY_REGISTERED"
    } satisfies Partial<AppError>);
  });
});
