import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { invitationService } from '@/services/invitation.service';
import { extractErrorMessage } from '@/services/apiClient';
import { ROUTES } from '@/constants/routes';

type Status = 'loading' | 'success' | 'error';

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    invitationService
      .accept(token)
      .then((note) => {
        setNoteId(note._id);
        setStatus('success');
      })
      .catch((err) => {
        setError(extractErrorMessage(err));
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      {status === 'loading' && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
      {status === 'success' && <CheckCircle2 className="h-10 w-10 text-emerald-500" />}
      {status === 'error' && <XCircle className="h-10 w-10 text-destructive" />}

      <p className="text-lg font-medium">
        {status === 'loading' && 'Accepting invitation…'}
        {status === 'success' && 'You now have access to this note'}
        {status === 'error' && (error || 'This invitation is invalid or has expired')}
      </p>

      {status === 'success' && noteId && (
        <button onClick={() => navigate(ROUTES.NOTE(noteId))} className="text-sm font-medium text-primary hover:underline">
          Open note
        </button>
      )}
      {status === 'error' && (
        <button onClick={() => navigate(ROUTES.DASHBOARD)} className="text-sm font-medium text-primary hover:underline">
          Go to dashboard
        </button>
      )}
    </div>
  );
}
