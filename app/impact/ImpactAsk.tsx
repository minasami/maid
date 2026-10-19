'use client';

import { useState } from 'react';

export function ImpactAsk({ period, hasVoices }: { period: string; hasVoices: boolean }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const link = `${origin}/me`;
  const message = `Please tell us if this month’s medicine support helped you.\nOpen your profile and answer three short questions (about 1 minute):\n${link}\n\nمن فضلك أخبرنا إن كان دعم العلاج هذا الشهر قد ساعدك.\nافتح ملفك وأجب عن ثلاثة أسئلة قصيرة:\n${link}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#0f6e56]/20 bg-[#0f6e56]/5 p-5 space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="aid-display text-xl">{hasVoices ? 'Ask for more answers' : 'Ask people to answer'}</h2>
          <p className="text-sm text-slate-600 mt-1">
            Send this on WhatsApp. They open My profile with company, ID, and phone, then answer for {period}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copy} className="aid-cta-primary px-4 py-2 text-sm">
            {copied ? 'Copied' : 'Copy message'}
          </button>
          <a
            href={`/api/impact/export?period=${encodeURIComponent(period)}`}
            className="rounded-xl border border-[#e4ddd2] bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Download CSV
          </a>
        </div>
      </div>
      <pre className="whitespace-pre-wrap rounded-xl bg-white/80 border border-[#e4ddd2] p-3 text-xs text-slate-700">{message}</pre>
    </section>
  );
}
