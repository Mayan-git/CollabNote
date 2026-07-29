import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link2 from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import ImageExtension from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useEffect } from 'react';
import { NotebookPen, Lock } from 'lucide-react';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { noteService } from '@/services/note.service';
import { ROUTES } from '@/constants/routes';

export default function SharedNotePage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shared-note', token],
    queryFn: () => noteService.getByShareToken(token as string),
    enabled: Boolean(token),
    retry: false,
  });

  const editor = useEditor({
    extensions: [StarterKit, Underline, Link2, Highlight, ImageExtension, TaskList, TaskItem.configure({ nested: true })],
    editable: false,
  });

  useEffect(() => {
    if (data?.note && editor) editor.commands.setContent(data.note.content as never);
  }, [data, editor]);

  if (isLoading) return <LoadingScreen label="Loading shared note…" />;

  if (isError || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-center">
        <Lock className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium">This link is invalid or has expired</p>
        <Link to={ROUTES.HOME} className="text-sm text-primary hover:underline">
          Go to CollabNote
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 font-semibold">
          <NotebookPen className="h-5 w-5 text-primary" />
          CollabNote
        </Link>
        <Link to={ROUTES.LOGIN} className="text-sm font-medium text-primary hover:underline">
          Log in to edit
        </Link>
      </header>
      <div className="mx-auto max-w-3xl px-8 py-10">
        <h1 className="mb-6 text-3xl font-bold">{data.note.title || 'Untitled'}</h1>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
