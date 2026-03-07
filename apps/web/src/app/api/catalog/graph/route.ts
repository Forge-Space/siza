import { NextResponse } from 'next/server';
import { getCatalogGraph } from '@/lib/services/catalog.service';
import { withRateLimit } from '@/lib/api/rate-limit';

export async function GET() {
  const limited = await withRateLimit('catalog-graph', 60, 60);
  if (limited) return limited;

  const graph = await getCatalogGraph();
  return NextResponse.json(graph);
}
