import type { AuthenticatedUserContext } from "./authenticated-user-context.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUserContext;
    }
  }
}

export {};
