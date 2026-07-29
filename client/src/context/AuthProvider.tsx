import { useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { API_URL } from '@/constants/env';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setAccessToken, setInitializing } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const response = await axios.post<{ data: { accessToken: string } }>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        if (cancelled) return;
        setAccessToken(response.data.data.accessToken);

        const me = await authService.getMe();
        if (cancelled) return;
        setUser(me);
      } catch {
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setUser, setAccessToken, setInitializing]);

  return <>{children}</>;
}
