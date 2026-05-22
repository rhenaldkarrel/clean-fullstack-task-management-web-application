import { Navigate, createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/login-page";
import { RegisterPage } from "@/features/auth/pages/register-page";
import { DashboardPage } from "@/features/tasks/pages/dashboard-page";
import { AppLayout } from "@/shared/components/layout/app-layout";
import { ProtectedRoute } from "./protected-route";
import { PublicOnlyRoute } from "./public-only-route";
import { NotFoundPage } from "./not-found-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/register",
        element: <RegisterPage />
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: (
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        )
      },
      {
        path: "/tasks",
        element: <Navigate to="/dashboard" replace />
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
