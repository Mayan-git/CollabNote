import { useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { attachmentService } from '@/services/attachment.service';
import { extractErrorMessage } from '@/services/apiClient';

interface Props {
  noteId: string;
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageDialog({ noteId, editor, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setUrl('');
    onOpenChange(false);
  };

  const insertUrl = () => {
    if (!editor || !url.trim()) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
    close();
  };

  const upload = useMutation({
    mutationFn: (file: File) => attachmentService.upload(noteId, file),
    onSuccess: (attachment) => {
      editor?.chain().focus().setImage({ src: attachment.url, alt: attachment.fileName }).run();
      void queryClient.invalidateQueries({ queryKey: ['attachments', noteId] });
      close();
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Insert image
          </DialogTitle>
          <DialogDescription>Upload a file or paste an image URL.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload.mutate(file);
              }}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={upload.isPending}
            >
              {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Choose image file
            </Button>
          </TabsContent>

          <TabsContent value="url">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/photo.png"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && insertUrl()}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button onClick={insertUrl} disabled={!url.trim()}>
                Insert
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
