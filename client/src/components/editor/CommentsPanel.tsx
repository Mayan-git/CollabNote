import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Check, Send, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { commentService } from '@/services/comment.service';
import { extractErrorMessage } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

export function CommentsPanel({ noteId, onClose }: { noteId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [content, setContent] = useState('');

  const { data: comments } = useQuery({ queryKey: ['comments', noteId], queryFn: () => commentService.list(noteId) });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['comments', noteId] });

  const create = useMutation({
    mutationFn: () => commentService.create(noteId, { content }),
    onSuccess: () => {
      setContent('');
      invalidate();
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const resolve = useMutation({ mutationFn: (commentId: string) => commentService.resolve(noteId, commentId), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (commentId: string) => commentService.remove(noteId, commentId), onSuccess: invalidate });

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">Comments</p>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {!comments?.length && <p className="py-8 text-center text-sm text-muted-foreground">No comments yet</p>}
          {comments?.map((comment) => (
            <div key={comment._id} className={cn('rounded-lg border border-border p-3', comment.isResolved && 'opacity-60')}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.author.avatarUrl} />
                    <AvatarFallback className="text-[10px]">{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium leading-none">{comment.author.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!comment.isResolved && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => resolve.mutate(comment._id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {comment.author._id === currentUser?._id && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove.mutate(comment._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm">{comment.content}</p>
              {comment.isResolved && <p className="mt-1 text-[10px] font-medium text-emerald-500">Resolved</p>}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment…"
            className="min-h-[60px] resize-none"
          />
        </div>
        <Button
          className="mt-2 w-full"
          size="sm"
          disabled={!content.trim() || create.isPending}
          onClick={() => create.mutate()}
        >
          <Send className="h-3.5 w-3.5" /> Comment
        </Button>
      </div>
    </aside>
  );
}
