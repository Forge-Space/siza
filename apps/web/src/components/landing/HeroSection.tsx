'use client';

import { ArrowRight, BookOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CONTAINER } from './constants';
import { highlightLine, lineStartColor } from './highlight';

const DEMO_STEPS = [
  {
    label: 'prompt',
    lines: ['$ siza generate --component ProductCard', '  > Analyzing codebase context...'],
  },
  {
    label: 'generating',
    lines: [
      '  > Applying design tokens...',
      '',
      'import { Badge } from "@/components/ui/badge";',
      'import { Card, CardContent } from "@/components/ui/card";',
      '',
      'export function ProductCard({ product }: Props) {',
      '  return (',
      '    <Card className="group border border-border">',
      '      <CardContent className="p-4">',
      '        <Badge variant="secondary">{product.category}</Badge>',
      '        <h3 className="mt-2 font-semibold">{product.name}</h3>',
      '        <p className="text-sm text-muted-foreground">{product.price}</p>',
      '      </CardContent>',
      '    </Card>',
      '  );',
      '}',
    ],
  },
  {
    label: 'done',
    lines: [
      '',
      '  ✓ Component generated (623ms)',
      '  ✓ TypeScript types inferred',
      '  ✓ Quality gates passed',
    ],
  },
];

const INITIAL_DISPLAYED = [DEMO_STEPS[0].lines[0]];
const INITIAL_LINE_IDX = 1;

function AnimatedCodeDemo() {
  const [stepIdx, setStepIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(INITIAL_LINE_IDX);
  const [charIdx, setCharIdx] = useState(0);
  const [displayed, setDisplayed] = useState<string[]>(INITIAL_DISPLAYED);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const step = DEMO_STEPS[stepIdx];
    if (!step) return;

    const currentLine = step.lines[lineIdx] ?? '';
    const isLastLine = lineIdx >= step.lines.length - 1;
    const isLastStep = stepIdx >= DEMO_STEPS.length - 1;

    if (charIdx < currentLine.length) {
      timeoutRef.current = setTimeout(() => {
        setCharIdx((c) => c + 1);
      }, 18);
    } else {
      const newDisplayed = [...displayed, currentLine];
      timeoutRef.current = setTimeout(
        () => {
          setDisplayed(newDisplayed);
          if (isLastLine) {
            if (isLastStep) {
              timeoutRef.current = setTimeout(() => {
                setStepIdx(0);
                setLineIdx(INITIAL_LINE_IDX);
                setCharIdx(0);
                setDisplayed(INITIAL_DISPLAYED);
              }, 3200);
            } else {
              setStepIdx((s) => s + 1);
              setLineIdx(0);
              setCharIdx(0);
            }
          } else {
            setLineIdx((l) => l + 1);
            setCharIdx(0);
          }
        },
        isLastLine && isLastStep ? 0 : 60
      );
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, lineIdx, charIdx]);

  const step = DEMO_STEPS[stepIdx];
  const currentLine = step?.lines[lineIdx] ?? '';
  const partialLine = currentLine.slice(0, charIdx);

  return (
    <div className="max-w-3xl mx-auto rounded-xl border border-[#27272A] bg-[#18181B] overflow-hidden mt-16 shadow-[0_8px_48px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272A]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="ml-2 text-xs text-[#71717A] font-mono">Terminal</span>
      </div>
      <div className="p-5 font-mono text-[13px] leading-relaxed min-h-[220px]">
        {displayed.map((line, i) => {
          const isCheck = line.startsWith('  ✓');
          const isPrompt = line.startsWith('  >');
          const isCmd = line.startsWith('$');
          return (
            <div key={i}>
              {isCheck ? (
                <span className="text-emerald-400">{line}</span>
              ) : isPrompt ? (
                <span className="text-violet-400">{line}</span>
              ) : isCmd ? (
                <span style={{ color: '#FAFAFA' }}>{line}</span>
              ) : (
                highlightLine(line)
              )}
            </div>
          );
        })}
        {partialLine !== undefined && (
          <div>
            {currentLine.startsWith('  ✓') ? (
              <span className="text-emerald-400">{partialLine}</span>
            ) : currentLine.startsWith('  >') ? (
              <span className="text-violet-400">{partialLine}</span>
            ) : currentLine.startsWith('$') ? (
              <span style={{ color: '#FAFAFA' }}>{partialLine}</span>
            ) : (
              <span style={{ color: lineStartColor(currentLine) }}>{partialLine}</span>
            )}
            <span className="inline-block w-[2px] h-[14px] bg-violet-400 align-middle ml-[1px] animate-[cursor-blink_1s_step-end_infinite]" />
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div
        className="absolute w-[600px] h-[400px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.10), transparent 70%)',
        }}
      />

      <div className={`${CONTAINER} relative z-10 text-center`}>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/8 px-4 py-1.5 text-xs font-mono text-violet-300">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          Open source · BYOK · Self-hostable
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.02em] leading-[1.05] mt-6 text-[#FAFAFA]">
          Ship governed UI code
          <br />
          <span className="text-violet-400">without the generic slop</span>
        </h1>

        <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto mt-6">
          Siza generates React and Next.js components that fit your design system, pass quality
          gates, and include TypeScript types and tests. Bring your own API key; no lock-in.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <a
            href="/signup"
            className="inline-flex items-center gap-2 bg-violet-600 text-white rounded-lg px-6 py-3 text-sm font-medium transition-colors duration-150 hover:bg-violet-500"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/docs"
            className="inline-flex items-center gap-2 border border-[#27272A] rounded-lg px-6 py-3 text-sm font-medium text-[#FAFAFA] hover:bg-violet-500/5 hover:border-violet-500/30 transition-colors duration-150"
          >
            <BookOpen className="w-4 h-4" />
            Read the docs
          </a>
        </div>

        <AnimatedCodeDemo />
      </div>
    </section>
  );
}
