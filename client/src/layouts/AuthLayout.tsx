import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NotebookPen, Users, Sparkles, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const HIGHLIGHTS = [
  { icon: Users, text: 'Real-time collaboration with live cursors and presence' },
  { icon: Sparkles, text: 'AI-powered summaries, rewrites, and tag suggestions' },
  { icon: ShieldCheck, text: 'Enterprise-grade security with encrypted sessions' },
];

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 text-white lg:flex">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-lg font-semibold">
          <NotebookPen className="h-6 w-6" />
          CollabNote
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="mb-6 text-3xl font-bold leading-tight">Write together, in real time.</h2>
          <div className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-white/10 p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-white/90">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-xs text-white/60">© {new Date().getFullYear()} CollabNote. All rights reserved.</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <Link to={ROUTES.HOME} className="mb-8 flex items-center gap-2 text-lg font-semibold lg:hidden">
            <NotebookPen className="h-6 w-6 text-primary" />
            CollabNote
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
