-- Plugin System for IDP Governance
-- Provides extensible plugin infrastructure for quality, security, and architecture checks

CREATE TYPE plugin_category AS ENUM (
  'governance',
  'quality',
  'security',
  'architecture',
  'integration',
  'monitoring',
  'documentation'
);

CREATE TYPE plugin_status AS ENUM (
  'official',
  'community',
  'experimental',
  'deprecated'
);

CREATE TABLE IF NOT EXISTS plugins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  version text NOT NULL DEFAULT '1.0.0',
  author text NOT NULL DEFAULT 'Forge Space',
  icon text,
  category plugin_category NOT NULL DEFAULT 'governance',
  status plugin_status NOT NULL DEFAULT 'official',
  enabled boolean NOT NULL DEFAULT true,
  config_schema jsonb DEFAULT '{}',
  default_config jsonb DEFAULT '{}',
  permissions text[] DEFAULT '{}',
  widget_slots text[] DEFAULT '{}',
  routes jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plugin_installations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id uuid NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  config jsonb DEFAULT '{}',
  installed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(plugin_id, user_id)
);

ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plugins readable by all authenticated"
  ON plugins FOR SELECT TO authenticated USING (true);

CREATE POLICY "Plugin installations owned by user"
  ON plugin_installations FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_plugins_category ON plugins(category);
CREATE INDEX idx_plugins_status ON plugins(status);
CREATE INDEX idx_plugin_installations_user ON plugin_installations(user_id);
CREATE INDEX idx_plugin_installations_plugin ON plugin_installations(plugin_id);

-- Seed governance-first plugins
INSERT INTO plugins (slug, name, description, category, status, icon, widget_slots, config_schema, default_config) VALUES
(
  'tech-debt-scanner',
  'Tech Debt Scanner',
  'Scans generated code for technical debt patterns: TODO/FIXME density, cyclomatic complexity, dependency staleness, test coverage gaps. The technical conscience that AI-generated code lacks.',
  'quality',
  'official',
  'AlertTriangle',
  '{"catalog-overview","entity-sidebar","generation-preview"}',
  '{"thresholds": {"type": "object", "properties": {"maxTodoCount": {"type": "number"}, "maxComplexity": {"type": "number"}, "minTestCoverage": {"type": "number"}}}}',
  '{"thresholds": {"maxTodoCount": 5, "maxComplexity": 10, "minTestCoverage": 80}}'
),
(
  'architecture-guard',
  'Architecture Guard',
  'Enforces architectural boundaries: layer violations (UI importing DB), circular dependencies, import depth limits, barrel file enforcement. Prevents the spaghetti that vibe-coding produces.',
  'architecture',
  'official',
  'Shield',
  '{"catalog-overview","entity-sidebar"}',
  '{"rules": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "pattern": {"type": "string"}, "severity": {"type": "string"}}}}}',
  '{"rules": [{"name": "no-ui-db-import", "pattern": "components/**->repositories/**", "severity": "error"}, {"name": "no-circular-deps", "pattern": "circular", "severity": "error"}]}'
),
(
  'security-posture',
  'Security Posture',
  'Continuous security assessment: OWASP Top 10 pattern detection, secret scanning, dependency vulnerability tracking, CSP compliance. The security layer AI tools forget.',
  'security',
  'official',
  'Lock',
  '{"catalog-overview","entity-sidebar","dashboard-widgets"}',
  '{"scanDepth": {"type": "string", "enum": ["shallow", "deep"]}, "autoFix": {"type": "boolean"}}',
  '{"scanDepth": "deep", "autoFix": false}'
),
(
  'scalability-analyzer',
  'Scalability Analyzer',
  'Detects scalability anti-patterns: N+1 queries, unbounded lists, missing pagination, memory leaks, blocking I/O in hot paths. Catches what AI generates but never tests at scale.',
  'architecture',
  'official',
  'TrendingUp',
  '{"catalog-overview","generation-preview"}',
  '{"checkDatabase": {"type": "boolean"}, "checkMemory": {"type": "boolean"}, "checkIO": {"type": "boolean"}}',
  '{"checkDatabase": true, "checkMemory": true, "checkIO": true}'
),
(
  'planning-enforcer',
  'Planning Enforcer',
  'Enforces engineering planning discipline: ADR (Architecture Decision Records) presence, CHANGELOG maintenance, PR description quality, commit message conventions. The process AI skips.',
  'governance',
  'official',
  'ClipboardCheck',
  '{"catalog-overview","entity-sidebar"}',
  '{"requireADR": {"type": "boolean"}, "requireChangelog": {"type": "boolean"}, "conventionalCommits": {"type": "boolean"}}',
  '{"requireADR": true, "requireChangelog": true, "conventionalCommits": true}'
),
(
  'dependency-health',
  'Dependency Health',
  'Monitors dependency hygiene: outdated packages, known vulnerabilities, license compliance, bundle size impact. Prevents the bloated node_modules that AI tools create without thinking.',
  'quality',
  'official',
  'Package',
  '{"catalog-overview","dashboard-widgets"}',
  '{"maxAge": {"type": "number", "description": "Max days since last update"}, "blockLicenses": {"type": "array"}}',
  '{"maxAge": 180, "blockLicenses": ["GPL-3.0", "AGPL-3.0"]}'
);
