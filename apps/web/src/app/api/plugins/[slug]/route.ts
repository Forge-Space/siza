import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getPluginDetail,
  installPluginForUser,
  uninstallPluginForUser,
  updatePluginConfigForUser,
} from '@/lib/services/plugin.service';
import { captureServerError } from '@/lib/sentry/server';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await ctx.params;

  try {
    const plugin = await getPluginDetail(slug, user.id);
    return NextResponse.json(plugin);
  } catch (err) {
    if ((err as Error).message?.includes('not found')) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }
    captureServerError(err, { route: `/api/plugins/${slug}` });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  try {
    await installPluginForUser(slug, user.id, body.config);
    return NextResponse.json({ installed: true });
  } catch (err) {
    if ((err as Error).message?.includes('not found')) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }
    captureServerError(err, { route: `/api/plugins/${slug}` });
    return NextResponse.json({ error: 'Failed to install' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await ctx.params;

  try {
    await uninstallPluginForUser(slug, user.id);
    return NextResponse.json({ uninstalled: true });
  } catch (err) {
    captureServerError(err, { route: `/api/plugins/${slug}` });
    return NextResponse.json({ error: 'Failed to uninstall' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const body = await req.json().catch(() => null);

  if (!body?.config) {
    return NextResponse.json({ error: 'Config required' }, { status: 400 });
  }

  try {
    await updatePluginConfigForUser(slug, user.id, body.config);
    return NextResponse.json({ updated: true });
  } catch (err) {
    captureServerError(err, { route: `/api/plugins/${slug}` });
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
