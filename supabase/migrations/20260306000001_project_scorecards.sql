create table if not exists project_scorecards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  overall_score integer not null check (overall_score between 0 and 100),
  security_score integer not null check (security_score between 0 and 100),
  quality_score integer not null check (quality_score between 0 and 100),
  performance_score integer not null check (performance_score between 0 and 100),
  compliance_score integer not null check (compliance_score between 0 and 100),
  breakdowns jsonb not null default '{}',
  violations jsonb not null default '[]',
  recommendations jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index idx_scorecards_project_time
  on project_scorecards (project_id, created_at desc);

create index idx_scorecards_overall
  on project_scorecards (overall_score);

alter table project_scorecards enable row level security;

create policy "Users can view own project scorecards"
  on project_scorecards for select
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

create policy "Service role can insert scorecards"
  on project_scorecards for insert
  with check (true);
