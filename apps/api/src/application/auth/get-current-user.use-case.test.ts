import { describe, expect, it } from "vitest";
import { AppError } from "../../shared/errors/app-error.js";
import { GetCurrentUserUseCase } from "./get-current-user.use-case.js";
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

describe("GetCurrentUserUseCase", () => {
  it("returns current user profile when user exists", async () => {
    const repository = new InMemoryUserRepository();
    const createdUser = await repository.create({
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed-password"
    });
    const useCase = new GetCurrentUserUseCase(repository);

    const result = await useCase.execute(createdUser.id);

    expect(result).toMatchObject({
      id: createdUser.id,
      email: "john@example.com",
      name: "John Doe"
    });
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("throws unauthorized when user is not found", async () => {
    const repository = new InMemoryUserRepository();
    const useCase = new GetCurrentUserUseCase(repository);

    await expect(useCase.execute("unknown-user")).rejects.toMatchObject(
      {
        statusCode: 401,
        code: "UNAUTHORIZED"
      } satisfies Partial<AppError>
    );
  });
});
