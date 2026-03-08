import { NextRequest, NextResponse } from 'next/server';
import { listSkills } from '@/lib/services/skill.service';
import type { SkillCategory, SkillSourceType } from '@/lib/repositories/skill.types';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = params.get('category') as SkillCategory | null;
  const sourceType = params.get('sourceType') as SkillSourceType | null;
  const framework = params.get('framework');
  const search = params.get('search');
  const tag = params.get('tag');

  const skills = await listSkills({
    ...(category && { category }),
    ...(sourceType && { sourceType }),
    ...(framework && { framework }),
    ...(search && { search }),
    ...(tag && { tag }),
  });

  return NextResponse.json({ data: skills });
}
