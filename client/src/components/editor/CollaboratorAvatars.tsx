import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePresenceStore } from '@/store/presenceStore';
import { useAuthStore } from '@/store/authStore';

export function CollaboratorAvatars() {
  const collaborators = usePresenceStore((state) => state.collaborators);
  const currentUserId = useAuthStore((state) => state.user?._id);
  const others = collaborators.filter((c) => c.userId !== currentUserId);

  if (others.length === 0) return null;

  return (
    <div className="flex -space-x-2">
      {others.slice(0, 5).map((collaborator) => (
        <Tooltip key={collaborator.socketId}>
          <TooltipTrigger asChild>
            <div
              className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white shadow"
              style={{ backgroundColor: collaborator.color }}
            >
              {collaborator.avatarUrl ? (
                <img src={collaborator.avatarUrl} alt={collaborator.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                collaborator.name[0]?.toUpperCase()
              )}
              {collaborator.isTyping && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 animate-pulse rounded-full border border-background bg-emerald-400" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {collaborator.name} {collaborator.isTyping ? '(typing…)' : ''}
          </TooltipContent>
        </Tooltip>
      ))}
      {others.length > 5 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-xs font-semibold">
          +{others.length - 5}
        </div>
      )}
    </div>
  );
}
