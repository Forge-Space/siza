'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  WandSparklesIcon,
  SaveIcon,
  EyeIcon,
  CodeIcon,
  TagIcon,
  PlusIcon,
  XIcon,
  InfoIcon,
  CopyIcon,
  CheckIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type InvocationMode = 'user' | 'auto' | 'background';

interface SkillFormState {
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  license: string;
  tags: string[];
  allowedTools: string[];
  argumentHint: string;
  invocationMode: InvocationMode;
  instructions: string;
  category: string;
}

const INITIAL_STATE: SkillFormState = {
  name: '',
  slug: '',
  description: '',
  version: '1.0.0',
  author: '',
  license: 'MIT',
  tags: [],
  allowedTools: [],
  argumentHint: '',
  invocationMode: 'user',
  instructions: '',
  category: 'custom',
};

const CATEGORIES = [
  { value: 'component', label: 'Component' },
  { value: 'form', label: 'Form' },
  { value: 'layout', label: 'Layout' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'design', label: 'Design' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'custom', label: 'Custom' },
];

const POPULAR_TAGS = [
  'ui', 'components', 'forms', 'accessibility', 'responsive',
  'typescript', 'react', 'vue', 'angular', 'svelte',
  'dashboard', 'charts', 'data-table', 'validation',
  'design', 'a11y', 'wcag', 'aria',
];

function TagInput({
  tags,
  onChange,
  label,
  suggestions,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  label: string;
  suggestions?: string[];
}) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const availableSuggestions = suggestions?.filter(
    (s) => !tags.includes(s) && s.includes(input.toLowerCase())
  );

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px] bg-surface-1 border border-surface-3 rounded-lg focus-within:ring-1 focus-within:ring-brand focus-within:border-brand">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-brand/10 text-brand-light"
          >
            <TagIcon className="h-2.5 w-2.5" />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-400 transition-colors"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length ? '' : 'Type and press Enter...'}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>
      {availableSuggestions && availableSuggestions.length > 0 && input && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {availableSuggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="px-2 py-0.5 text-[10px] rounded-full border border-surface-3 text-text-secondary hover:border-brand hover:text-brand-light transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillMdPreview({ form }: { form: SkillFormState }) {
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => {
    const lines = ['---'];
    lines.push(`name: ${form.name || 'my-skill'}`);
    lines.push(`description: ${form.description || 'A custom skill'}`);
    if (form.version) lines.push(`version: ${form.version}`);
    if (form.author) lines.push(`author: ${form.author}`);
    if (form.license) lines.push(`license: ${form.license}`);
    if (form.tags.length)
      lines.push(`tags: [${form.tags.join(', ')}]`);
    if (form.allowedTools.length)
      lines.push(`allowed-tools: [${form.allowedTools.join(', ')}]`);
    if (form.argumentHint)
      lines.push(`argument-hint: ${form.argumentHint}`);
    if (form.invocationMode !== 'user')
      lines.push(`invocation-mode: ${form.invocationMode}`);
    lines.push('---', '');
    lines.push(form.instructions || '# Instructions\n\nDescribe what this skill does...');
    return lines.join('\n');
  }, [form]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
          <CodeIcon className="h-3.5 w-3.5" />
          SKILL.md Preview
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="h-3 w-3 text-green-400" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 bg-surface-1 border border-surface-3 rounded-lg text-xs text-text-secondary font-mono overflow-x-auto whitespace-pre-wrap max-h-[500px] overflow-y-auto">
        {markdown}
      </pre>
    </div>
  );
}

