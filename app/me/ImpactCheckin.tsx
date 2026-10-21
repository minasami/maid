'use client';

import { useEffect, useState } from 'react';

type Helped = 'yes' | 'somewhat' | 'no';

export function ImpactCheckin({
  company,
  empId,
  phone,
}: {
  company: string;
  empId: string;
  phone: string;
}) {
  const [helped, setHelped] = useState<Helped | ''>('');
  const [depth, setDepth] = useState(3);
  const [life, setLife] = useState(3);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orgs/logo?company=${encodeURIComponent(company)}`)
      .then((r) => r.json())
      .then((d) => setLogoUrl(d.logo_url || null))
      .catch(() => setLogoUrl(null));
    const q = new URLSearchParams({ company, emp_id: empId, phone });
    fetch(`/api/employee/impact?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.checkin) {
          setHelped(d.checkin.helped);
          setDepth(d.checkin.depth);
          setLife(d.checkin.life);
          setNote(d.checkin.note || '');
          setSaved(true);
        }
      })
      .catch(() => {});
  }, [company, empId, phone]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!helped) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/employee/impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          emp_id: empId,
          phone,
          helped,
          depth,
          life,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not save');
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="rounded-2xl border p-5 space-y-4 shadow-sm"
      style={{ borderColor: 'var(--aid-line)', background: 'var(--aid-surface)' }}
    >
      <div className="flex items-start gap-3">
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-12 w-12 rounded-xl border object-contain bg-white" />
        )}
        <div>
        <p className="aid-section-label">This month · هذا الشهر</p>
        <h2 className="aid-display text-xl">Did the support help?</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--aid-muted)' }}>
          Your organization sees the totals, not a clinical diagnosis. One answer a month.
        </p>
        <p className="text-sm" style={{ color: 'var(--aid-muted)' }} dir="rtl">
          المؤسسة ترى المجموع فقط. إجابة واحدة في الشهر.
        </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Did this month’s medicine support help you?</p>
          <p className="text-xs" style={{ color: 'var(--aid-muted)' }} dir="rtl">
            هل ساعدك دعم العلاج هذا الشهر؟
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['yes', 'Yes · نعم'],
                ['somewhat', 'Somewhat · إلى حد ما'],
                ['no', 'No · لا'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setHelped(id)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold border ${
                  helped === id
                    ? 'bg-[#0f6e56] text-white border-[#0f6e56]'
                    : 'bg-white border-[#e4ddd2] text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-semibold">
            How much of your medicine need did it cover? · {depth}/5
          </span>
          <span className="block text-xs" style={{ color: 'var(--aid-muted)' }} dir="rtl">
            كم غطى من احتياجك الدوائي؟
          </span>
          <input
            type="range"
            min={1}
            max={5}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full accent-[#0f6e56]"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-semibold">
            How is daily life this month? · {life}/5
          </span>
          <span className="block text-xs" style={{ color: 'var(--aid-muted)' }} dir="rtl">
            كيف جودة حياتك هذا الشهر؟
          </span>
          <input
            type="range"
            min={1}
            max={5}
            value={life}
            onChange={(e) => setLife(Number(e.target.value))}
            className="w-full accent-[#0f6e56]"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-semibold">Anything we should know? · ملاحظة</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            className="aid-input text-sm min-h-[72px]"
            placeholder="Optional"
          />
        </label>

        <button
          type="submit"
          disabled={busy || !helped}
          className="aid-cta-primary w-full py-2.5 text-sm disabled:opacity-50"
        >
          {busy ? 'Saving…' : saved ? 'Update this month · تحديث' : 'Send to my organization · إرسال'}
        </button>
        {saved && !error && (
          <p className="text-xs font-medium" style={{ color: 'var(--aid-emerald)' }}>
            Saved for this month. Thank you.
          </p>
        )}
        {error && <p className="text-xs text-red-700">{error}</p>}
      </form>
    </section>
  );
}
