import type { UserEntity } from "../../domain/entities/user.js";
import type { PublicUser } from "./auth-types.js";

export function toPublicUser(user: UserEntity): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}
