'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BrandMark } from './BrandMark';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <BrandMark size="md" showTitle={false} />
      <div className="space-y-2 max-w-sm">
        <p className="aid-section-label">Something went wrong</p>
        <h1 className="aid-display text-3xl">We couldn\'t finish that</h1>
        <p className="text-sm text-slate-600">
          Your data is safe. Try again, or go home and pick a step.
        </p>
        <p className="text-sm text-slate-500" dir="rtl">
          حدث خطأ. بياناتك آمنة — أعد المحاولة أو ارجع للرئيسية.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-slate-400">Ref: {error.digest}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <button type="button" onClick={reset} className="aid-cta-primary px-5 py-2.5 text-sm">
          Try again · أعد المحاولة
        </button>
        <Link
          href="/"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
