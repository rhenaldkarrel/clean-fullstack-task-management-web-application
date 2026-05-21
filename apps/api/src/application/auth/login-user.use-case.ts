import type { PasswordHasher } from "../contracts/password-hasher.js";
import type { TokenService } from "../contracts/token-service.js";
import type { UserRepository } from "../contracts/user-repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { toPublicUser } from "./auth-mappers.js";
import type { AuthResult } from "./auth-types.js";

export type LoginUserInput = {
  email: string;
  password: string;
};

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new AppError({
        statusCode: 401,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new AppError({
        statusCode: 401,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password"
      });
    }

    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      email: user.email
    });

    return {
      user: toPublicUser(user),
      accessToken
    };
  }
}
