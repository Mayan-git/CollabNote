import { Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, useNotificationMutations } from '@/hooks/useNotifications';
import { cn } from '@/utils/cn';

export function NotificationBell() {
  const { data } = useNotifications();
  const { markAsRead, markAllAsRead } = useNotificationMutations();
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={() => markAllAsRead.mutate()}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {!data?.items.length && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up</p>
          )}
          <div className="divide-y divide-border">
            {data?.items.map((notification) => (
              <button
                key={notification._id}
                onClick={() => !notification.isRead && markAsRead.mutate(notification._id)}
                className={cn('flex w-full items-start gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-secondary', !notification.isRead && 'bg-accent/50')}
              >
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                {notification.isRead && <Check className="mt-1 h-3 w-3 shrink-0 text-muted-foreground" />}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
