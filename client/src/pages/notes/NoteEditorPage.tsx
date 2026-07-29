import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Check,
  Clock,
  MessageSquare,
  Share2,
  History,
  Star,
  Pin,
  Paperclip,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { CollaboratorAvatars } from '@/components/editor/CollaboratorAvatars';
import { CommentsPanel } from '@/components/editor/CommentsPanel';
import { ShareDialog } from '@/components/editor/ShareDialog';
import { VersionHistoryDialog } from '@/components/editor/VersionHistoryDialog';
import { AIToolbarMenu } from '@/components/editor/AIToolbarMenu';
import { AttachmentsDialog } from '@/components/editor/AttachmentsDialog';
import { ImageDialog } from '@/components/editor/ImageDialog';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useNote, useNoteMutations } from '@/hooks/useNotes';
import { useNoteCollaboration } from '@/hooks/useNoteCollaboration';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { getSocket } from '@/services/socketClient';
import { ROUTES } from '@/constants/routes';

const lowlight = createLowlight(common);

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useNote(id);
  const { update, togglePin, toggleFavorite } = useNoteMutations();

  const [title, setTitle] = useState('');
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isAttachmentsOpen, setAttachmentsOpen] = useState(false);
  const [isImageDialogOpen, setImageDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isSocketConnected, setSocketConnected] = useState(getSocket().connected);

  const versionRef = useRef(1);
  const isFocusedRef = useRef(false);
  const initializedRef = useRef(false);

  const note = data?.note;
  const role = data?.role;
  const canEdit = role === 'owner' || role === 'editor';

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Highlight,
      ImageExtension,
      Placeholder.configure({ placeholder: 'Start writing, or press "/" for commands…' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    editable: canEdit,
    onFocus: () => {
      isFocusedRef.current = true;
    },
    onBlur: () => {
      isFocusedRef.current = false;
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (!initializedRef.current) return;
      setSaveStatus('unsaved');
      const json = currentEditor.getJSON();
      emitPatch(json, title, versionRef.current);
      debouncedSave(json);
    },
  });

  const { emitPatch, emitCursor, emitTypingStart, emitTypingStop, emitSave } = useNoteCollaboration({
    noteId: id ?? '',
    enabled: Boolean(id) && !isLoading,
    onRemotePatch: (patch) => {
      if (!editor || isFocusedRef.current) return;
      editor.commands.setContent(patch.content as never, false);
      if (patch.title !== undefined) setTitle(patch.title);
      versionRef.current = patch.version;
    },
    onNoteSaved: (payload) => {
      versionRef.current = payload.version;
      setSaveStatus('saved');
      void queryClient.invalidateQueries({ queryKey: ['note-versions', id] });
    },
  });

  useEffect(() => {
    const socket = getSocket();
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!note || !editor || initializedRef.current) return;
    setTitle(note.title);
    editor.commands.setContent(note.content as never);
    versionRef.current = note.currentVersion;
    initializedRef.current = true;
  }, [note, editor]);

  // `canEdit` is unknown (and defaults to false) until the note finishes loading,
  // which is baked into the editor at construction time — re-sync it explicitly
  // whenever the resolved role changes, otherwise the editor can get stuck read-only.
  useEffect(() => {
    editor?.setEditable(canEdit);
  }, [editor, canEdit]);

  const debouncedSave = useDebouncedCallback(async (content: unknown) => {
    setSaveStatus('saving');
    try {
      const result = await emitSave(content, title);
      if (result.success && result.version) {
        versionRef.current = result.version;
        setSaveStatus('saved');
      } else {
        throw new Error('save failed');
      }
    } catch {
      if (id) {
        try {
          await update.mutateAsync({ id, updates: { content: content as never, title } });
          setSaveStatus('saved');
        } catch {
          setSaveStatus('unsaved');
          toast.error('Failed to save — check your connection');
        }
      }
    }
  }, 1200);

  const debouncedTitleSave = useDebouncedCallback((newTitle: string) => {
    if (!id || !initializedRef.current) return;
    setSaveStatus('unsaved');
    emitPatch(editor?.getJSON() ?? {}, newTitle, versionRef.current);
    debouncedSave(editor?.getJSON() ?? {});
  }, 600);

  const debouncedTypingStop = useDebouncedCallback(() => emitTypingStop(), 1500);

  useEffect(() => {
    if (!editor) return undefined;
    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      emitCursor(from, to);
      emitTypingStart();
      debouncedTypingStop();
    };
    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (isLoading) return <LoadingScreen label="Loading note…" />;

  if (!note) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">Note not found</p>
        <Button onClick={() => navigate(ROUTES.DASHBOARD)}>Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.DASHBOARD)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Input
          value={title}
          disabled={!canEdit}
          onChange={(e) => {
            setTitle(e.target.value);
            debouncedTitleSave(e.target.value);
          }}
          placeholder="Untitled"
          className="h-9 max-w-xs border-none bg-transparent text-lg font-semibold shadow-none focus-visible:ring-0"
        />

        <Badge variant="outline" className="gap-1 text-[10px]">
          {saveStatus === 'saving' && (
            <>
              <Clock className="h-3 w-3 animate-spin" /> Saving…
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check className="h-3 w-3" /> Saved
            </>
          )}
          {saveStatus === 'unsaved' && 'Unsaved changes'}
        </Badge>

        {isSocketConnected ? (
          <Wifi className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <WifiOff className="h-3.5 w-3.5 text-destructive" />
        )}

        <div className="ml-auto flex items-center gap-2">
          <CollaboratorAvatars />
          {canEdit && (
            <AIToolbarMenu
              noteId={note._id}
              editor={editor}
              onTitleGenerated={(generated) => {
                setTitle(generated);
                debouncedTitleSave(generated);
              }}
              onTagsGenerated={(tags) => update.mutate({ id: note._id, updates: { tags } })}
            />
          )}
          <Button variant="ghost" size="icon" onClick={() => togglePin.mutate(note._id)}>
            <Pin className={note.isPinned ? 'h-4 w-4 fill-primary text-primary' : 'h-4 w-4'} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toggleFavorite.mutate(note._id)}>
            <Star className={note.isFavorite ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4'} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setHistoryOpen(true)}>
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCommentsOpen((v) => !v)}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          {role === 'owner' && (
            <Button size="sm" onClick={() => setShareOpen(true)}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
          )}
        </div>
      </header>

      {canEdit && <EditorToolbar editor={editor} onInsertImage={() => setImageDialogOpen(true)} />}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-3xl px-8 py-10">
            <EditorContent editor={editor} />
          </div>
        </div>
        {isCommentsOpen && <CommentsPanel noteId={note._id} onClose={() => setCommentsOpen(false)} />}
      </div>

      <footer className="flex items-center gap-3 border-t border-border px-4 py-1.5 text-xs text-muted-foreground">
        <button className="flex items-center gap-1 hover:text-foreground" onClick={() => setAttachmentsOpen(true)}>
          <Paperclip className="h-3 w-3" /> Attachments
        </button>
        <span>·</span>
        <span>{note.wordCount} words</span>
        <span>·</span>
        <span className="capitalize">Viewing as {role}</span>
      </footer>

      <ShareDialog note={note} open={isShareOpen} onOpenChange={setShareOpen} />
      <VersionHistoryDialog noteId={note._id} open={isHistoryOpen} onOpenChange={setHistoryOpen} />
      <AttachmentsDialog noteId={note._id} open={isAttachmentsOpen} onOpenChange={setAttachmentsOpen} />
      <ImageDialog noteId={note._id} editor={editor} open={isImageDialogOpen} onOpenChange={setImageDialogOpen} />
    </div>
  );
}
