import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../app.js";
import type { PasswordHasher } from "../../../application/contracts/password-hasher.js";
import type {
  CreateUserInput,
  UserRepository
} from "../../../application/contracts/user-repository.js";
import type { UserEntity } from "../../../domain/entities/user.js";
import {
  authTokenService,
  createAuthDependencies,
  resetAuthDependenciesForTesting,
  setAuthDependenciesForTesting
} from "../dependencies/auth-dependencies.js";

class InMemoryUserRepository implements UserRepository {
  private readonly users: UserEntity[] = [];

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return (
      this.users.find(
        (user) => user.email.toLowerCase() === email.trim().toLowerCase()
      ) ?? null
    );
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    const now = new Date();
    const user: UserEntity = {
      id: `user-${this.users.length + 1}`,
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      createdAt: now,
      updatedAt: now
    };
    this.users.push(user);
    return user;
  }
}

class FakePasswordHasher implements PasswordHasher {
  async hash(plainTextPassword: string): Promise<string> {
    return `hashed:${plainTextPassword}`;
  }

  async compare(
    plainTextPassword: string,
    passwordHash: string
  ): Promise<boolean> {
    return passwordHash === `hashed:${plainTextPassword}`;
  }
}

describe("auth routes integration", () => {
  const app = createApp();

  beforeEach(() => {
    const repository = new InMemoryUserRepository();
    const dependencies = createAuthDependencies(
      repository,
      new FakePasswordHasher(),
      authTokenService
    );

    setAuthDependenciesForTesting(dependencies);
  });

  afterEach(() => {
    resetAuthDependenciesForTesting();
  });

  it("registers a user successfully", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "John@example.com",
      password: "supersecret"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe("john@example.com");
    expect(response.body.data.user).not.toHaveProperty("passwordHash");
    expect(typeof response.body.data.accessToken).toBe("string");
    expect(response.body.data.accessToken.length).toBeGreaterThan(10);
  });

  it("returns conflict when registering duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "supersecret"
    });

    const duplicate = await request(app).post("/api/auth/register").send({
      name: "Another John",
      email: "JOHN@example.com",
      password: "supersecret"
    });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("logs in successfully with valid credentials", async () => {
    await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "supersecret"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "john@example.com",
      password: "supersecret"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe("john@example.com");
    expect(typeof response.body.data.accessToken).toBe("string");
  });

  it("returns unauthorized for invalid credentials", async () => {
    await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "supersecret"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "john@example.com",
      password: "wrong-password"
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects protected endpoint when token is missing", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns current user profile for valid token", async () => {
    const registerResponse = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "supersecret"
    });
    const accessToken = registerResponse.body.data.accessToken as string;

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe("john@example.com");
    expect(response.body.data).not.toHaveProperty("passwordHash");
  });
});
