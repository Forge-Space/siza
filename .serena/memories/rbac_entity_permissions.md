# RBAC & Entity Permissions System

## Overview
Team-based RBAC with entity-level permissions. Feature-flagged via `ENABLE_RBAC`.

## Database (migration: 20260309000003_team_rbac.sql)
- `teams` — id, name, slug (unique), owner_id, description
- `team_members` — team_id, user_id, role (enum: viewer/editor/admin/owner), invited_by
- `entity_permissions` — entity_type, entity_id, team_id/user_id, permission (enum: view/edit/admin/delete), granted_by
- RLS enabled on all 3 tables

## Repository Layer (apps/web/src/lib/repositories/rbac.repo.ts)
- Team CRUD: `getTeamsForUser`, `getTeamBySlug`, `createTeam`, `addTeamMember`, `updateMemberRole`, `removeTeamMember`, `getUserRoleInTeam`
- Entity permissions: `getEntityPermissions`, `grantEntityPermission`, `revokeEntityPermission`, `checkEntityPermission`
- Permission hierarchy: view < edit < admin < delete (checking "edit" also accepts admin/delete)

## API Routes
- `/api/teams` — GET (list user teams), POST (create team)
- `/api/teams/[slug]` — GET (detail + role), POST (add member), PATCH (update role), DELETE (remove member)
- `/api/permissions` — GET (list entity perms), POST (grant), DELETE (revoke) — admin-only via checkEntityPermission

## UI Components
- Teams list page: `apps/web/src/app/(dashboard)/teams/teams-client.tsx`
- Team detail page: `apps/web/src/app/(dashboard)/teams/[slug]/team-detail-client.tsx`
- Entity permissions panel: `apps/web/src/components/permissions/entity-permissions-panel.tsx` (reusable)

## Hooks
- `use-teams.ts` — useTeams, useTeam, useCreateTeam, useAddTeamMember, useUpdateMemberRole, useRemoveTeamMember
- `use-entity-permissions.ts` — useEntityPermissions, useGrantPermission, useRevokePermission

## Tests (33 total)
- `/api/teams` route: 5 tests (PR #389 MERGED)
- `/api/teams/[slug]` route: 15 tests (PR #389 MERGED)
- `/api/permissions` route: 13 tests (PR #391 pending)

## PRs
- #386 MERGED — RBAC foundation (DB, repo, API, hooks, feature flag)
- #387 MERGED — Teams UI pages
- #389 MERGED — RBAC API route tests (20 tests)
- #391 OPEN — Entity permissions API + UI (13 tests)

## Feature Flag
- `ENABLE_RBAC` (flag #35, category: 'auth', default: false)
- Navigation: Teams nav item shown only when flag enabled

## Gotchas
- Entity types: 'catalog_entry' | 'project' | 'template' | 'golden_path'
- Team role hierarchy for sorting: ['owner', 'admin', 'editor', 'viewer']
- Cannot assign 'owner' role via API (400) — only through team creation
- Cannot remove team owner (400)
- `checkEntityPermission` does 2-phase lookup: direct user perms → team-based perms via membership join
