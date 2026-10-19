import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/auth';
import { getOrganizationLogo, setOrganizationLogo } from '@/lib/organizations';

export const dynamic = 'force-dynamic';

/** GET ?company= — public logo for profile and shared links. */
export async function GET(req: NextRequest) {
  try {
    const company = req.nextUrl.searchParams.get('company') || '';
    const logo_url = await getOrganizationLogo(company);
    return NextResponse.json({ ok: true, logo_url });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    );
  }
}

/** POST { code, logo_url } — staff sets or clears the company logo. */
export async function POST(req: NextRequest) {
  if (!authorizeRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const code = String(body.code || '').trim();
    if (!code) {
      return NextResponse.json({ ok: false, error: 'code is required' }, { status: 400 });
    }
    const logo = body.logo_url == null ? null : String(body.logo_url);
    await setOrganizationLogo(code, logo);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 400 }
    );
  }
}
