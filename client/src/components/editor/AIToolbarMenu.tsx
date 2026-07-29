import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { aiService } from '@/services/ai.service';
import { extractErrorMessage } from '@/services/apiClient';

type AIAction = 'summarize' | 'fixGrammar' | 'rewrite' | 'translate' | 'meetingNotes' | 'actionItems';

const ACTION_LABELS: Record<AIAction, string> = {
  summarize: 'Summarize note',
  fixGrammar: 'Fix grammar & spelling',
  rewrite: 'Rewrite (professional tone)',
  translate: 'Translate to Spanish',
  meetingNotes: 'Format as meeting notes',
  actionItems: 'Extract action items',
};

export function AIToolbarMenu({
  noteId,
  editor,
  onTitleGenerated,
  onTagsGenerated,
}: {
  noteId: string;
  editor: Editor | null;
  onTitleGenerated: (title: string) => void;
  onTagsGenerated: (tags: string[]) => void;
}) {
  const [result, setResult] = useState<{ action: AIAction; text: string } | null>(null);

  const run = useMutation({
    mutationFn: async (action: AIAction) => {
      switch (action) {
        case 'summarize':
          return aiService.summarize(noteId);
        case 'fixGrammar':
          return aiService.fixGrammar(noteId);
        case 'rewrite':
          return aiService.rewrite(noteId, 'professional');
        case 'translate':
          return aiService.translate(noteId, 'Spanish');
        case 'meetingNotes':
          return aiService.generateMeetingNotes(noteId);
        case 'actionItems':
          return aiService.extractActionItems(noteId);
        default:
          throw new Error('Unknown action');
      }
    },
    onSuccess: (text, action) => setResult({ action, text }),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const generateTitle = useMutation({
    mutationFn: () => aiService.generateTitle(noteId),
    onSuccess: onTitleGenerated,
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const generateTags = useMutation({
    mutationFn: () => aiService.generateTags(noteId),
    onSuccess: onTagsGenerated,
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const insertAtCursor = () => {
    if (!editor || !result) return;
    editor.chain().focus().insertContent(`<p>${result.text.replace(/\n/g, '<br/>')}</p>`).run();
    setResult(null);
  };

  const isBusy = run.isPending || generateTitle.isPending || generateTags.isPending;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isBusy}>
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Generate</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => generateTitle.mutate()}>Generate title</DropdownMenuItem>
          <DropdownMenuItem onClick={() => generateTags.mutate()}>Generate tags</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Transform</DropdownMenuLabel>
          {(Object.keys(ACTION_LABELS) as AIAction[]).map((action) => (
            <DropdownMenuItem key={action} onClick={() => run.mutate(action)}>
              {ACTION_LABELS[action]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={Boolean(result)} onOpenChange={(open) => !open && setResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{result ? ACTION_LABELS[result.action] : ''}</DialogTitle>
            <DialogDescription>Review the AI-generated result before inserting it into your note.</DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg bg-secondary p-4 text-sm">{result?.text}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResult(null)}>
              Discard
            </Button>
            <Button onClick={insertAtCursor}>Insert into note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
