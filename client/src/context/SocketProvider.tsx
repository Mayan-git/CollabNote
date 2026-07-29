import { ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { connectSocket, disconnectSocket } from '@/services/socketClient';
import { AppNotification } from '@/types';

export function SocketProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return undefined;
    }

    const socket = connectSocket();

    const handleNotification = (notification: AppNotification) => {
      toast(notification.message, { icon: '🔔' });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [user, queryClient]);

  useEffect(() => () => disconnectSocket(), []);

  return <>{children}</>;
}