export function SkillCreatorClient() {
  const router = useRouter();
  const [form, setForm] = useState<SkillFormState>(INITIAL_STATE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const updateField = <K extends keyof SkillFormState>(
    key: K,
    value: SkillFormState[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name') {
        next.slug = (value as string)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      return next;
    });
  };

  const isValid =
    form.name.length >= 1 &&
    form.name.length <= 64 &&
    form.description.length >= 1 &&
    form.description.length <= 1024 &&
    form.slug.length >= 2 &&
    form.instructions.length >= 10;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError('');

    const lines = ['---'];
    lines.push(`name: ${form.name}`);
    lines.push(`description: ${form.description}`);
    if (form.version) lines.push(`version: ${form.version}`);
    if (form.author) lines.push(`author: ${form.author}`);
    if (form.license) lines.push(`license: ${form.license}`);
    if (form.tags.length) lines.push(`tags: [${form.tags.join(', ')}]`);
    if (form.allowedTools.length)
      lines.push(`allowed-tools: [${form.allowedTools.join(', ')}]`);
    if (form.argumentHint)
      lines.push(`argument-hint: ${form.argumentHint}`);
    if (form.invocationMode !== 'user')
      lines.push(`invocation-mode: ${form.invocationMode}`);
    lines.push('---', '', form.instructions);
    const content = lines.join('\n');

    try {
      const res = await fetch('/api/skills/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, slug: form.slug }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save skill');
        return;
      }

      router.push('/skills');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
            <WandSparklesIcon className="h-6 w-6 text-brand" />
            Create Skill
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Build a reusable AI generation skill using the Anthropic Agent
            Skills standard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push('/skills')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !isValid}
            className="gap-2"
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Skill'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-1.5 border-b border-surface-3">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'edit'
              ? 'border-brand text-brand-light'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <WandSparklesIcon className="h-4 w-4" />
            Editor
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-brand text-brand-light'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <EyeIcon className="h-4 w-4" />
            Preview
          </span>
        </button>
      </div>

      {activeTab === 'edit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="p-4 rounded-xl border border-surface-3 bg-surface-0 space-y-4">
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <InfoIcon className="h-4 w-4 text-brand" />
                Identity
              </h2>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. My Custom Skill"
                  maxLength={64}
                  className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg focus:ring-brand focus:border-brand"
                />
                {form.slug && (
                  <p className="mt-1 text-xs text-text-muted">
                    Slug: <code className="text-brand">{form.slug}</code>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField('description', e.target.value)
                  }
                  placeholder="What does this skill do?"
                  maxLength={1024}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg focus:ring-brand focus:border-brand"
                />
                <p className="mt-1 text-xs text-text-muted text-right">
                  {form.description.length}/1024
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      updateField('category', e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Invocation Mode
                  </label>
                  <select
                    value={form.invocationMode}
                    onChange={(e) =>
                      updateField(
                        'invocationMode',
                        e.target.value as InvocationMode
                      )
                    }
                    className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg"
                  >
                    <option value="user">User (manual)</option>
                    <option value="auto">Auto (always active)</option>
                    <option value="background">Background</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-surface-3 bg-surface-0 space-y-4">
              <h2 className="text-sm font-semibold text-text-primary">
                Metadata
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Version
                  </label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={(e) =>
                      updateField('version', e.target.value)
                    }
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg focus:ring-brand focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Author
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) =>
                      updateField('author', e.target.value)
                    }
                    placeholder="Your name"
                    className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg focus:ring-brand focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    License
                  </label>
                  <input
                    type="text"
                    value={form.license}
                    onChange={(e) =>
                      updateField('license', e.target.value)
                    }
                    placeholder="MIT"
                    className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg focus:ring-brand focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Argument Hint
                </label>
                <input
                  type="text"
                  value={form.argumentHint}
                  onChange={(e) =>
                    updateField('argumentHint', e.target.value)
                  }
                  placeholder="e.g. <component-name> [--variant]"
                  className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg focus:ring-brand focus:border-brand font-mono text-xs"
                />
                <p className="mt-1 text-xs text-text-muted">
                  Shows usage hint: /{form.slug || 'skill-name'}{' '}
                  {form.argumentHint || '<args>'}
                </p>
              </div>
            </div>

            <TagInput
              tags={form.tags}
              onChange={(tags) => updateField('tags', tags)}
              label="Tags"
              suggestions={POPULAR_TAGS}
            />

            <TagInput
              tags={form.allowedTools}
              onChange={(tools) => updateField('allowedTools', tools)}
              label="Allowed Tools"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Instructions <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-text-muted mb-2">
                Markdown instructions that guide the AI. Use{' '}
                <code className="text-brand">$ARGUMENTS</code> for all
                args or <code className="text-brand">$0</code>,{' '}
                <code className="text-brand">$1</code> for positional.
              </p>
              <textarea
                value={form.instructions}
                onChange={(e) =>
                  updateField('instructions', e.target.value)
                }
                placeholder="# My Skill\n\nGenerate a $ARGUMENTS component with...\n\n## Guidelines\n\n1. Use semantic HTML\n2. Add ARIA labels\n3. Make it responsive"
                rows={20}
                className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-lg focus:ring-brand focus:border-brand font-mono"
              />
              <p className="mt-1 text-xs text-text-muted text-right">
                {form.instructions.length} characters
              </p>
            </div>

            <SkillMdPreview form={form} />
          </div>
        </div>
      ) : (
        <SkillMdPreview form={form} />
      )}
    </div>
  );
}
