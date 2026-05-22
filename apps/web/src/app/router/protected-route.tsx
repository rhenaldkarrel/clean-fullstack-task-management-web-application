import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthSessionStore } from '@/features/auth/store/auth-session-store';

export function ProtectedRoute() {
  const location = useLocation();
  const accessToken = useAuthSessionStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  return <Outlet />;
}
