import { Star, Pin, Archive, Trash2 } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { NoteGrid } from '@/components/notes/NoteGrid';
import { EmptyState } from '@/components/common/EmptyState';

const ICONS = { favorites: Star, pinned: Pin, archived: Archive, trash: Trash2 } as const;

interface Props {
  filter: 'favorites' | 'pinned' | 'archived' | 'trash';
  title: string;
}

export default function NotesListPage({ filter, title }: Props) {
  const { data, isLoading } = useNotes({ filter, limit: 24 });
  const Icon = ICONS[filter];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{data?.pagination.totalItems ?? 0} notes</p>
      </div>

      {!isLoading && data?.items.length === 0 ? (
        <EmptyState icon={Icon} title={`No notes in ${title.toLowerCase()}`} description="Notes will appear here once available." />
      ) : (
        <NoteGrid notes={data?.items} isLoading={isLoading} view={filter === 'trash' ? 'trash' : 'default'} />
      )}
    </div>
  );
}
