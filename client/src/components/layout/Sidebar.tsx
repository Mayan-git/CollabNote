import { NavLink, useNavigate } from 'react-router-dom';
import {
  NotebookPen,
  Home,
  Star,
  Pin,
  Archive,
  Trash2,
  Settings,
  Plus,
  Folder as FolderIcon,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';
import { useUIStore } from '@/store/uiStore';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useFolders } from '@/hooks/useFolders';
import { useNoteMutations } from '@/hooks/useNotes';

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: 'Home', icon: Home, end: true },
  { to: ROUTES.FAVORITES, label: 'Favorites', icon: Star },
  { to: ROUTES.PINNED, label: 'Pinned', icon: Pin },
  { to: ROUTES.ARCHIVE, label: 'Archive', icon: Archive },
  { to: ROUTES.TRASH, label: 'Trash', icon: Trash2 },
];

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: workspaces } = useWorkspaces();
  const workspaceId = workspaces?.[0]?._id;
  const { data: folders } = useFolders(workspaceId);
  const { create } = useNoteMutations();
  const navigate = useNavigate();

  const handleNewNote = () => {
    if (!workspaceId) return;
    create.mutate(
      { workspace: workspaceId },
      { onSuccess: (note) => navigate(ROUTES.NOTE(note._id)) },
    );
  };

  if (isSidebarCollapsed) {
    return (
      <aside className="flex w-16 flex-col items-center gap-4 border-r border-border bg-card py-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Expand sidebar">
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button size="icon" onClick={handleNewNote} aria-label="New note">
          <Plus className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between px-4 py-4">
        <NavLink to={ROUTES.DASHBOARD} className="flex items-center gap-2 font-semibold">
          <NotebookPen className="h-5 w-5 text-primary" />
          CollabNote
        </NavLink>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Collapse sidebar">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-3">
        <Button className="w-full justify-start gap-2" onClick={handleNewNote} disabled={create.isPending}>
          <Plus className="h-4 w-4" /> New note
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {Boolean(folders?.length) && (
          <div className="mt-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Folders</p>
            <nav className="mt-2 space-y-1">
              {folders?.map((folder) => (
                <NavLink
                  key={folder._id}
                  to={`${ROUTES.DASHBOARD}?folder=${folder._id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <FolderIcon className="h-4 w-4" style={{ color: folder.color }} />
                  {folder.name}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-border p-3">
        <NavLink
          to={ROUTES.SETTINGS}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )
          }
        >
          <Settings className="h-4 w-4" /> Settings
        </NavLink>
      </div>
    </aside>
  );
}
