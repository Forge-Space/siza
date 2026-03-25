'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@siza/ui';
import { Card, CardContent } from '@siza/ui';
import { useGeneration } from '@/hooks/use-generation';
import { trackEvent } from '@/components/analytics/AnalyticsProvider';

const SAMPLE_PROMPT =
  'A modern pricing card with three tiers (Free, Pro, Enterprise), purple gradient accents, dark theme, React + Tailwind CSS';

interface GenerateStepProps {
  project: { id: string; name: string; framework: string } | null;
  onNext: (data: { generatedCode: string }) => void;
  onSkip: () => void;
}

export function GenerateStep({ project, onNext, onSkip }: GenerateStepProps) {
  const { isGenerating, progress, code, error, startGeneration } = useGeneration(project?.id);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    trackEvent({
      action: 'onboarding_cta_clicked',
      category: 'Onboarding',
      label: 'generate',
      params: { step: 'generate', cta: 'generate_sample' },
    });
    const framework = (project?.framework as 'react' | 'vue' | 'angular' | 'svelte') ?? 'react';

    const result = await startGeneration({
      framework,
      description: SAMPLE_PROMPT,
      componentName: 'PricingCard',
      prompt: SAMPLE_PROMPT,
    });

    if (result?.code) {
      setGenerated(true);
    }
  };

  if (generated && code) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-white">Component generated</h1>
          <p className="text-sm text-white/60">
            Generated <code className="text-violet-400">PricingCard</code> for{' '}
            {project?.name ?? 'your project'}.
          </p>
        </div>

        <Card className="border-white/5 bg-white/[0.02] overflow-hidden">
          <CardContent className="p-0">
            <pre
              className="max-h-60 overflow-auto p-4 text-xs text-white/60 leading-relaxed"
              aria-label="Generated component code preview"
            >
              <code>
                {code.slice(0, 800)}
                {code.length > 800 ? '\n…' : ''}
              </code>
            </pre>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={() => {
              trackEvent({
                action: 'onboarding_cta_clicked',
                category: 'Onboarding',
                label: 'generate',
                params: { step: 'generate', cta: 'continue' },
              });
              onNext({ generatedCode: code });
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-white">Try a generation</h1>
        <p className="text-sm text-white/60">Run the sample below to see generation in action.</p>
      </div>

      <Card className="border-white/5 bg-white/[0.02]">
        <CardContent className="pt-6 space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-white/30">Sample prompt</p>
          <p className="text-sm text-white/70 leading-relaxed">{SAMPLE_PROMPT}</p>
        </CardContent>
      </Card>

      {isGenerating && (
        <div className="space-y-2" aria-live="polite" aria-label="Generation in progress">
          <div className="flex items-center justify-center gap-2 text-sm text-white/50">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Generating… {Math.round(progress)}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-center text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-center gap-3">
        <Button
          variant="ghost"
          onClick={() => {
            trackEvent({
              action: 'onboarding_cta_clicked',
              category: 'Onboarding',
              label: 'generate',
              params: { step: 'generate', cta: 'skip' },
            });
            onSkip();
          }}
          className="text-white/40 hover:text-white/60"
          disabled={isGenerating}
        >
          Skip for now
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating…' : 'Run sample'}
        </Button>
      </div>
    </div>
  );
}
