import { NextRequest, NextResponse } from 'next/server';
import { getImpactSummary } from '@/lib/impact';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const period = req.nextUrl.searchParams.get('period') || undefined;
    const summary = await getImpactSummary(period);
    return NextResponse.json({ ok: true, summary });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    );
  }
}
