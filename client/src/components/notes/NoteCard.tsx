import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Pin, Star, MoreHorizontal, Users, Trash2, Archive, Copy, RotateCcw, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { Note } from '@/types';
import { useNoteMutations } from '@/hooks/useNotes';
import { cn } from '@/utils/cn';

function stripHtml(node: unknown, max = 140): string {
  const text = JSON.stringify(node ?? '')
    .replace(/[{}[\]"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, max);
}

export function NoteCard({ note, view = 'trash-hidden' }: { note: Note; view?: 'default' | 'trash' | 'trash-hidden' }) {
  const { togglePin, toggleFavorite, trash, restore, permanentlyDelete, duplicate, toggleArchive } = useNoteMutations();
  const isTrashView = view === 'trash';

  return (
    <Card className="group relative flex flex-col gap-3 p-4 transition-shadow hover:shadow-md">
      <Link to={ROUTES.NOTE(note._id)} className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl">{note.icon || '📝'}</span>
          <div className="flex items-center gap-1">
            {note.isPinned && <Pin className="h-3.5 w-3.5 fill-primary text-primary" />}
            {note.isFavorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
          </div>
        </div>
        <h3 className="line-clamp-1 font-semibold">{note.title || 'Untitled'}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{stripHtml(note.content) || 'No content yet'}</p>
      </Link>

      {Boolean(note.tags?.length) && (
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <Avatar className="h-6 w-6 border-2 border-card">
              <AvatarImage src={note.owner.avatarUrl} />
              <AvatarFallback className="text-[10px]">{note.owner.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          {note.collaborators.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {note.collaborators.length}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100')}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isTrashView ? (
            <>
              <DropdownMenuItem onClick={() => restore.mutate(note._id)}>
                <RotateCcw className="h-4 w-4" /> Restore
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => permanentlyDelete.mutate(note._id)}
              >
                <XCircle className="h-4 w-4" /> Delete permanently
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => togglePin.mutate(note._id)}>
                <Pin className="h-4 w-4" /> {note.isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFavorite.mutate(note._id)}>
                <Star className="h-4 w-4" /> {note.isFavorite ? 'Remove favorite' : 'Add favorite'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleArchive.mutate(note._id)}>
                <Archive className="h-4 w-4" /> {note.isArchived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicate.mutate(note._id)}>
                <Copy className="h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => trash.mutate(note._id)}>
                <Trash2 className="h-4 w-4" /> Move to trash
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}
