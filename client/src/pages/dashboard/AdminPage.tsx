import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Users, FileText, Activity, HardDrive, Ban, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin.service';
import { extractErrorMessage } from '@/services/apiClient';

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

function OverviewTab() {
  const { data: analytics } = useQuery({ queryKey: ['admin', 'analytics'], queryFn: adminService.getAnalytics });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={analytics?.totalUsers ?? '—'} />
        <StatCard icon={FileText} label="Total notes" value={analytics?.totalNotes ?? '—'} />
        <StatCard icon={Activity} label="Active today" value={analytics?.activeToday ?? '—'} />
        <StatCard icon={HardDrive} label="Storage used" value={analytics ? formatBytes(analytics.totalStorageBytes) : '—'} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signups (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.signupsOverTime}>
              <defs>
                <linearGradient id="signups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="_id" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#4f46e5" fill="url(#signups)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes created (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.notesOverTime}>
              <defs>
                <linearGradient id="notes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="_id" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#22c55e" fill="url(#notes)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin', 'users', search], queryFn: () => adminService.listUsers(1, search) });

  const suspend = useMutation({
    mutationFn: ({ id, isSuspended }: { id: string; isSuspended: boolean }) => adminService.suspendUser(id, isSuspended),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User deleted');
    },
  });

  return (
    <div className="space-y-4">
      <Input placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      <Card>
        <div className="divide-y divide-border">
          {data?.items.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">
                  {user.name} {user.isSuspended && <Badge variant="destructive" className="ml-2">Suspended</Badge>}
                  {user.role === 'admin' && <Badge className="ml-2">Admin</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => suspend.mutate({ id: user._id, isSuspended: !user.isSuspended })}
                >
                  <Ban className="h-3.5 w-3.5" /> {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => remove.mutate(user._id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function NotesTab() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin', 'notes', search], queryFn: () => adminService.listNotes(1, search) });

  const remove = useMutation({
    mutationFn: adminService.deleteNote,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'notes'] });
      toast.success('Note deleted');
    },
  });

  return (
    <div className="space-y-4">
      <Input placeholder="Search notes…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      <Card>
        <div className="divide-y divide-border">
          {data?.items.map((note) => (
            <div key={note._id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{note.title || 'Untitled'}</p>
                <p className="text-xs text-muted-foreground">by {note.owner.name}</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => remove.mutate(note._id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function LogsTab() {
  const { data } = useQuery({ queryKey: ['admin', 'logs'], queryFn: () => adminService.listLogs(1) });

  return (
    <Card>
      <div className="divide-y divide-border">
        {data?.items.map((log) => (
          <div key={log._id} className="flex items-center justify-between p-4 text-sm">
            <span>
              <strong>{log.actor?.name ?? 'Unknown'}</strong> — {log.action.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin panel</h1>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="logs">Activity logs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTab />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
