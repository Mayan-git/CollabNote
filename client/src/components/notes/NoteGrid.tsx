import { Note } from '@/types';
import { NoteCard } from './NoteCard';
import { Skeleton } from '@/components/ui/skeleton';

export function NoteGrid({ notes, isLoading, view = 'default' }: { notes?: Note[]; isLoading: boolean; view?: 'default' | 'trash' }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {notes?.map((note) => (
        <NoteCard key={note._id} note={note} view={view} />
      ))}
    </div>
  );
}
