import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_GOLDEN_PATHS } from '../src/lib/governance/official-golden-paths.ts';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL_LOCAL;
  if (!supabaseUrl) {
    throw new Error(
      'Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL for golden paths synchronization.'
    );
  }

  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const payload = OFFICIAL_GOLDEN_PATHS.map((item) => ({
    name: item.name,
    display_name: item.display_name,
    description: item.description,
    type: item.type,
    lifecycle: item.lifecycle,
    framework: item.framework,
    language: item.language,
    stack: item.stack,
    tags: item.tags,
    parameters: item.parameters,
    steps: item.steps,
    is_official: item.is_official,
    includes_ci: item.includes_ci,
    includes_testing: item.includes_testing,
    includes_linting: item.includes_linting,
    includes_monitoring: item.includes_monitoring,
    includes_docker: item.includes_docker,
    catalog_type: item.catalog_type,
    catalog_lifecycle: item.catalog_lifecycle,
    icon: item.icon,
    metadata: {},
  }));

  const { data, error } = await supabase
    .from('golden_path_templates')
    .upsert(payload, { onConflict: 'name' })
    .select('id, name, updated_at');

  if (error) {
    throw new Error(`Golden paths sync failed: ${error.message}`);
  }

  console.log(`Synced ${data?.length ?? 0} official golden paths.`);
  for (const row of data ?? []) {
    console.log(`- ${row.name} (${row.id})`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
