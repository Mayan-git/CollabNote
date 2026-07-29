import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService, LoginInput, SignupInput } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { extractErrorMessage } from '@/services/apiClient';
import { ROUTES } from '@/constants/routes';

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, accessToken, isInitializing, setUser, setAccessToken, clearAuth } = useAuthStore();

  function redirectAfterAuth() {
    const from = (location.state as { from?: Location } | null)?.from;
    navigate(from ? `${from.pathname}${from.search ?? ''}` : ROUTES.DASHBOARD, { replace: true });
  }

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: ({ user: loggedInUser, accessToken: token }) => {
      setUser(loggedInUser);
      setAccessToken(token);
      toast.success(`Welcome back, ${loggedInUser.name.split(' ')[0]}!`);
      redirectAfterAuth();
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const signupMutation = useMutation({
    mutationFn: (input: SignupInput) => authService.signup(input),
    onSuccess: ({ user: newUser, accessToken: token }) => {
      setUser(newUser);
      setAccessToken(token);
      toast.success('Account created — check your email to verify it');
      redirectAfterAuth();
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });

  return {
    user,
    accessToken,
    isInitializing,
    isAuthenticated: Boolean(user),
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    logout: logoutMutation.mutate,
  };
}
