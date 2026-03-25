'use client';

import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Start', aria: 'Step 1: Start' },
  { label: 'Project', aria: 'Step 2: Create project' },
  { label: 'Generate', aria: 'Step 3: First generation' },
  { label: 'Done', aria: 'Step 4: Complete' },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Onboarding progress">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map(({ label, aria }, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;

          return (
            <li key={label} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  aria-label={aria}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isActive
                        ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                        : 'border-white/10 text-white/30'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </div>
                <span
                  className={`hidden text-xs sm:block ${
                    isActive ? 'text-violet-400' : isCompleted ? 'text-emerald-400' : 'text-white/30'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`h-px w-6 sm:w-10 ${i < currentStep ? 'bg-emerald-500' : 'bg-white/10'}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
