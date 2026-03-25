import {
  Sparkles,
  GitBranch,
  FolderOpen,
  LayoutGrid,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { CONTAINER, SECTION_PADDING } from './constants';

const QUALITY_CHECKS = [
  { label: 'Design token alignment', status: 'pass' },
  { label: 'TypeScript strict', status: 'pass' },
  { label: 'Accessibility audit', status: 'pass' },
  { label: 'Anti-generic detection', status: 'pass' },
  { label: 'Test coverage scaffold', status: 'warn' },
];

function StatusIcon({ status }: { status: string }) {
  if (status === 'pass')
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  if (status === 'warn')
    return <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  return <Clock className="w-3.5 h-3.5 text-[#52525B] shrink-0" />;
}

export function DashboardPreview() {
  return (
    <section id="preview" className={`${SECTION_PADDING} border-t border-[#27272A]`}>
      <div className={CONTAINER}>
        <div className="text-center">
          <div className="text-sm font-mono text-violet-400 tracking-[0.15em] uppercase mb-4">
            Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-[#FAFAFA] mb-4">
            Generation with governance built in
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto mb-14">
            Every run produces a quality scorecard alongside the code. You always know what shipped
            and why it passed.
          </p>
        </div>

        <div
          className="max-w-4xl mx-auto rounded-xl border border-[#27272A] overflow-hidden"
          style={{ boxShadow: '0 0 48px rgba(139,92,246,0.06)' }}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-[#18181B] border-b border-[#27272A]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <div className="text-xs text-[#71717A] font-mono mx-auto">
              siza.forgespace.co/generate
            </div>
          </div>

          <div className="flex min-h-[420px] bg-[#121214]">
            <div className="w-[200px] border-r border-[#27272A] p-4 hidden sm:block">
              <nav className="space-y-0.5">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-violet-500/10 text-violet-300 border-l-2 border-violet-500">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Generate</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A1A1AA]">
                  <GitBranch className="w-4 h-4 shrink-0" />
                  <span>Golden Paths</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A1A1AA]">
                  <FolderOpen className="w-4 h-4 shrink-0" />
                  <span>Projects</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A1A1AA]">
                  <LayoutGrid className="w-4 h-4 shrink-0" />
                  <span>Catalog</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A1A1AA]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Governance</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A1A1AA]">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Settings</span>
                </div>
              </nav>
            </div>

            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-5 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#FAFAFA]">ProductCard</h3>
                  <p className="text-xs text-[#71717A] mt-0.5 font-mono">
                    Generated · 2 minutes ago
                  </p>
                </div>
                <span className="shrink-0 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md px-2 py-0.5">
                  4 / 5 passed
                </span>
              </div>

              <div className="space-y-2 mb-6">
                {QUALITY_CHECKS.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center gap-2.5 rounded-lg border border-[#27272A] bg-[#18181B] px-3 py-2"
                  >
                    <StatusIcon status={check.status} />
                    <span className="text-xs text-[#A1A1AA]">{check.label}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-[#27272A] bg-[#18181B] p-4">
                <div className="text-xs font-mono text-[#71717A] mb-2">Output preview</div>
                <div className="font-mono text-[11px] text-[#A1A1AA] leading-relaxed">
                  <span className="text-violet-400">export</span>{' '}
                  <span className="text-violet-400">function</span>{' '}
                  <span className="text-[#FAFAFA]">ProductCard</span>
                  <span className="text-[#71717A]">{'({ product }: Props) {'}</span>
                  <br />
                  <span className="text-[#71717A] pl-4">{'// 47 lines · TypeScript strict'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
