-- Add select-type parameters to seed golden paths to demonstrate all input types
-- Updates existing seeds with richer parameter definitions

update public.golden_path_templates
  set parameters = '[
    {"name":"projectName","type":"string","required":true,"description":"Project name (kebab-case)"},
    {"name":"description","type":"string","required":false,"description":"Short description"},
    {"name":"includeAuth","type":"boolean","default":true,"description":"Include Supabase auth setup"},
    {"name":"cssFramework","type":"select","default":"tailwind","description":"CSS framework","options":["tailwind","vanilla-extract","css-modules","none"]},
    {"name":"port","type":"number","default":3000,"description":"Dev server port"}
  ]'::jsonb
  where name = 'forge-next-service';

update public.golden_path_templates
  set parameters = '[
    {"name":"serviceName","type":"string","required":true,"description":"Service name (kebab-case)"},
    {"name":"description","type":"string","required":false,"description":"API description"},
    {"name":"includeDocker","type":"boolean","default":true,"description":"Include Dockerfile and docker-compose"},
    {"name":"pythonVersion","type":"select","default":"3.12","description":"Python version","options":["3.11","3.12","3.13"]},
    {"name":"port","type":"number","default":8000,"description":"API server port"}
  ]'::jsonb
  where name = 'forge-python-api';
