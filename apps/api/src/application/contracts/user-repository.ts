import type { UserEntity } from "../../domain/entities/user.js";

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(input: CreateUserInput): Promise<UserEntity>;
}
