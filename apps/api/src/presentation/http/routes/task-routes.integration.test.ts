import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type {
  CreateTaskInput,
  ListTasksInput,
  ListTasksResult,
  TaskRepository,
  UpdateTaskInput
} from "../../../application/contracts/task-repository.js";
import type { TaskEntity } from "../../../domain/entities/task.js";
import { createApp } from "../../../app.js";
import { authTokenService } from "../dependencies/auth-dependencies.js";
import {
  createTaskDependencies,
  resetTaskDependenciesForTesting,
  setTaskDependenciesForTesting
} from "../dependencies/task-dependencies.js";

type TaskRecord = {
  entity: TaskEntity;
  normalizedTitle: string;
};

class InMemoryTaskRepository implements TaskRepository {
  private records: TaskRecord[] = [];

  async create(input: CreateTaskInput): Promise<TaskEntity> {
    const now = new Date();
    const entity: TaskEntity = {
      id: `task-${this.records.length + 1}`,
      userId: input.userId,
      title: input.title,
      description: input.description,
      status: input.status,
      createdAt: now,
      updatedAt: now
    };

    this.records.push({
      entity,
      normalizedTitle: input.normalizedTitle
    });

    return entity;
  }

  async findByIdForUser(taskId: string, userId: string): Promise<TaskEntity | null> {
    return (
      this.records.find(
        (record) =>
          record.entity.id === taskId && record.entity.userId === userId
      )?.entity ?? null
    );
  }

  async findByNormalizedTitleForUser(
    userId: string,
    normalizedTitle: string
  ): Promise<TaskEntity | null> {
    return (
      this.records.find(
        (record) =>
          record.entity.userId === userId &&
          record.normalizedTitle === normalizedTitle
      )?.entity ?? null
    );
  }

  async listByUser(input: ListTasksInput): Promise<ListTasksResult> {
    const filtered = this.records
      .filter((record) => record.entity.userId === input.userId)
      .filter((record) =>
        input.status ? record.entity.status === input.status : true
      )
      .filter((record) =>
        input.search ? record.normalizedTitle.includes(input.search) : true
      )
      .map((record) => record.entity)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const skip = (input.page - 1) * input.limit;

    return {
      items: filtered.slice(skip, skip + input.limit),
      totalItems: filtered.length
    };
  }

  async updateByIdForUser(
    taskId: string,
    userId: string,
    input: UpdateTaskInput
  ): Promise<TaskEntity | null> {
    const index = this.records.findIndex(
      (record) =>
        record.entity.id === taskId && record.entity.userId === userId
    );

    if (index === -1) {
      return null;
    }

    const current = this.records[index];
    const updatedEntity: TaskEntity = {
      ...current.entity,
      title: input.title ?? current.entity.title,
      description:
        input.description !== undefined
          ? input.description
          : current.entity.description,
      status: input.status ?? current.entity.status,
      updatedAt: new Date()
    };

    this.records[index] = {
      entity: updatedEntity,
      normalizedTitle: input.normalizedTitle ?? current.normalizedTitle
    };

    return updatedEntity;
  }

  async deleteByIdForUser(taskId: string, userId: string): Promise<boolean> {
    const before = this.records.length;
    this.records = this.records.filter(
      (record) =>
        !(record.entity.id === taskId && record.entity.userId === userId)
    );
    return this.records.length < before;
  }
}

describe("task routes integration", () => {
  const app = createApp();

  function tokenFor(userId: string, email: string): string {
    return authTokenService.signAccessToken({ userId, email });
  }

  beforeEach(() => {
    const repository = new InMemoryTaskRepository();
    setTaskDependenciesForTesting(createTaskDependencies(repository));
  });

  it("requires authentication", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("supports create, list, detail, update, delete happy path", async () => {
    const token = tokenFor("user-1", "user1@example.com");

    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Write docs",
        description: "Initial description"
      });

    expect(created.status).toBe(201);
    const taskId = created.body.data.id as string;

    const listed = await request(app)
      .get("/api/tasks?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);
    expect(listed.status).toBe(200);
    expect(listed.body.meta.totalItems).toBe(1);

    const detail = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.title).toBe("Write docs");

    const updated = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "done" });
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe("done");

    const deleted = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleted.status).toBe(204);

    const afterDelete = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(afterDelete.status).toBe(404);
  });

  it("returns 409 on duplicate title for same user", async () => {
    const token = tokenFor("user-1", "user1@example.com");

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Write Docs" });

    const duplicate = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "  write   docs " });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("DUPLICATE_TASK_TITLE");
  });

  it("allows same title for different users", async () => {
    const user1Token = tokenFor("user-1", "user1@example.com");
    const user2Token = tokenFor("user-2", "user2@example.com");

    const first = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: "Weekly Sync" });

    const second = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ title: "Weekly Sync" });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
  });

  it("returns correct pagination metadata", async () => {
    const token = tokenFor("user-1", "user1@example.com");

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 1" });
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 2" });
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 3" });

    const page1 = await request(app)
      .get("/api/tasks?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);
    expect(page1.status).toBe(200);
    expect(page1.body.meta).toMatchObject({
      page: 1,
      limit: 2,
      totalItems: 3,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false
    });

    const page2 = await request(app)
      .get("/api/tasks?page=2&limit=2")
      .set("Authorization", `Bearer ${token}`);
    expect(page2.status).toBe(200);
    expect(page2.body.meta).toMatchObject({
      page: 2,
      limit: 2,
      totalItems: 3,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true
    });
  });

  it("supports search and status filter and keeps data scoped per user", async () => {
    const user1Token = tokenFor("user-1", "user1@example.com");
    const user2Token = tokenFor("user-2", "user2@example.com");

    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: "Monthly Report", status: "done" });
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: "Monthly Plan", status: "todo" });
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ title: "Monthly Report", status: "done" });

    const filtered = await request(app)
      .get("/api/tasks?page=1&limit=10&search=report&status=done")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(filtered.status).toBe(200);
    expect(filtered.body.data).toHaveLength(1);
    expect(filtered.body.data[0].title).toBe("Monthly Report");
    expect(filtered.body.meta.totalItems).toBe(1);
  });

  it("returns not found when fetching detail for another user's task", async () => {
    const ownerToken = tokenFor("user-1", "user1@example.com");
    const anotherUserToken = tokenFor("user-2", "user2@example.com");

    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "Private Task" });

    const response = await request(app)
      .get(`/api/tasks/${created.body.data.id as string}`)
      .set("Authorization", `Bearer ${anotherUserToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("TASK_NOT_FOUND");
  });

  it("returns validation error when status is invalid", async () => {
    const token = tokenFor("user-1", "user1@example.com");

    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Invalid Status Task",
        status: "invalid_status"
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  afterEach(() => {
    resetTaskDependenciesForTesting();
  });
});
