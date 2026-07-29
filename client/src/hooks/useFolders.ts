import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { folderService } from '@/services/folder.service';

export function useFolders(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['folders', workspaceId],
    queryFn: () => folderService.list(workspaceId as string),
    enabled: Boolean(workspaceId),
  });
}

export function useFolderMutations(workspaceId: string | undefined) {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['folders', workspaceId] });

  const create = useMutation({ mutationFn: folderService.create, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof folderService.update>[1] }) =>
      folderService.update(id, updates),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: folderService.remove, onSuccess: invalidate });

  return { create, update, remove };
}
