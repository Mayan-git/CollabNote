import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '@/services/workspace.service';

export function useWorkspaces() {
  return useQuery({ queryKey: ['workspaces'], queryFn: workspaceService.list });
}

export function useDefaultWorkspaceId(): string | undefined {
  const { data } = useWorkspaces();
  return data?.[0]?._id;
}
