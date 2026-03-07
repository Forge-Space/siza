import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { UnauthorizedError } from '@/lib/api/errors';
import { captureServerError } from '@/lib/sentry/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { user } = await verifySession();

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('billing_period_start', periodStart)
      .single();

    const VALID_PLANS = ['free', 'pro', 'team', 'enterprise'] as const;

    const [
      { data: sub },
      { count: generationsTotal },
      { count: projectsCount },
      { data: allLimits },
    ] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('plan, status, current_period_end, cancel_at_period_end')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('plan_limits').select('plan, generations_per_month, max_projects'),
    ]);

    const rawPlan = sub?.plan ?? 'free';
    const plan = VALID_PLANS.includes(rawPlan as (typeof VALID_PLANS)[number]) ? rawPlan : 'free';
    const limits = allLimits?.find((l) => l.plan === plan);
    const genLimit = limits?.generations_per_month ?? 10;
    const projLimit = limits?.max_projects ?? 2;

    const usageData = usage ?? {
      generations_count: 0,
      tokens_used: 0,
      projects_count: 0,
      generations_limit: genLimit,
      projects_limit: projLimit,
    };

    return NextResponse.json({
      usage: {
        ...usageData,
        projects_count: projectsCount ?? 0,
        generations_limit: genLimit,
        projects_limit: projLimit,
      },
      generations_total: generationsTotal ?? 0,
      subscription: sub ?? {
        plan: 'free',
        status: 'active',
        current_period_end: null,
        cancel_at_period_end: false,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    captureServerError(error, { route: '/api/usage/current' });
    return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
  }
}
