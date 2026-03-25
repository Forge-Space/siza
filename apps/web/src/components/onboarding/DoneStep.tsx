'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@siza/ui';
import { trackEvent } from '@/components/analytics/AnalyticsProvider';
import { useCreateProject } from '@/hooks/use-projects';

interface DoneStepProps {
  project: { id: string; name: string } | null;
  onComplete?: () => void;
  onCtaClick?: (cta: string) => void;
}

export function DoneStep({ project, onComplete, onCtaClick }: DoneStepProps) {
  const router = useRouter();
  const createProject = useCreateProject();
  const [completing, setCompleting] = useState(false);
  const generationDestination = project
    ? `/generate?projectId=${project.id}&source=onboarding&entry=done_primary&step=project`
    : '/projects/new?source=onboarding&entry=done_primary&step=project';
  const createProjectFallback = '/projects/new?source=onboarding&entry=done_primary&step=project';

  const trackActivationEvent = (
    action: string,
    entry: string,
    params: Record<string, string | boolean | null> = {}
  ) => {
    trackEvent({
      action,
      category: 'Activation',
      label: entry,
      params: {
        source: 'onboarding',
        entry,
        step: 'project',
        hasProjectBefore: !!project,
        ...params,
      },
    });
  };

  const resolveDestination = async () => {
    if (project) {
      return { destination: generationDestination, projectId: project.id as string | null };
    }
    trackActivationEvent('activation_starter_project_confirmed', 'done_primary', {
      fallback: false,
    });
    try {
      const createdProject = await createProject.mutateAsync({
        name: 'My First Project',
        framework: 'react',
      });
      trackActivationEvent('activation_starter_project_created', 'done_primary', {
        projectId: createdProject.id,
        fallback: false,
      });
      return {
        destination: `/generate?projectId=${createdProject.id}&source=onboarding&entry=done_primary&step=project`,
        projectId: createdProject.id,
      };
    } catch {
      trackActivationEvent('activation_starter_project_fallback', 'done_primary', {
        fallback: true,
      });
      return { destination: createProjectFallback, projectId: null };
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    const { destination, projectId } = await resolveDestination();
    onCtaClick?.(destination);
    if (projectId) {
      trackActivationEvent('activation_route_to_generate', 'done_primary', {
        projectId,
        fallback: false,
      });
    }
    onComplete?.();
    trackEvent({
      action: 'onboarding_cta_clicked',
      category: 'Onboarding',
      label: 'done',
      params: {
        step: 'done',
        cta: project ? 'continue_to_generate' : 'create_project_and_generate',
        destination,
      },
    });
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
      router.push(destination);
    } catch {
      router.push(destination);
    }
  };

  const links = project
    ? [
        { label: 'Open the generator', href: generationDestination },
        { label: 'View your project', href: `/projects/${project.id}` },
        { label: 'Browse templates', href: '/templates' },
      ]
    : [
        {
          label: 'Create your first project',
          href: '/dashboard?source=onboarding&entry=done_create_project&intent=create_project',
        },
        {
          label: 'Go to dashboard',
          href: '/dashboard?source=onboarding&entry=done_dashboard&intent=create_project',
        },
        {
          label: 'Start generating',
          href: '/dashboard?source=onboarding&entry=done_generate&intent=create_project',
        },
      ];

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold text-white">
          {project ? 'Workspace ready' : 'Setup complete'}
        </h1>
        <p className="text-sm text-white/60 max-w-sm mx-auto">
          {project
            ? `"${project.name}" is set up. Head to the generator to build your first component.`
            : 'Your account is active. Create a project to start generating components.'}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-white/30">Quick links</p>
        <div className="flex flex-col items-center gap-2">
          {links.map(({ label, href }) => (
            <button
              key={href}
              onClick={async () => {
                onCtaClick?.(href);
                trackEvent({
                  action: 'onboarding_cta_clicked',
                  category: 'Onboarding',
                  label: 'done',
                  params: { step: 'done', cta: href },
                });
                await fetch('/api/onboarding/complete', { method: 'POST' }).catch(() => null);
                router.push(href);
              }}
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors min-h-[44px]"
            >
              {label}
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleComplete} disabled={completing} size="lg">
        {completing
          ? 'Opening…'
          : project
            ? 'Open generator'
            : 'Create project and start'}
      </Button>
    </div>
  );
}
