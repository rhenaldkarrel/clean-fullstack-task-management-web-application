import { type NextFunction, type Request, type Response } from "express";
import { authTokenService } from "../dependencies/auth-dependencies.js";
import { AppError } from "../../../shared/errors/app-error.js";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    next(
      new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authorization token"
      })
    );
    return;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    next(
      new AppError({
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Invalid authorization header"
      })
    );
    return;
  }

  const payload = authTokenService.verifyAccessToken(token);
  req.authUser = payload;
  next();
}
