import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import { History, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { noteService } from '@/services/note.service';

interface Props {
  noteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionHistoryDialog({ noteId, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['note-versions', noteId],
    queryFn: () => noteService.listVersions(noteId),
    enabled: open,
  });

  const restore = useMutation({
    mutationFn: (versionNumber: number) => noteService.restoreVersion(noteId, versionNumber),
    onSuccess: () => {
      toast.success('Version restored');
      void queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-4 w-4" /> Version history
          </DialogTitle>
          <DialogDescription>Restore a previous snapshot of this note.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-80">
          <div className="space-y-2 pr-3">
            {!data?.items.length && <p className="py-8 text-center text-sm text-muted-foreground">No versions yet</p>}
            {data?.items.map((version) => (
              <div key={version._id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{version.title || 'Untitled'}</p>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {version.changeType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {version.editedBy?.name ?? 'Unknown'} · {format(new Date(version.createdAt), 'PPp')} ·{' '}
                    {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => restore.mutate(version.versionNumber)}>
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
