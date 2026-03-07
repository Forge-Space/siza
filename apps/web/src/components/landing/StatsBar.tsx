'use client';

import { useCountUp } from '@/hooks/use-count-up';
import { FadeIn } from './FadeIn';

const stats = [
  { end: 1500, suffix: '+', label: 'Tests Across Ecosystem' },
  { end: 502, suffix: '', label: 'Component & Backend Snippets' },
  { end: 5, suffix: '', label: 'Quality Validation Gates' },
  { end: 7, suffix: '', label: 'Open Source Repos' },
];

function StatItem({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const { ref, display } = useCountUp({ end, duration: 2000 });
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-foreground">
        <span ref={ref} className="text-violet-400">
          {display}
        </span>
        <span className="text-violet-400">{suffix}</span>
      </div>
      <p className="text-[13px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export function StatsBar() {
  return (
    <div className="relative border-y border-violet-500/10 bg-surface/50 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.04) 50%, transparent)',
        }}
      />
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-20 py-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-violet-500/10">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <StatItem end={stat.end} suffix={stat.suffix} label={stat.label} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
