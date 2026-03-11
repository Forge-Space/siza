import { NextResponse } from 'next/server';
import { captureCoreFlowValidationSnapshot } from '@/lib/services/core-flow-validation.service';

function getSnapshotToken() {
  return process.env.METRICS_SNAPSHOT_TOKEN;
}

function getBearerToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Failed to capture snapshot';
  if (message.includes('configuration missing')) {
    return NextResponse.json({ error: 'Snapshot endpoint is not configured' }, { status: 503 });
  }
  return NextResponse.json({ error: 'Failed to capture snapshot' }, { status: 500 });
}

export async function POST(request: Request) {
  const configuredToken = getSnapshotToken();
  if (!configuredToken) {
    return NextResponse.json({ error: 'Snapshot endpoint is not configured' }, { status: 503 });
  }

  const bearerToken = getBearerToken(request.headers.get('authorization'));
  if (!bearerToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (bearerToken !== configuredToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const report = await captureCoreFlowValidationSnapshot();
    return NextResponse.json({
      message: 'Snapshot captured',
      capturedSnapshotDate: report.capturedSnapshotDate,
      gate: report.gate,
      current: report.current,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
