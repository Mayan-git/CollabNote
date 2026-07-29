import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2, Camera } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { extractErrorMessage } from '@/services/apiClient';

const profileSchema = z.object({ name: z.string().trim().min(2) });
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletePassword, setDeletePassword] = useState('');

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const updateProfile = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (updated) => {
      setUser(updated);
      toast.success('Profile updated');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const uploadAvatar = useMutation({
    mutationFn: userService.uploadAvatar,
    onSuccess: (updated) => {
      setUser(updated);
      toast.success('Avatar updated');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const changePassword = useMutation({
    mutationFn: ({ currentPassword, newPassword }: z.infer<typeof passwordSchema>) =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed — please log in again');
      window.location.href = '/login';
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const deleteAccount = useMutation({
    mutationFn: () => userService.deleteAccount(deletePassword),
    onSuccess: () => {
      window.location.href = '/';
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const togglePreference = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (updated) => setUser(updated),
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Public profile</CardTitle>
              <CardDescription>This information is visible to your collaborators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="text-lg">{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow"
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadAvatar.mutate(file);
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <form
                className="space-y-4"
                onSubmit={profileForm.handleSubmit((values) => updateProfile.mutate(values))}
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" {...profileForm.register('name')} />
                </div>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>Control how CollabNote keeps you updated.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Receive email updates for comments, mentions, and shares.</p>
                </div>
                <Switch
                  checked={user.preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    togglePreference.mutate({ preferences: { emailNotifications: checked } })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>You&apos;ll be logged out on other devices after changing your password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={passwordForm.handleSubmit((values) => changePassword.mutate(values))}>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                </div>
                <Button type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Delete account</CardTitle>
              <CardDescription>This permanently deletes your account and all owned notes. This cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deletePassword">Confirm your password</Label>
                <Input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>
              <Button
                variant="destructive"
                disabled={!deletePassword || deleteAccount.isPending}
                onClick={() => {
                  deleteAccount.mutate();
                  void queryClient.clear();
                }}
              >
                {deleteAccount.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete my account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
