'use client';

import { useState } from 'react';

export function PrintButton() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="text-sm font-semibold text-[#0f6e56] hover:underline"
      >
        Print report
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="text-sm font-semibold text-[#0f6e56] hover:underline"
      >
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  );
}
