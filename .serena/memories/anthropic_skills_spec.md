# Anthropic Agent Skills Spec Implementation

## Status: PR #388 OPEN (feat/anthropic-skills-spec, 7 commits)

## What Was Built
- **SKILL.md Parser** (`apps/web/src/lib/skills/parser.ts`): Lightweight zero-dep parser with Zod validation. Parses YAML frontmatter + markdown body. No gray-matter dependency (saves ~97 KiB bundle).
- **Argument Substitution**: `$ARGUMENTS` (all args joined) + `$0`-`$9` positional placeholders via `substituteArguments()`
- **Database Migration** (`supabase/migrations/20260310000001_skills_anthropic_spec.sql`): 8 new columns on `skills` table: version, author, license, tags[], allowed_tools[], argument_hint, invocation_mode, raw_frontmatter. GIN index on tags. RLS policies for user CRUD. Seeds official skills with metadata.
- **Import/Export API**: POST `/api/skills/import` (SKILL.md content → DB), GET `/api/skills/export/[slug]` (DB → .skill.md download)
- **Skills List API**: GET `/api/skills` with category, tag, search, sourceType filters
- **Marketplace Page** (`/skills`): 3-column grid, category pills, search, export buttons, import form, "Create Skill" button
- **Skill Creator** (`/skills/create`): Full-form editor with live SKILL.md preview. Identity (name/slug/description/category/invocation-mode), metadata (version/author/license/argument-hint), tag inputs with autocomplete, instructions editor with $ARGUMENTS guidance.
- **Feature Flag**: `ENABLE_SKILL_MARKETPLACE` (set to true)
- **Navigation**: Skills nav item in sidebar between Plugins and Templates

## Key Files
- `apps/web/src/lib/skills/parser.ts` — parseSkillMd, substituteArguments, generateSkillMd
- `apps/web/src/lib/repositories/skill.types.ts` — SkillRow extended with 8 new fields
- `apps/web/src/lib/repositories/skill.repo.ts` — getSkillBySlug, upsertSkill, tag filter
- `apps/web/src/lib/services/skill.service.ts` — buildSkillContext now supports args
- `apps/web/src/app/(dashboard)/skills/` — marketplace page + create page
- `apps/web/src/app/api/skills/` — route.ts, import/route.ts, export/[slug]/route.ts

## Tests
- 10 parser unit tests (parse, substitute, generate, roundtrip)
- 1021 total tests passing (flags test updated to 36)

## Gotchas
- Hooks switch branches during Edit/Write — always verify branch before commit
- `z.record(z.unknown())` needs `z.record(z.string(), z.unknown())` in Zod 4
- The marketplace "Create Skill" button was lost during linter formatting — had to re-add manually

## Future Phases (not yet built)
- Phase 3: `/skill-name args` chat-style invocation in generation prompt
- Phase 4: Plugin distribution (.claude-plugin format)
