import { useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { useDefaultWorkspaceId } from '@/hooks/useWorkspaces';
import { NoteGrid } from '@/components/notes/NoteGrid';
import { EmptyState } from '@/components/common/EmptyState';

export default function DashboardHomePage() {
  const [searchParams] = useSearchParams();
  const workspaceId = useDefaultWorkspaceId();
  const search = searchParams.get('search') ?? undefined;
  const folder = searchParams.get('folder') ?? undefined;

  const { data, isLoading } = useNotes({ filter: 'all', search, folder, limit: 24 });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{search ? `Results for "${search}"` : 'All notes'}</h1>
        <p className="text-sm text-muted-foreground">
          {workspaceId ? `${data?.pagination.totalItems ?? 0} notes` : 'Setting up your workspace…'}
        </p>
      </div>

      {!isLoading && data?.items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes yet"
          description="Create your first note using the New note button in the sidebar."
        />
      ) : (
        <NoteGrid notes={data?.items} isLoading={isLoading} />
      )}
    </div>
  );
}
