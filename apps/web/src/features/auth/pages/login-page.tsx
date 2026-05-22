import { Loader2, LogIn } from "lucide-react";
import { Link, type Location, useLocation } from "react-router-dom";
import { useZodForm } from "@/shared/lib/forms/use-zod-form";
import { getApiErrorMessage, getApiValidationIssues } from "@/shared/lib/api/error-utils";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useLoginMutation } from "../hooks/use-auth-mutations";
import { loginFormSchema, type LoginFormValues } from "../schemas/auth-form-schemas";

type LoginLocationState = {
  from?: Location;
};

export function LoginPage() {
  const location = useLocation();
  const redirectedFrom = (location.state as LoginLocationState | null)?.from;
  const loginMutation = useLoginMutation(redirectedFrom);

  const form = useZodForm(loginFormSchema, {
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    loginMutation.reset();
    form.clearErrors();

    try {
      await loginMutation.mutateAsync(values);
    } catch (error) {
      getApiValidationIssues(error).forEach((issue) => {
        if (!issue.path || !issue.message) {
          return;
        }

        form.setError(issue.path as keyof LoginFormValues, {
          type: "server",
          message: issue.message
        });
      });
    }
  });

  const apiErrorMessage = loginMutation.isError
    ? getApiErrorMessage(loginMutation.error, "Login failed")
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Masuk ke akun Anda untuk melanjutkan ke dashboard task management.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
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
                autoComplete="current-password"
                placeholder="********"
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
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link className="font-medium text-primary hover:underline" to="/register">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
