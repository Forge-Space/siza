-- Add hierarchy support to software catalog
-- Extends catalog_entries with domain/system types and parent-child relationships

-- Expand type constraint to include domain and system
alter table catalog_entries drop constraint catalog_entries_type_check;
alter table catalog_entries add constraint catalog_entries_type_check
  check (type in ('domain', 'system', 'service', 'component', 'api', 'library', 'website'));

-- Add hierarchy and metadata columns
alter table catalog_entries add column if not exists parent_id uuid references catalog_entries(id) on delete set null;
alter table catalog_entries add column if not exists description text;
alter table catalog_entries add column if not exists metadata jsonb not null default '{}';

-- Index for parent lookups
create index if not exists idx_catalog_entries_parent on catalog_entries(parent_id);
