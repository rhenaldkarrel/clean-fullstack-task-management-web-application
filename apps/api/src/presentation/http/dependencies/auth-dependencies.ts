import { GetCurrentUserUseCase } from "../../../application/auth/get-current-user.use-case.js";
import { LoginUserUseCase } from "../../../application/auth/login-user.use-case.js";
import { RegisterUserUseCase } from "../../../application/auth/register-user.use-case.js";
import type { PasswordHasher } from "../../../application/contracts/password-hasher.js";
import type { TokenService } from "../../../application/contracts/token-service.js";
import type { UserRepository } from "../../../application/contracts/user-repository.js";
import { PrismaUserRepository } from "../../../infrastructure/repositories/prisma-user-repository.js";
import { BcryptPasswordHasher } from "../../../infrastructure/security/bcrypt-password-hasher.js";
import { JwtTokenService } from "../../../infrastructure/security/jwt-token-service.js";

export type AuthDependencies = {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
  getCurrentUserUseCase: GetCurrentUserUseCase;
};

export function createAuthDependencies(
  userRepository: UserRepository,
  passwordHasher: PasswordHasher,
  tokenService: TokenService
): AuthDependencies {
  return {
    registerUserUseCase: new RegisterUserUseCase(
      userRepository,
      passwordHasher,
      tokenService
    ),
    loginUserUseCase: new LoginUserUseCase(
      userRepository,
      passwordHasher,
      tokenService
    ),
    getCurrentUserUseCase: new GetCurrentUserUseCase(userRepository)
  };
}

const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();
const defaultAuthDependencies = createAuthDependencies(
  userRepository,
  passwordHasher,
  tokenService
);
let activeAuthDependencies = defaultAuthDependencies;

export function getAuthDependencies(): AuthDependencies {
  return activeAuthDependencies;
}

export function setAuthDependenciesForTesting(
  authDependencies: AuthDependencies
): void {
  activeAuthDependencies = authDependencies;
}

export function resetAuthDependenciesForTesting(): void {
  activeAuthDependencies = defaultAuthDependencies;
}

export const authTokenService = tokenService;
