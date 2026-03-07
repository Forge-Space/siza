import { NextResponse } from 'next/server';
import { getCatalogStats } from '@/lib/services/catalog.service';
import { withRateLimit } from '@/lib/api/rate-limit';

export async function GET() {
  const limited = await withRateLimit('catalog-stats', 120, 60);
  if (limited) return limited;

  const stats = await getCatalogStats();
  return NextResponse.json(stats);
}
