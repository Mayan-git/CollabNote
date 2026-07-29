import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2, MailCheck } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { extractErrorMessage } from '@/services/apiClient';
import { ROUTES } from '@/constants/routes';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => authService.forgotPassword(values.email),
    onSuccess: () => setSent(true),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  if (sent) {
    return (
      <AuthLayout title="Check your inbox" subtitle="We sent password reset instructions if that email exists">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-secondary/40 p-8 text-center">
          <MailCheck className="h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">The link expires in 1 hour.</p>
          <Link to={ROUTES.LOGIN} className="text-sm font-medium text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password" subtitle="Enter your email and we'll send you a reset link">
      <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
