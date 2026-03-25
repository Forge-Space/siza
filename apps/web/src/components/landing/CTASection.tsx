import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';

const PROOF_ITEMS = [
  {
    value: 'MIT',
    label: 'Open Source License',
    sublabel: 'Fork it, self-host it, audit it.',
  },
  {
    value: 'BYOK',
    label: 'Bring Your Own Key',
    sublabel: 'Your API credits. No vendor lock-in.',
  },
  {
    value: '5-layer',
    label: 'Quality Gates',
    sublabel: 'Every generation is scored before delivery.',
  },
  {
    value: '12+',
    label: 'AI Providers',
    sublabel: 'Swap models without changing code.',
  },
];

export function CTASection() {
  return (
    <section className="relative border-t border-[#27272A] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.10), transparent 70%)',
        }}
      />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-20 py-20 sm:py-24 lg:py-32">
        <div className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#27272A] rounded-xl overflow-hidden mb-20">
            {PROOF_ITEMS.map((item) => (
              <div key={item.label} className="bg-[#121214] px-6 py-6 text-center">
                <div className="text-2xl font-extrabold tracking-[-0.02em] text-violet-400 mb-1">
                  {item.value}
                </div>
                <div className="text-xs text-[#FAFAFA] font-medium mb-1">{item.label}</div>
                <div className="text-[11px] text-[#71717A] leading-snug">{item.sublabel}</div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto text-center mb-20">
            <div className="rounded-xl border border-[#27272A] bg-[#18181B] px-8 py-10">
              <p className="text-sm font-mono text-violet-400 tracking-[0.15em] uppercase mb-6">
                How it works
              </p>
              <ol className="text-left space-y-4 text-sm text-[#A1A1AA]">
                <li className="flex gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-mono flex items-center justify-center">
                    1
                  </span>
                  <span>Connect your design tokens and component library via MCP or config file.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-mono flex items-center justify-center">
                    2
                  </span>
                  <span>Run a generation. Siza applies your governance rules and routes to your preferred model.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-mono flex items-center justify-center">
                    3
                  </span>
                  <span>Review the quality scorecard. Accept code that passed all gates; iterate on anything flagged.</span>
                </li>
              </ol>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-center mb-4 text-[#FAFAFA]">
            Start with a project that ships
          </h2>

          <p className="text-lg text-[#A1A1AA] text-center max-w-xl mx-auto mb-10">
            Open source, MIT licensed. Bring your own API key and run it anywhere.
            No credit card required to get started.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-8 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors duration-150"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/Forge-Space"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#27272A] rounded-lg px-8 py-3 text-sm font-medium text-[#FAFAFA] hover:bg-[#27272A]/50 inline-flex items-center justify-center gap-2 transition-colors duration-150"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm text-[#71717A]">
            <Link href="/pricing" className="hover:text-[#A1A1AA] transition-colors duration-150">
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-[#A1A1AA] transition-colors duration-150">
              Docs
            </Link>
            <Link href="/roadmap" className="hover:text-[#A1A1AA] transition-colors duration-150">
              Roadmap
            </Link>
            <Link href="/about" className="hover:text-[#A1A1AA] transition-colors duration-150">
              About
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
