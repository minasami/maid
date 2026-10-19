'use client';

import { useMemo, useState } from 'react';

function waHref(phone: string, text: string) {
  const digits = phone.replace(/\D/g, '');
  const q = new URLSearchParams({ text });
  return digits ? `https://wa.me/${digits}?${q}` : `https://wa.me/?${q}`;
}

export function ImpactAsk({
  period,
  hasVoices,
  orgName,
  companyCode,
}: {
  period: string;
  hasVoices: boolean;
  orgName: string;
  companyCode?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState('');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const profile = companyCode
    ? `${origin}/me?company=${encodeURIComponent(companyCode)}`
    : `${origin}/me`;
  const name = orgName && orgName !== 'All organizations' ? orgName : 'your organization';

  const message = useMemo(
    () =>
      `${name} — please tell us if this month’s medicine support helped you.\nOpen your profile and answer three short questions (about 1 minute):\n${profile}\n\n${name} — من فضلك أخبرنا إن كان دعم العلاج هذا الشهر قد ساعدك.\nافتح ملفك وأجب عن ثلاثة أسئلة قصيرة:\n${profile}`,
    [name, profile]
  );

  const chat = waHref(phone, message);

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
            From <strong>{name}</strong>. Open WhatsApp with this message, or copy it. Period {period}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={chat}
            target="_blank"
            rel="noopener noreferrer"
            className="aid-cta-primary px-4 py-2 text-sm"
          >
            WhatsApp
          </a>
          <button type="button" onClick={copy} className="rounded-xl border border-[#e4ddd2] bg-white px-4 py-2 text-sm font-medium text-slate-700">
            {copied ? 'Copied' : 'Copy'}
          </button>
          <a
            href={`/api/impact/export?period=${encodeURIComponent(period)}`}
            className="rounded-xl border border-[#e4ddd2] bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            CSV
          </a>
        </div>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-semibold text-slate-600">Beneficiary phone · optional</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01xxxxxxxxx — opens their chat"
          className="w-full max-w-sm rounded-xl border border-[#e4ddd2] bg-white px-3 py-2 text-sm"
          dir="ltr"
        />
        <span className="block text-[11px] text-slate-500">
          Leave empty to pick the contact in WhatsApp. Add a number for click-to-chat.
        </span>
      </label>

      <pre className="whitespace-pre-wrap rounded-xl bg-white/80 border border-[#e4ddd2] p-3 text-xs text-slate-700">{message}</pre>
    </section>
  );
}
