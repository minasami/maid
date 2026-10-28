import { NextRequest, NextResponse } from 'next/server';
import { getImpactCheckin, saveImpactCheckin, currentPeriod, type Helped } from '@/lib/impact';

export const dynamic = 'force-dynamic';

/** GET ?company=&emp_id=&phone=&period= — this month's check-in if any. */
export async function GET(req: NextRequest) {
  try {
    const company = req.nextUrl.searchParams.get('company') || '';
    const emp_id = req.nextUrl.searchParams.get('emp_id') || '';
    const phone = req.nextUrl.searchParams.get('phone') || '';
    const period = req.nextUrl.searchParams.get('period') || currentPeriod();
    if (!company || !emp_id || !phone) {
      return NextResponse.json(
        { ok: false, error: 'company, emp_id, and phone are required' },
        { status: 400 }
      );
    }
    const checkin = await getImpactCheckin({ company, emp_id, phone, period });
    return NextResponse.json({ ok: true, period, checkin });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    );
  }
}

/** POST { company, emp_id, phone, helped, depth, life, note? } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const checkin = await saveImpactCheckin({
      company: String(body.company || ''),
      emp_id: String(body.emp_id || ''),
      phone: String(body.phone || ''),
      helped: String(body.helped || '') as Helped,
      depth: Number(body.depth),
      life: Number(body.life),
      note: body.note ? String(body.note) : undefined,
    });
    return NextResponse.json({ ok: true, checkin });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error';
    const status = /No match|must be/.test(message) ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
