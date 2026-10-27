import { NextRequest, NextResponse } from 'next/server';
import { getNeonAuth, neonAuthConfigured } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

type AuthParams = { path?: string[] };
type AuthRouteContext = {
  params: AuthParams | Promise<AuthParams>;
};

/**
 * Neon Auth / Managed Better Auth proxy.
 * Note: app/api/auth/unlock remains a specific route and takes precedence.
 *
 * Neon Auth 0.7 awaits the route `params`. Next 14 passes a plain object;
 * Next 15 passes a Promise. Either way the handler must receive the context.
 */
async function handle(req: NextRequest, context: AuthRouteContext) {
  if (!neonAuthConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Neon Auth not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET (32+ chars) on Vercel.',
        code: 'neon_auth_missing',
      },
      { status: 503 }
    );
  }
  const auth = getNeonAuth();
  if (!auth) {
    return NextResponse.json(
      { ok: false, error: 'Neon Auth init failed' },
      { status: 503 }
    );
  }
  const handlers = auth.handler();
  const params = Promise.resolve(context.params);
  const method = req.method.toUpperCase();
  if (method === 'GET') return handlers.GET(req, { params });
  if (method === 'POST') return handlers.POST(req, { params });
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function GET(req: NextRequest, context: AuthRouteContext) {
  return handle(req, context);
}

export async function POST(req: NextRequest, context: AuthRouteContext) {
  return handle(req, context);
}
