import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthLayout title="Email verification" subtitle="Confirming your email address">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-secondary/40 p-8 text-center">
        {status === 'loading' && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
        {status === 'success' && <CheckCircle2 className="h-10 w-10 text-emerald-500" />}
        {status === 'error' && <XCircle className="h-10 w-10 text-destructive" />}

        <p className="text-sm text-muted-foreground">
          {status === 'loading' && 'Verifying your email…'}
          {status === 'success' && 'Your email has been verified successfully.'}
          {status === 'error' && 'This verification link is invalid or has expired.'}
        </p>

        <Link to={ROUTES.LOGIN} className="text-sm font-medium text-primary hover:underline">
          Continue to login
        </Link>
      </div>
    </AuthLayout>
  );
}
