export interface OfficialGoldenPathSeed {
  name: string;
  display_name: string;
  description: string;
  type: 'service' | 'library' | 'website' | 'worker' | 'api' | 'package';
  lifecycle: 'draft' | 'beta' | 'ga' | 'deprecated';
  framework: string;
  language: string;
  stack: 'nextjs' | 'api-service' | 'library' | 'worker' | 'monorepo';
  tags: string[];
  parameters: Array<{
    name: string;
    type: 'string' | 'boolean' | 'number' | 'select';
    required?: boolean;
    default?: unknown;
    description?: string;
    options?: string[];
  }>;
  steps: Array<{
    id: string;
    name: string;
    action: string;
    description?: string;
  }>;
  is_official: boolean;
  includes_ci: boolean;
  includes_testing: boolean;
  includes_linting: boolean;
  includes_monitoring: boolean;
  includes_docker: boolean;
  catalog_type: string;
  catalog_lifecycle: string;
  icon: string;
}

type GoldenPathDefaults = Pick<
  OfficialGoldenPathSeed,
  | 'is_official'
  | 'includes_ci'
  | 'includes_testing'
  | 'includes_linting'
  | 'includes_monitoring'
  | 'includes_docker'
  | 'catalog_lifecycle'
>;

type OfficialGoldenPathInput = Omit<OfficialGoldenPathSeed, keyof GoldenPathDefaults> &
  Partial<GoldenPathDefaults>;

const DEFAULT_GOLDEN_PATH_VALUES: GoldenPathDefaults = {
  is_official: true,
  includes_ci: true,
  includes_testing: true,
  includes_linting: true,
  includes_monitoring: true,
  includes_docker: false,
  catalog_lifecycle: 'production',
};

function registerCatalogStep(description: string): OfficialGoldenPathSeed['steps'][number] {
  return {
    id: 'register',
    name: 'Register in Catalog',
    action: 'register-catalog',
    description,
  };
}

function defineOfficialGoldenPath(input: OfficialGoldenPathInput): OfficialGoldenPathSeed {
  return { ...DEFAULT_GOLDEN_PATH_VALUES, ...input };
}

