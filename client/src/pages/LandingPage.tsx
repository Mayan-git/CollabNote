import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  NotebookPen,
  Users,
  Sparkles,
  ShieldCheck,
  Zap,
  History,
  MessageSquare,
  Menu,
  X,
  Check,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

const FEATURES = [
  { icon: Users, title: 'Real-time collaboration', description: 'See live cursors, presence, and typing indicators as your team edits together.' },
  { icon: Sparkles, title: 'AI-powered writing', description: 'Summarize, rewrite, translate, and generate titles and tags with one click.' },
  { icon: History, title: 'Version history', description: 'Automatic snapshots and one-click restore so you never lose work.' },
  { icon: MessageSquare, title: 'Inline comments', description: 'Discuss ideas directly inside your notes with threaded, resolvable comments.' },
  { icon: ShieldCheck, title: 'Enterprise-grade security', description: 'JWT auth, refresh rotation, rate limiting, and encrypted sessions by default.' },
  { icon: Zap, title: 'Built for speed', description: 'Optimistic UI, debounced autosave, and virtualized lists keep things snappy.' },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    description: 'For individuals getting started',
    features: ['Up to 50 notes', 'Basic AI features', '1 workspace', 'Community support'],
  },
  {
    name: 'Pro',
    price: '$12',
    description: 'For power users and small teams',
    features: ['Unlimited notes', 'Full AI toolkit', 'Real-time collaboration', 'Version history', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$29',
    description: 'For growing organizations',
    features: ['Everything in Pro', 'Admin dashboard', 'Advanced permissions', 'Audit logs', 'SSO (coming soon)'],
  },
];

const FAQS = [
  { q: 'Is there a free plan?', a: 'Yes — the Free plan supports up to 50 notes with core AI and collaboration features.' },
  { q: 'Can I self-host CollabNote?', a: 'CollabNote ships with Docker Compose for local and self-hosted deployments.' },
  { q: 'How does real-time sync work?', a: 'We use Socket.IO with a Redis adapter to broadcast live edits, presence, and cursors across collaborators.' },
  { q: 'Is my data encrypted?', a: 'All traffic is served over HTTPS, passwords are hashed with bcrypt, and sessions use rotating JWTs.' },
];

const TESTIMONIALS = [
  { name: 'Maya Chen', role: 'Product Lead, Nimbus', quote: 'CollabNote replaced three different tools for our team. The real-time editing feels as smooth as Google Docs.' },
  { name: 'Daniel Ortiz', role: 'Engineering Manager', quote: 'The AI summary feature alone saves me an hour a week during standup prep.' },
  { name: 'Priya Nair', role: 'Founder, Loop Studio', quote: 'Clean, fast, and the version history has saved us more than once.' },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-lg font-semibold">
          <NotebookPen className="h-6 w-6 text-primary" />
          CollabNote
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link to={ROUTES.LOGIN}>Log in</Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.SIGNUP}>Get started free</Link>
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium">
            <a href="#features" onClick={() => setOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setOpen(false)}>FAQ</a>
            <Link to={ROUTES.LOGIN}>Log in</Link>
            <Button asChild>
              <Link to={ROUTES.SIGNUP}>Get started free</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-background">
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-24 pt-20 text-center">
        <div className="absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Now with AI-powered writing
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Write together, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">in real time.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            CollabNote is the real-time collaborative note editor for teams who want Google Docs' fluidity with Notion's structure — and AI built in.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to={ROUTES.SIGNUP}>Get started for free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to={ROUTES.LOGIN}>Log in</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-16 max-w-5xl rounded-2xl border border-border bg-card p-3 shadow-2xl"
        >
          <div className="flex items-center gap-1.5 border-b border-border px-3 pb-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="grid grid-cols-3 gap-4 p-6 text-left">
            <div className="col-span-2 space-y-3">
              <div className="h-4 w-1/2 rounded bg-secondary" />
              <div className="h-3 w-full rounded bg-secondary/70" />
              <div className="h-3 w-5/6 rounded bg-secondary/70" />
              <div className="h-3 w-3/4 rounded bg-secondary/70" />
            </div>
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-indigo-400" />
                <div className="h-2 w-16 rounded bg-secondary" />
              </div>
              <div className="h-2 w-full rounded bg-secondary/70" />
              <div className="h-2 w-4/5 rounded bg-secondary/70" />
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything your team needs</h2>
          <p className="mt-3 text-muted-foreground">A complete toolkit for modern collaborative writing.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full p-6">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Loved by teams everywhere</h2>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-6">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when your team grows.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={plan.highlighted ? 'relative border-primary shadow-lg' : ''}>
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <CardContent className="p-6">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-4 text-3xl font-bold">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" /> {feature}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" variant={plan.highlighted ? 'default' : 'outline'} asChild>
                  <Link to={ROUTES.SIGNUP}>Get started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="faq" className="bg-secondary/40 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-12 space-y-4">
            {FAQS.map((faq) => (
              <Card key={faq.q} className="p-5">
                <p className="font-medium">{faq.q}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to write together?</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Join teams already collaborating in real time with CollabNote.</p>
        <Button size="lg" className="mt-8" asChild>
          <Link to={ROUTES.SIGNUP}>Get started for free</Link>
        </Button>
      </section>

      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-sm font-semibold">
            <NotebookPen className="h-5 w-5 text-primary" />
            CollabNote
          </Link>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CollabNote. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
