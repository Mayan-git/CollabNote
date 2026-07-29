import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { noteService, NoteListParams } from '@/services/note.service';
import { extractErrorMessage } from '@/services/apiClient';
import { CollaboratorRole } from '@/types';

export function useNotes(params: NoteListParams) {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: () => noteService.list(params),
  });
}

export function useNote(id: string | undefined) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => noteService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useNoteMutations() {
  const queryClient = useQueryClient();

  const invalidateNotes = () => {
    void queryClient.invalidateQueries({ queryKey: ['notes'] });
  };

  const create = useMutation({
    mutationFn: noteService.create,
    onSuccess: invalidateNotes,
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const update = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof noteService.update>[1] }) =>
      noteService.update(id, updates),
    onSuccess: (note) => {
      queryClient.setQueryData(['note', note._id], (old: { note: typeof note; role: CollaboratorRole } | undefined) =>
        old ? { ...old, note } : old,
      );
      invalidateNotes();
    },
  });

  const togglePin = useMutation({ mutationFn: noteService.togglePin, onSuccess: invalidateNotes });
  const toggleFavorite = useMutation({ mutationFn: noteService.toggleFavorite, onSuccess: invalidateNotes });
  const toggleArchive = useMutation({ mutationFn: noteService.toggleArchive, onSuccess: invalidateNotes });

  const trash = useMutation({
    mutationFn: noteService.trash,
    onSuccess: () => {
      invalidateNotes();
      toast.success('Note moved to trash');
    },
  });

  const restore = useMutation({
    mutationFn: noteService.restore,
    onSuccess: () => {
      invalidateNotes();
      toast.success('Note restored');
    },
  });

  const permanentlyDelete = useMutation({
    mutationFn: noteService.permanentlyDelete,
    onSuccess: () => {
      invalidateNotes();
      toast.success('Note permanently deleted');
    },
  });

  const duplicate = useMutation({
    mutationFn: noteService.duplicate,
    onSuccess: () => {
      invalidateNotes();
      toast.success('Note duplicated');
    },
  });

  return { create, update, togglePin, toggleFavorite, toggleArchive, trash, restore, permanentlyDelete, duplicate };
}
