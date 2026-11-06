'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function BackButton() {
  const pathname = usePathname();
  const [canBack, setCanBack] = useState(false);

  useEffect(() => {
    setCanBack(window.history.length > 1);
  }, [pathname]);

  if (pathname === '/') {
    if (!canBack) return null;
    return (
      <button
        type="button"
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-800"
        aria-label="Back"
      >
        <span aria-hidden>←</span>
        Back
        <span className="text-slate-400" dir="rtl">رجوع</span>
      </button>
    );
  }

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-800"
      aria-label="Back to home"
    >
      <span aria-hidden>←</span>
      Home
      <span className="text-slate-400" dir="rtl">الرئيسية</span>
    </Link>
  );
}
