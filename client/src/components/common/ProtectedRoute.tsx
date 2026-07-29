import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { LoadingScreen } from './LoadingScreen';

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, isInitializing } = useAuthStore();
  const location = useLocation();

  if (isInitializing) return <LoadingScreen label="Checking your session…" />;

  if (!user) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <Outlet />;
}

export function GuestOnlyRoute() {
  const { user, isInitializing } = useAuthStore();

  if (isInitializing) return <LoadingScreen />;
  if (user) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <Outlet />;
}
