'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createAuthClient } from '@neondatabase/auth/next';

function CallbackInner() {
  const search = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState('Completing sign-in…');

  useEffect(() => {
    const next =
      search?.get('next') && search.get('next')!.startsWith('/')
        ? search.get('next')!
        : '/';
    const params = new URLSearchParams(search?.toString() || '');
    const names = Array.from(params.keys());
    const verifier = params.get('neon_auth_session_verifier');
    const error = params.get('error') || params.get('error_description');

    (async () => {
      try {
        if (error) {
          setMsg(`Google returned: ${error}`);
          return;
        }

        // Exchange the verifier through the auth proxy so the session cookie lands here.
        if (verifier) {
          const exchange = await fetch(
            `/api/auth/get-session?neon_auth_session_verifier=${encodeURIComponent(verifier)}`,
            { credentials: 'include' }
          );
          if (!exchange.ok) {
            setMsg(
              `Session exchange failed (${exchange.status}). Params: ${names.join(', ') || 'none'}`
            );
            return;
          }
        }

        const client = createAuthClient();
        const session = await client.getSession().catch(() => null);
        const email =
          session &&
          typeof session === 'object' &&
          'data' in session &&
          (session as { data?: { user?: { email?: string } } }).data?.user?.email;

        const res = await fetch('/api/auth/staff-session', {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
          const extra = [
            names.length ? `params: ${names.join(', ')}` : 'no query params',
            email ? `google: ${email}` : null,
            data.cookies ? `cookies: ${data.cookies}` : null,
          ]
            .filter(Boolean)
            .join(' · ');
          setMsg(`${data.error || 'Not allowed'}${extra ? ` (${extra})` : ''}`);
          return;
        }
        setMsg(`Welcome ${data.email}`);
        router.replace(next);
      } catch (e: unknown) {
        setMsg(e instanceof Error ? e.message : 'Error');
      }
    })();
  }, [search, router]);

  return (
    <div className="max-w-sm rounded-xl border bg-white p-6 shadow-sm text-center space-y-3">
      <p className="text-sm text-slate-700 break-words">{msg}</p>
      <Link href="/sign-in" className="text-xs text-violet-700 hover:underline">
        Back to sign-in
      </Link>
    </div>
  );
}

export default function SignInCallbackPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <Suspense fallback={<p className="text-sm text-slate-500">Completing sign-in…</p>}>
        <CallbackInner />
      </Suspense>
    </main>
  );
}
