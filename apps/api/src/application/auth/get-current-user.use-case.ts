import type { UserRepository } from "../contracts/user-repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { toPublicUser } from "./auth-mappers.js";
import type { PublicUser } from "./auth-types.js";

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Invalid access token"
      });
    }

    return toPublicUser(user);
  }
}
