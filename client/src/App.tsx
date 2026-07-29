import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './app/queryClient';
import { AuthProvider } from './context/AuthProvider';
import { SocketProvider } from './context/SocketProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProtectedRoute, GuestOnlyRoute } from '@/components/common/ProtectedRoute';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/constants/routes';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));
const DashboardHomePage = lazy(() => import('@/pages/dashboard/DashboardHomePage'));
const NotesListPage = lazy(() => import('@/pages/dashboard/NotesListPage'));
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'));
const AdminPage = lazy(() => import('@/pages/dashboard/AdminPage'));
const NoteEditorPage = lazy(() => import('@/pages/notes/NoteEditorPage'));
const SharedNotePage = lazy(() => import('@/pages/notes/SharedNotePage'));
const InvitationPage = lazy(() => import('@/pages/notes/InvitationPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function AppShell() {
  useTheme();

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path={ROUTES.HOME} element={<LandingPage />} />
          <Route path={ROUTES.SHARED_NOTE(':token')} element={<SharedNotePage />} />

          <Route element={<GuestOnlyRoute />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          </Route>
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.INVITATION(':token')} element={<InvitationPage />} />
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardHomePage />} />
              <Route path={ROUTES.FAVORITES} element={<NotesListPage filter="favorites" title="Favorites" />} />
              <Route path={ROUTES.PINNED} element={<NotesListPage filter="pinned" title="Pinned" />} />
              <Route path={ROUTES.ARCHIVE} element={<NotesListPage filter="archived" title="Archive" />} />
              <Route path={ROUTES.TRASH} element={<NotesListPage filter="trash" title="Trash" />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            </Route>
            <Route path={ROUTES.NOTE(':id')} element={<NoteEditorPage />} />
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path={ROUTES.ADMIN} element={<AdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <TooltipProvider delayDuration={200}>
            <AppShell />
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
          </TooltipProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
