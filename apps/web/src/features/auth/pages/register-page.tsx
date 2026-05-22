import { Loader2, UserPlus } from "lucide-react";
import { Link, type Location, useLocation } from "react-router-dom";
import { useZodForm } from "@/shared/lib/forms/use-zod-form";
import { getApiErrorMessage, getApiValidationIssues } from "@/shared/lib/api/error-utils";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useRegisterMutation } from "../hooks/use-auth-mutations";
import { registerFormSchema, type RegisterFormValues } from "../schemas/auth-form-schemas";

type RegisterLocationState = {
  from?: Location;
};

export function RegisterPage() {
  const location = useLocation();
  const redirectedFrom = (location.state as RegisterLocationState | null)?.from;
  const registerMutation = useRegisterMutation(redirectedFrom);

  const form = useZodForm(registerFormSchema, {
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    registerMutation.reset();
    form.clearErrors();

    try {
      await registerMutation.mutateAsync(values);
    } catch (error) {
      getApiValidationIssues(error).forEach((issue) => {
        if (!issue.path || !issue.message) {
          return;
        }

        form.setError(issue.path as keyof RegisterFormValues, {
          type: "server",
          message: issue.message
        });
      });
    }
  });

  const apiErrorMessage = registerMutation.isError
    ? getApiErrorMessage(registerMutation.error, "Register failed")
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Buat akun baru untuk mulai mengelola task Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                {...form.register("name")}
              />
              {form.formState.errors.name?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                {...form.register("password")}
              />
              {form.formState.errors.password?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {apiErrorMessage ? (
              <p className="text-sm text-destructive">{apiErrorMessage}</p>
            ) : null}

            <Button
              className="w-full gap-2"
              type="submit"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link className="font-medium text-primary hover:underline" to="/login">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
