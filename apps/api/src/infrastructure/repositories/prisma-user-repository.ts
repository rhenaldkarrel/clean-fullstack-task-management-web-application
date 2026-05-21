import type { UserRepository, CreateUserInput } from "../../application/contracts/user-repository.js";
import type { UserEntity } from "../../domain/entities/user.js";
import { prismaClient } from "../prisma/client.js";

function toUserEntity(data: {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}): UserEntity {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const user = await prismaClient.user.findUnique({ where: { id } });
    return user ? toUserEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prismaClient.user.findUnique({ where: { email } });
    return user ? toUserEntity(user) : null;
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    const user = await prismaClient.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash
      }
    });

    return toUserEntity(user);
  }
}
