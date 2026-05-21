import { GetCurrentUserUseCase } from "../../../application/auth/get-current-user.use-case.js";
import { LoginUserUseCase } from "../../../application/auth/login-user.use-case.js";
import { RegisterUserUseCase } from "../../../application/auth/register-user.use-case.js";
import { PrismaUserRepository } from "../../../infrastructure/repositories/prisma-user-repository.js";
import { BcryptPasswordHasher } from "../../../infrastructure/security/bcrypt-password-hasher.js";
import { JwtTokenService } from "../../../infrastructure/security/jwt-token-service.js";

const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();

export const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  passwordHasher,
  tokenService
);

export const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  passwordHasher,
  tokenService
);

export const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);

export const authTokenService = tokenService;
