'use client';

import { Star, Eye, Code, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  componentLibrary: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  preview: string;
  usage: number;
  rating: number;
  createdAt: string;
  code?: string;
  isOfficial: boolean;
}

interface TemplateCardProps {
  template: Template;
  onUseTemplate: (template: Template) => void;
  onPreview: (template: Template) => void;
}

const frameworkColors: Record<string, string> = {
  react: 'bg-sky-500/15 text-sky-400',
  vue: 'bg-emerald-500/15 text-emerald-400',
  angular: 'bg-red-500/15 text-red-400',
  svelte: 'bg-orange-500/15 text-orange-400',
};

const difficultyDots: Record<string, string> = {
  beginner: 'bg-emerald-400',
  intermediate: 'bg-amber-400',
  advanced: 'bg-red-400',
};

const categoryIcons: Record<string, string> = {
  Landing: 'from-violet-500/20 to-blue-500/20',
  Dashboard: 'from-emerald-500/20 to-teal-500/20',
  Auth: 'from-amber-500/20 to-orange-500/20',
  Ecommerce: 'from-pink-500/20 to-rose-500/20',
  Blog: 'from-sky-500/20 to-cyan-500/20',
  Portfolio: 'from-violet-500/20 to-purple-500/20',
  Admin: 'from-slate-500/20 to-zinc-500/20',
  Other: 'from-gray-500/20 to-neutral-500/20',
};

export function TemplateCard({ template, onUseTemplate, onPreview }: TemplateCardProps) {
  const templateWithCode = {
    ...template,
    code:
      template.code ||
      `// ${template.name}
export default function ${template.name.replace(/\s+/g, '')}() {
  return <div>${template.name}</div>;
}`,
  };

  const gradient = categoryIcons[template.category] || categoryIcons.Other;

  return (
    <div className="group relative rounded-xl border border-surface-3 bg-surface-1 overflow-hidden transition-all duration-200 hover:border-violet-500/30 hover:shadow-[0_0_24px_rgba(124,58,237,0.08)] flex flex-col">
      {/* Preview area */}
      <div
        className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="text-2xl font-display font-bold text-text-primary/30">
            {template.name.charAt(0)}
          </div>
          <p className="text-[10px] text-text-muted font-mono mt-1">{template.category}</p>
        </div>
        {template.isOfficial && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5">
            <Sparkles className="w-3 h-3 text-violet-300" />
            <span className="text-[10px] font-medium text-violet-300">Official</span>
          </div>
        )}
        <div className="absolute inset-0 bg-surface-1/0 group-hover:bg-surface-1/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPreview(templateWithCode)}
            className="bg-surface-1/90 backdrop-blur-sm text-text-primary hover:bg-surface-1"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Preview
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-violet-300 transition-colors line-clamp-1">
          {template.name}
        </h3>
        <p className="mt-1 text-xs text-text-secondary line-clamp-2 min-h-[2rem]">
          {template.description}
        </p>

        {/* Tags row */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${frameworkColors[template.framework] || 'bg-surface-2 text-text-muted'}`}
          >
            {template.framework}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[10px] text-text-muted">
            <span
              className={`w-1.5 h-1.5 rounded-full ${difficultyDots[template.difficulty] || 'bg-gray-400'}`}
            />
            {template.difficulty}
          </span>
          {template.rating > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400 ml-auto">
              <Star className="w-3 h-3 fill-current" />
              {template.rating}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <Button
          size="sm"
          onClick={() => onUseTemplate(templateWithCode)}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs h-8"
        >
          <Code className="w-3.5 h-3.5 mr-1.5" />
          Use Template
        </Button>
      </div>
    </div>
  );
}
