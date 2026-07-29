import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { ProfileMenu } from './ProfileMenu';
import { ROUTES } from '@/constants/routes';

export function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`${ROUTES.DASHBOARD}?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
      <form onSubmit={handleSearch} className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, tags…"
          className="pl-9"
        />
      </form>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <ProfileMenu />
      </div>
    </header>
  );
}
