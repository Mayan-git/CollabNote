import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationService.list(page),
    refetchInterval: 60_000,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['notifications'] });

  const markAsRead = useMutation({ mutationFn: notificationService.markAsRead, onSuccess: invalidate });
  const markAllAsRead = useMutation({ mutationFn: notificationService.markAllAsRead, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: notificationService.remove, onSuccess: invalidate });

  return { markAsRead, markAllAsRead, remove };
}
