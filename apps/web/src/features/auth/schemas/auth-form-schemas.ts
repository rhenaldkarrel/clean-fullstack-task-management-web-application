import { z } from "zod";

export const registerFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Email is invalid"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const loginFormSchema = z.object({
  email: z.string().trim().email("Email is invalid"),
  password: z.string().min(1, "Password is required")
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
