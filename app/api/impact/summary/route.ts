import { NextRequest, NextResponse } from 'next/server';
import { getImpactSummary } from '@/lib/impact';
import { resolveImpactScope } from '@/lib/impactScope';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const period = req.nextUrl.searchParams.get('period') || undefined;
    const org = req.nextUrl.searchParams.get('org') || undefined;
    const scope = await resolveImpactScope(org);
    const summary = await getImpactSummary(period, scope);
    return NextResponse.json({ ok: true, summary });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    );
  }
}
