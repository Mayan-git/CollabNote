import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

export function useTheme(): void {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (isDark: boolean) => root.classList.toggle('dark', isDark);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => apply(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }

    apply(theme === 'dark');
    return undefined;
  }, [theme]);
}
