import { NextRequest, NextResponse } from 'next/server';
import { importCatalogYaml } from '@/lib/services/catalog-import.service';
import { importCatalogYamlSchema } from '@/lib/api/validation/catalog';
import { getAuthenticatedUser } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = importCatalogYamlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await importCatalogYaml(parsed.data.yaml, user.id, parsed.data.source);
  return NextResponse.json(result);
}
