import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE = 'maa_admin';
const STAFF_COOKIE = 'maa_ops_staff';

const PUBLIC_EXACT = new Set([
  '/',
  '/intake',
  '/request-status',
  '/me',
  '/org/register',
  '/guide',
  '/demo',
  '/medical-aid-one-pager.pdf',
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

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/** Edge-safe HMAC. Allowlist/role was enforced when the cookie was minted. */
async function verifyStaffToken(token: string | undefined): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(signingKey()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const mac = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(payload)
    );
    const expected = bytesToBase64Url(new Uint8Array(mac));
    if (expected.length !== sig.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
    }
    if (diff !== 0) return false;
    const email = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return email.includes('@');
  } catch {
    return false;
  }
}

async function hasOpsAuth(req: NextRequest, secrets: string[]): Promise<boolean> {
  if (await verifyStaffToken(req.cookies.get(STAFF_COOKIE)?.value)) return true;

  const candidates = [
    req.headers.get('x-process-secret'),
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || null,
    req.nextUrl.searchParams.get('secret'),
    req.cookies.get(ADMIN_COOKIE)?.value || null,
  ];
  if (candidates.some((c) => c && secrets.includes(c))) return true;
  return false;
}

export async function middleware(req: NextRequest) {
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

  if (await hasOpsAuth(req, secrets)) {
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
