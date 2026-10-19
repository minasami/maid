'use client';

import { useEffect, useState } from 'react';

/** Shows when the site is the maid-beta host or NEXT_PUBLIC_APP_ENV=beta. */
export function BetaBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    const env = process.env.NEXT_PUBLIC_APP_ENV;
    setShow(env === 'beta' || host.includes('maid-beta') || host.includes('-beta.'));
  }, []);

  if (!show) return null;

  return (
    <div
      className="rounded-2xl border px-4 py-2.5 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2"
      style={{
        borderColor: '#fcd34d',
        background: '#fffbeb',
        color: '#78350f',
      }}
      role="status"
    >
      <span>
        <strong>Beta</strong> · staging data · not the live production site
      </span>
      <span dir="rtl">نسخة تجريبية — بيانات staging وليست الإنتاج</span>
    </div>
  );
}
