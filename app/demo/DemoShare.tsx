'use client';

import { useState } from 'react';

export function DemoShare() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold"
    >
      {copied ? 'Link copied' : 'Copy demo link'}
    </button>
  );
}
