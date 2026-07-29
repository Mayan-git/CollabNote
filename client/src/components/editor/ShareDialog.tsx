import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Copy, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { noteService } from '@/services/note.service';
import { extractErrorMessage } from '@/services/apiClient';
import { CollaboratorRole, Note } from '@/types';

interface Props {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ note, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CollaboratorRole>('editor');

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['note', note._id] });

  const invite = useMutation({
    mutationFn: () => noteService.inviteByEmail(note._id, email, role),
    onSuccess: () => {
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      invalidate();
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const removeCollaborator = useMutation({
    mutationFn: (collaboratorId: string) => noteService.removeCollaborator(note._id, collaboratorId),
    onSuccess: invalidate,
  });

  const updateShareLink = useMutation({
    mutationFn: (input: Parameters<typeof noteService.updateShareLink>[1]) => noteService.updateShareLink(note._id, input),
    onSuccess: invalidate,
  });

  const shareUrl = note.shareLink.token ? `${window.location.origin}/shared/${note.shareLink.token}` : '';

  const copyLink = () => {
    void navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share &quot;{note.title || 'Untitled'}&quot;</DialogTitle>
          <DialogDescription>Invite collaborators or share a public link.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select value={role} onValueChange={(v) => setRole(v as CollaboratorRole)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="commenter">Commenter</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => email && invite.mutate()} disabled={!email || invite.isPending}>
              {invite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Invite'}
            </Button>
          </div>

          {note.collaborators.length > 0 && (
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {note.collaborators.map((collaborator) => (
                <div key={collaborator.user._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={collaborator.user.avatarUrl} />
                      <AvatarFallback className="text-[10px]">{collaborator.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium leading-none">{collaborator.user.name}</p>
                      <p className="text-xs capitalize text-muted-foreground">{collaborator.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeCollaborator.mutate(collaborator.user._id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Public share link</p>
                <p className="text-xs text-muted-foreground">Anyone with the link can access this note.</p>
              </div>
              <Switch
                checked={note.shareLink.enabled}
                onCheckedChange={(checked) => updateShareLink.mutate({ enabled: checked, role: note.shareLink.role })}
              />
            </div>

            {note.shareLink.enabled && (
              <>
                <div className="flex gap-2">
                  <Input readOnly value={shareUrl} />
                  <Button variant="outline" size="icon" onClick={copyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Link permission</Label>
                  <Select
                    value={note.shareLink.role}
                    onValueChange={(v) => updateShareLink.mutate({ enabled: true, role: v as never })}
                  >
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="commenter">Commenter</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
