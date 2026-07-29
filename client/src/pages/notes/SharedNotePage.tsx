import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link2 from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import ImageExtension from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useEffect, useRef } from 'react';
import { NotebookPen, Lock } from 'lucide-react';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { noteService } from '@/services/note.service';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';

export default function SharedNotePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const claimedRef = useRef(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['shared-note', token],
    queryFn: () => noteService.getByShareToken(token as string),
    enabled: Boolean(token),
    retry: false,
  });

  const claim = useMutation({
    mutationFn: () => noteService.claimShareLink(token as string),
    onSuccess: (note) => navigate(ROUTES.NOTE(note._id), { replace: true }),
  });

  // If you're already logged in, a shared link should grant real, persistent
  // access (like Google Docs) instead of dead-ending at a read-only preview.
  useEffect(() => {
    if (user && data?.note && !claimedRef.current) {
      claimedRef.current = true;
      claim.mutate();
    }
  }, [user, data, claim]);

  const editor = useEditor({
    extensions: [StarterKit, Underline, Link2, Highlight, ImageExtension, TaskList, TaskItem.configure({ nested: true })],
    editable: false,
  });

  useEffect(() => {
    if (data?.note && editor) editor.commands.setContent(data.note.content as never);
  }, [data, editor]);

  if (isLoading || claim.isPending) return <LoadingScreen label={claim.isPending ? 'Adding note to your account…' : 'Loading shared note…'} />;

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
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to={ROUTES.LOGIN} state={{ from: location }} className="text-primary hover:underline">
            Log in to edit
          </Link>
          <Link to={ROUTES.SIGNUP} state={{ from: location }} className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-8 py-10">
        <h1 className="mb-6 text-3xl font-bold">{data.note.title || 'Untitled'}</h1>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
