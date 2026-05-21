import type { PasswordHasher } from "../contracts/password-hasher.js";
import type { TokenService } from "../contracts/token-service.js";
import type { UserRepository } from "../contracts/user-repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { toPublicUser } from "./auth-mappers.js";
import type { AuthResult } from "./auth-types.js";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new AppError({
        statusCode: 409,
        code: "EMAIL_ALREADY_REGISTERED",
        message: "Email is already registered"
      });
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const createdUser = await this.userRepository.create({
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    const accessToken = this.tokenService.signAccessToken({
      userId: createdUser.id,
      email: createdUser.email
    });

    return {
      user: toPublicUser(createdUser),
      accessToken
    };
  }
}