export const OFFICIAL_GOLDEN_PATHS: OfficialGoldenPathSeed[] = [
  defineOfficialGoldenPath({
    name: 'forge-next-service',
    display_name: 'Next.js Service',
    description: 'Production-ready Next.js service with Supabase auth, Tailwind, and CI/CD.',
    type: 'service',
    lifecycle: 'ga',
    framework: 'next.js',
    language: 'typescript',
    stack: 'nextjs',
    tags: ['next.js', 'supabase', 'tailwind', 'ci-cd'],
    parameters: [
      {
        name: 'projectName',
        type: 'string',
        required: true,
        description: 'Project name (kebab-case)',
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Short description',
      },
      {
        name: 'includeAuth',
        type: 'boolean',
        default: true,
        description: 'Include Supabase auth setup',
      },
      {
        name: 'cssFramework',
        type: 'select',
        default: 'tailwind',
        description: 'CSS framework',
        options: ['tailwind', 'vanilla-extract', 'css-modules', 'none'],
      },
      {
        name: 'port',
        type: 'number',
        default: 3000,
        description: 'Dev server port',
      },
    ],
    steps: [
      {
        id: 'scaffold',
        name: 'Scaffold project',
        action: 'create-files',
        description: 'Create Next.js project structure with App Router.',
      },
      {
        id: 'configure',
        name: 'Configure CI/CD',
        action: 'create-files',
        description: 'Add GitHub Actions workflows.',
      },
      registerCatalogStep('Create catalog entry for the new service.'),
    ],
    catalog_type: 'service',
    icon: 'globe',
  }),
  defineOfficialGoldenPath({
    name: 'forge-mcp-server',
    display_name: 'MCP Server',
    description: 'MCP server template with tool definitions, testing, and npm publishing.',
    type: 'service',
    lifecycle: 'ga',
    framework: 'node.js',
    language: 'typescript',
    stack: 'api-service',
    tags: ['mcp', 'sdk', 'npm'],
    parameters: [
      {
        name: 'serverName',
        type: 'string',
        required: true,
        description: 'Server name (kebab-case)',
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Server description',
      },
      {
        name: 'tools',
        type: 'string',
        required: false,
        description: 'Comma-separated initial tool names',
      },
    ],
    steps: [
      {
        id: 'scaffold',
        name: 'Scaffold MCP server',
        action: 'create-files',
        description: 'Create MCP server with SDK setup.',
      },
      {
        id: 'tools',
        name: 'Create tool stubs',
        action: 'create-files',
        description: 'Generate initial tool definitions.',
      },
      {
        id: 'test',
        name: 'Setup testing',
        action: 'create-files',
        description: 'Configure testing.',
      },
      registerCatalogStep('Create catalog entry.'),
    ],
    catalog_type: 'service',
    icon: 'server',
  }),
  defineOfficialGoldenPath({
    name: 'forge-react-library',
    display_name: 'React Component Library',
    description: 'Shared React component library with Storybook, tests, and npm publishing.',
    type: 'library',
    lifecycle: 'ga',
    framework: 'react',
    language: 'typescript',
    stack: 'library',
    tags: ['react', 'storybook', 'npm', 'components'],
    parameters: [
      {
        name: 'packageName',
        type: 'string',
        required: true,
        description: 'Package name (@scope/name)',
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Library description',
      },
    ],
    steps: [
      {
        id: 'scaffold',
        name: 'Scaffold library',
        action: 'create-files',
        description: 'Create component library structure.',
      },
      {
        id: 'storybook',
        name: 'Setup Storybook',
        action: 'create-files',
        description: 'Configure Storybook.',
      },
      registerCatalogStep('Create catalog entry.'),
    ],
    catalog_type: 'library',
    icon: 'book-open',
  }),
  defineOfficialGoldenPath({
    name: 'forge-python-api',
    display_name: 'Python API Service',
    description: 'FastAPI service with Docker, pytest, and CI/CD.',
    type: 'api',
    lifecycle: 'beta',
    framework: 'fastapi',
    language: 'python',
    stack: 'api-service',
    tags: ['python', 'fastapi', 'docker', 'api'],
    parameters: [
      {
        name: 'serviceName',
        type: 'string',
        required: true,
        description: 'Service name (kebab-case)',
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'API description',
      },
      {
        name: 'includeDocker',
        type: 'boolean',
        default: true,
        description: 'Include Dockerfile and docker-compose',
      },
      {
        name: 'pythonVersion',
        type: 'select',
        default: '3.12',
        description: 'Python version',
        options: ['3.11', '3.12', '3.13'],
      },
      {
        name: 'port',
        type: 'number',
        default: 8000,
        description: 'API server port',
      },
    ],
    steps: [
      {
        id: 'scaffold',
        name: 'Scaffold API',
        action: 'create-files',
        description: 'Create FastAPI project with routers.',
      },
      {
        id: 'docker',
        name: 'Setup Docker',
        action: 'create-files',
        description: 'Add Dockerfile and compose config.',
      },
      registerCatalogStep('Create catalog entry.'),
    ],
    includes_monitoring: false,
    includes_docker: true,
    catalog_type: 'api',
    icon: 'server',
  }),
  defineOfficialGoldenPath({
    name: 'forge-cloudflare-worker',
    display_name: 'Cloudflare Worker',
    description: 'Edge worker with KV storage, rate limiting, and wrangler deploy.',
    type: 'worker',
    lifecycle: 'beta',
    framework: 'cloudflare',
    language: 'typescript',
    stack: 'worker',
    tags: ['cloudflare', 'workers', 'edge', 'serverless'],
    parameters: [
      {
        name: 'workerName',
        type: 'string',
        required: true,
        description: 'Worker name (kebab-case)',
      },
      {
        name: 'includeKV',
        type: 'boolean',
        default: false,
        description: 'Include KV namespace binding',
      },
    ],
    steps: [
      {
        id: 'scaffold',
        name: 'Scaffold worker',
        action: 'create-files',
        description: 'Create Cloudflare Worker project.',
      },
      {
        id: 'deploy',
        name: 'Configure deployment',
        action: 'create-files',
        description: 'Setup wrangler.toml and deploy scripts.',
      },
      registerCatalogStep('Create catalog entry.'),
    ],
    includes_monitoring: false,
    catalog_type: 'worker',
    icon: 'code',
  }),
];
