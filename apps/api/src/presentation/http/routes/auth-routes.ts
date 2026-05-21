import { Router } from "express";
import {
  loginController,
  meController,
  registerController
} from "../controllers/auth-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { asyncHandler } from "../middlewares/async-handler.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(registerController));
authRouter.post("/login", asyncHandler(loginController));
authRouter.get("/me", requireAuth, asyncHandler(meController));
