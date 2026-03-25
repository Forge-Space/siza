import type { ReactNode } from 'react';
import { GitBranch, Zap, Shield, Layers } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: Layers,
    title: 'Component generation',
    description: 'Describe a UI component, receive framework-idiomatic code with your tokens applied.',
  },
  {
    icon: GitBranch,
    title: 'Framework output',
    description: 'React, Next.js, Vue — output matches the stack you already use.',
  },
  {
    icon: Zap,
    title: 'Instant preview',
    description: 'Render, inspect, and copy output without leaving the editor.',
  },
  {
    icon: Shield,
    title: 'Private by default',
    description: 'Prompts and design tokens are not used for model training.',
  },
];

interface BaseSectionProps {
  children: ReactNode;
  className?: string;
}

interface HeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AuthCardShell({ children, className = '' }: BaseSectionProps) {
  return (
    <main
      id="main-content"
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-0 px-4 py-10 ${className}`}
    >
      <div className="pointer-events-none absolute left-1/2 top-[-20%] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px] opacity-40" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_20px_20px,var(--forge-border)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative z-10 w-full max-w-[440px] rounded-xl border border-border bg-surface p-8 shadow-2xl sm:p-10">
        {children}
      </div>
    </main>
  );
}

export function AuthSplitShell({ children, className = '' }: BaseSectionProps) {
  return (
    <main
      id="main-content"
      className={`relative flex min-h-screen overflow-hidden bg-surface-0 ${className}`}
    >
      {/* Left panel — product context, hidden on mobile */}
      <div className="relative hidden w-[480px] flex-shrink-0 flex-col justify-between overflow-hidden bg-[#0d0d12] px-12 py-14 lg:flex xl:w-[520px]">
        <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_20px_20px,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xl font-display font-bold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-xs">
              S
            </span>
            Siza
          </div>
          <p className="mt-2 text-xs text-zinc-500 tracking-wide">UI generation for engineers</p>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-xl font-semibold leading-snug text-white">
            From prompt to production-ready component
          </h2>
          <ul className="space-y-5">
            {CAPABILITIES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-zinc-800 text-zinc-400">
                  <Icon size={14} />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <div className="mb-4 h-px bg-zinc-800" />
          <p className="text-xs text-zinc-600">
            Siza does not train on your data.
          </p>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute left-1/2 top-[-20%] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px] opacity-30 lg:hidden" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_20px_20px,var(--forge-border)_1px,transparent_1px)] [background-size:40px_40px] lg:hidden" />
        <div className="relative z-10 w-full max-w-[420px] rounded-xl border border-border bg-surface p-8 shadow-2xl sm:p-10">
          {children}
        </div>
      </div>
    </main>
  );
}

export function MarketingSection({ children, className = '' }: BaseSectionProps) {
  return <section className={`mx-auto w-full max-w-6xl px-6 ${className}`}>{children}</section>;
}

export function DashboardSection({ title, description, actions }: HeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
        {description ? <p className="mt-2 text-sm text-text-secondary">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
