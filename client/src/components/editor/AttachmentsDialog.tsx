import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Download, Loader2, Paperclip, Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { attachmentService } from '@/services/attachment.service';
import { extractErrorMessage } from '@/services/apiClient';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

export function AttachmentsDialog({ noteId, open, onOpenChange }: { noteId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: attachments } = useQuery({
    queryKey: ['attachments', noteId],
    queryFn: () => attachmentService.list(noteId),
    enabled: open,
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['attachments', noteId] });

  const upload = useMutation({
    mutationFn: (file: File) => attachmentService.upload(noteId, file),
    onSuccess: invalidate,
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (attachmentId: string) => attachmentService.remove(noteId, attachmentId),
    onSuccess: invalidate,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" /> Attachments
          </DialogTitle>
          <DialogDescription>Upload files up to 15MB to attach to this note.</DialogDescription>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload.mutate(file);
          }}
        />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={upload.isPending}>
          {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload file
        </Button>

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {!attachments?.length && <p className="py-6 text-center text-sm text-muted-foreground">No attachments yet</p>}
          {attachments?.map((attachment) => (
            <div key={attachment._id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{attachment.fileName}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(attachment.fileSizeBytes)}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={attachment.url} target="_blank" rel="noreferrer" download>
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove.mutate(attachment._id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
