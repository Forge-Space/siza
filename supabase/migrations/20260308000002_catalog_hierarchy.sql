-- Catalog hierarchy: domains → systems → services/components/apis
-- Adds parent_id for entity hierarchy and metadata jsonb for extensibility

-- Add new entity types (system, domain)
alter table catalog_entries drop constraint catalog_entries_type_check;
alter table catalog_entries add constraint catalog_entries_type_check
  check (type in ('domain', 'system', 'service', 'component', 'api', 'library', 'website'));

-- Add parent_id for hierarchy (domain → system → component)
alter table catalog_entries
  add column if not exists parent_id uuid references catalog_entries(id) on delete set null;

-- Add description for richer metadata
alter table catalog_entries
  add column if not exists description text;

-- Add metadata jsonb for extensibility (links, annotations, spec)
alter table catalog_entries
  add column if not exists metadata jsonb not null default '{}';

-- Index for hierarchy queries
create index if not exists idx_catalog_entries_parent on catalog_entries(parent_id);

-- RLS: service role can manage all entries (for import/sync)
create policy "Service role can manage catalog entries"
  on catalog_entries for all
  using (auth.role() = 'service_role');
