# siza

The open full-stack AI workspace — generate, integrate, ship. Turborepo monorepo.

## Quick Reference
```bash
npm run dev             # Start dev server (turbo)
npm run build           # Build all apps (turbo)
npm run lint            # Lint all (turbo)
npm run format          # Prettier all
npm run type-check      # TypeScript checking
npm run test            # Unit tests (turbo -> Jest)
npm run test:e2e        # E2E tests (turbo -> Playwright)
```

## Monorepo Structure
```
apps/
  web/                  # Next.js frontend (@siza/web)
    src/app/            # Next.js App Router pages
    src/components/     # UI components
    src/hooks/          # Custom React hooks
    src/lib/            # Utilities
    src/stores/         # State management
    e2e/                # Playwright E2E tests
  desktop/              # Electron desktop app (@siza/desktop)
  api/                  # API service (@siza/api)
  docs/                 # Fumadocs documentation site (@siza/docs)
packages/
  ui/                   # @siza/ui shared component library
  eslint-config/        # Shared ESLint config
supabase/
  migrations/           # Database migrations
  seed.sql              # Seed data
```

## Tech Stack
- **Framework**: Next.js (App Router) with Turborepo
- **UI**: Radix UI + Tailwind CSS + shadcn/ui
- **State**: TanStack React Query + Zustand stores
- **Auth/DB**: Supabase (SSR + client)
- **AI**: Anthropic SDK, Google Generative AI, MCP SDK
- **Testing**: Jest (unit) + Playwright (E2E)
- **Deploy**: Vercel

## Gotchas
- Pre-commit runs full monorepo type-check — `apps/docs` has pre-existing Fumadocs TS errors
- Use `HUSKY=0` for non-code commits (docs, config)
- `supabase link`/`db push` require `supabase login` first
- Middleware: Next.js 16 has proxy.ts, but OpenNext doesn't support it — use middleware.ts with `runtime = 'experimental-edge'`
- `@vercel/og` stub (PR #298): Stub WASM + JS wrapper BEFORE build
- Release automation: `release-automation.yml` auto-creates tag + GitHub release on version bump PR merge

## Current State (v0.41.0)
- RBAC + Teams UI + Entity Permissions + Anthropic Skills + Onboarding Tour + Gallery
- IDP Phase 3 complete — Plugin System, Entity Relationships, TechDocs TOC, Search Federation
- Post-gen scorecard: Inline A-F quality grading, 5 gates
- Software Catalog, Golden Path Templates, Developer Portal
- 1080 tests passing, 15 E2E spec files
