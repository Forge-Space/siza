import { Layers, GitFork, ShieldCheck, CheckSquare, Boxes, Brain } from 'lucide-react';
import { CONTAINER, SECTION_PADDING } from './constants';

const capabilities = [
  {
    icon: Layers,
    title: 'Architecture-aware scaffolds',
    description:
      'Service layers, middleware, and proper separation of concerns. Every scaffold follows patterns that hold up at scale.',
  },
  {
    icon: ShieldCheck,
    title: 'Security by default',
    description:
      'BYOK encryption, RLS policies, input validation, and SOC 2-ready patterns baked into every generated project.',
  },
  {
    icon: CheckSquare,
    title: 'Five-layer quality gates',
    description:
      'Anti-generic detection, accessibility audit, and diversity tracking run before code ships. You see the scorecard every time.',
  },
  {
    icon: Boxes,
    title: 'Full-stack templates',
    description:
      'SaaS, API, and monorepo starters with auth, billing, database, and tests included. Not just component shells.',
  },
  {
    icon: Brain,
    title: 'Codebase-aware generation',
    description:
      'MCP-native tools read your design tokens, component library, and brand config. Output fits your system, not a generic one.',
  },
  {
    icon: GitFork,
    title: 'Multi-provider routing',
    description:
      '12+ AI providers behind a single interface. Swap models without touching your code; automatic failover keeps generation running.',
  },
];

const iconColor = 'text-violet-400';
const iconBg = 'bg-violet-500/10';

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className={SECTION_PADDING}>
      <div className={CONTAINER}>
        <div className="text-center">
          <p className="text-sm font-mono text-violet-400 tracking-[0.15em] uppercase mb-4">
            Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-[#FAFAFA] mb-4">
            Built for production, not demos
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">
            Siza applies governance rules, design-system context, and quality checks that generic
            generators skip.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="group bg-[#18181B] border border-[#27272A] rounded-xl p-6 transition-colors duration-150 hover:border-violet-500/25"
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-lg ${iconBg} mb-4`}
                >
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-[#FAFAFA] mb-2">{cap.title}</h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{cap.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
