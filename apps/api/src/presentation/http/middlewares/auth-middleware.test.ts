import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { requireAuth } from "./auth-middleware.js";
import { authTokenService } from "../dependencies/auth-dependencies.js";
import { AppError } from "../../../shared/errors/app-error.js";

function createNextSpy(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

describe("requireAuth middleware", () => {
  it("rejects request when authorization header is missing", () => {
    const req = { headers: {} } as Request;
    const res = {} as Response;
    const next = createNextSpy() as unknown as ReturnType<typeof vi.fn>;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    const firstCallArg = next.mock.calls[0][0] as AppError;
    expect(firstCallArg.statusCode).toBe(401);
    expect(firstCallArg.code).toBe("UNAUTHORIZED");
  });

  it("attaches authenticated user to request when token is valid", () => {
    const token = authTokenService.signAccessToken({
      userId: "user-1",
      email: "john@example.com"
    });
    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    } as Request;
    const res = {} as Response;
    const next = createNextSpy() as unknown as ReturnType<typeof vi.fn>;

    requireAuth(req, res, next);

    expect(req.authUser).toEqual({
      userId: "user-1",
      email: "john@example.com"
    });
    expect(next).toHaveBeenCalledWith();
  });
});
