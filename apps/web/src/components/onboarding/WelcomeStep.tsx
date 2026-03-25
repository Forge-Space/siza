'use client';

import { Layers, Code2, MessageSquare } from 'lucide-react';
import { Button } from '@siza/ui';
import { Card, CardContent } from '@siza/ui';
import { trackEvent } from '@/components/analytics/AnalyticsProvider';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const capabilities = [
  {
    icon: Layers,
    title: 'Component generation',
    description: 'Describe a component in plain text and receive production-ready code.',
  },
  {
    icon: Code2,
    title: 'Live preview',
    description: 'Render output immediately and copy it into your project.',
  },
  {
    icon: MessageSquare,
    title: 'Conversational iteration',
    description: 'Refine the result with follow-up prompts until it matches your intent.',
  },
];

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-white">Welcome to Siza</h1>
        <p className="text-sm text-white/60">Set up your workspace in three steps.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {capabilities.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="border-white/5 bg-white/[0.02]">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                <Icon className="h-5 w-5 text-white/50" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-medium text-white">{title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <Button
          variant="ghost"
          onClick={() => {
            trackEvent({
              action: 'onboarding_cta_clicked',
              category: 'Onboarding',
              label: 'welcome',
              params: { step: 'welcome', cta: 'skip_tutorial' },
            });
            onSkip();
          }}
          className="text-white/40 hover:text-white/60"
        >
          Skip setup
        </Button>
        <Button
          onClick={() => {
            trackEvent({
              action: 'onboarding_cta_clicked',
              category: 'Onboarding',
              label: 'welcome',
              params: { step: 'welcome', cta: 'get_started' },
            });
            onNext();
          }}
        >
          Get started
        </Button>
      </div>
      <p className="text-center text-xs text-white/30">
        You can complete this later from your dashboard.
      </p>
    </div>
  );
}
