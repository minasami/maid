import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createNeonAuth } from '@neondatabase/auth/next/server';

const ADMIN_COOKIE = 'maa_admin';
const STAFF_COOKIE = 'maa_ops_staff';
const SESSION_VERIFIER = 'neon_auth_session_verifier';

const PUBLIC_EXACT = new Set([
  '/',
  '/intake',
  '/request-status',
  '/me',
  '/org/register',
  '/guide',
  '/status',
  '/admin',
  '/icon',
  '/apple-icon',
  '/splash',
  '/manifest.webmanifest',
  '/sw.js',
  '/templates/pharmacy-import-template.csv',
]);

const PUBLIC_PREFIXES = [
  '/api/health',
  '/api/auth/',
  '/api/request-status',
  '/api/employee/',
  '/api/orgs',
  '/api/learning',
  '/api/dhis2',
  '/api/webhooks/whatsapp',
  '/api/webhooks/twilio',
  '/_next/',
  '/favicon',
  '/icon',
  '/apple-icon',
  '/splash',
  '/templates/',
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (pathname === '/sign-in' || pathname.startsWith('/sign-in/')) return true;
  if (pathname === '/org' || pathname.startsWith('/org/')) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (pathname === '/api/intake') return true;
  return false;
}

function getOpsSecrets(): string[] {
  return (process.env.PROCESS_SECRET || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getAllowedEmails(): string[] {
  return (process.env.OPS_ALLOWED_EMAILS || process.env.STAFF_ALLOWED_EMAILS || '')
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function signingKey(): string {
  return (
    process.env.NEON_AUTH_COOKIE_SECRET ||
    process.env.PROCESS_SECRET ||
    'dev-only-insecure-key-change-me'
  );
}

/** HMAC only — allowlist/role enforced when cookie was minted */
function verifyStaffToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = createHmac('sha256', signingKey())
    .update(payload)
    .digest('base64url');
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const email = Buffer.from(payload, 'base64url').toString('utf8');
    return email.includes('@');
  } catch {
    return false;
  }
}

function hasOpsAuth(req: NextRequest, secrets: string[]): boolean {
  if (verifyStaffToken(req.cookies.get(STAFF_COOKIE)?.value)) return true;

  const candidates = [
    req.headers.get('x-process-secret'),
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || null,
    req.nextUrl.searchParams.get('secret'),
    req.cookies.get(ADMIN_COOKIE)?.value || null,
  ];
  if (candidates.some((c) => c && secrets.includes(c))) return true;
  return false;
}

/**
 * Google returns to callbackURL with neon_auth_session_verifier.
 * Neon Auth middleware exchanges that plus the challenge cookie for the session cookie.
 * Only run it when the verifier is present so public pages stay public.
 */
function exchangeNeonSession(req: NextRequest) {
  const base = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!base || !secret || secret.length < 32) return null;
  if (!req.nextUrl.searchParams.has(SESSION_VERIFIER)) return null;
  const auth = createNeonAuth({
    baseUrl: base,
    cookies: { secret },
  });
  return auth.middleware({ loginUrl: '/sign-in' })(req);
}

export async function middleware(req: NextRequest) {
  const exchanged = exchangeNeonSession(req);
  if (exchanged) return exchanged;

  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const secrets = getOpsSecrets();
  const staffConfigured =
    !!process.env.NEON_AUTH_BASE_URL && getAllowedEmails().length > 0;

  if (!secrets.length && !staffConfigured) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Ops locked — set PROCESS_SECRET and/or Neon Auth + OPS_ALLOWED_EMAILS',
          code: 'secret_required',
        },
        { status: 503 }
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('ops', 'locked');
    return NextResponse.redirect(url);
  }

  if (hasOpsAuth(req, secrets)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Unauthorized',
        code: 'unauthorized',
      },
      { status: 401 }
    );
  }

  const url = req.nextUrl.clone();
  url.pathname = '/';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};
