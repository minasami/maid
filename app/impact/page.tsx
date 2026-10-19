import Link from 'next/link';
import { FlowSteps } from '../FlowSteps';
import { getImpactSummary } from '@/lib/impact';

export const dynamic = 'force-dynamic';

function defaultPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function pct(n: number | null) {
  return n == null ? '—' : `${n}%`;
}

function score(n: number | null) {
  return n == null ? '—' : `${n} / 5`;
}

export default async function ImpactPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = searchParams.period || defaultPeriod();
  let data = null as Awaited<ReturnType<typeof getImpactSummary>> | null;
  let error: string | null = null;
  try {
    data = await getImpactSummary(period);
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Could not load impact';
  }

  const cards = data
    ? [
        { label: 'People reached', ar: 'من وصلهم الدعم', value: String(data.reach.unique_patients), hint: `${data.reach.active_programs} active programs` },
        { label: 'Continuity', ar: 'استمرار', value: `${data.continuity.avg_months_on_program} mo`, hint: `${data.continuity.dropouts} dropouts` },
        { label: 'Delivered', ar: 'تم الصرف', value: pct(data.delivery.delivery_rate), hint: `${data.delivery.dispensed} of ${data.delivery.cycles} cycles` },
        { label: 'Said it helped', ar: 'قالوا إنه ساعد', value: pct(data.voice.helped_rate), hint: `${data.voice.checkins} check-ins` },
        { label: 'Depth of cover', ar: 'عمق التغطية', value: score(data.voice.avg_depth), hint: '1 little · 5 almost all' },
        { label: 'Life this month', ar: 'جودة الحياة', value: score(data.voice.avg_life), hint: 'Self-reported' },
      ]
    : [];

  return (
    <main className="min-h-screen p-4 sm:p-6 text-slate-900 pb-28 md:pb-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-3">
          <FlowSteps current={5} />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="aid-section-label">More tools · Impact</p>
              <h1 className="aid-display text-3xl sm:text-4xl">Are we helping?</h1>
              <p className="text-sm text-slate-600">
                Reach, continuity, delivery, and what beneficiaries say about depth and daily life.
              </p>
              <p className="text-sm text-slate-500" dir="rtl">
                الوصول والاستمرار والصرف، وما يقوله المستفيد عن عمق الدعم وجودة حياته.
              </p>
            </div>
            <Link href="/me" className="text-sm font-semibold text-[#0f6e56] hover:underline">
              Beneficiary check-in →
            </Link>
          </div>
        </header>

        <form method="get" className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm">
          <label className="text-sm font-medium">Month</label>
          <input type="month" name="period" defaultValue={period} className="rounded-xl border border-[#e4ddd2] px-3 py-2 text-sm" />
          <button type="submit" className="aid-cta-primary px-4 py-2 text-sm">Show</button>
        </form>

        {error && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">{error}</div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cards.map((c) => (
                <div key={c.label} className="aid-kpi text-left space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{c.label}</p>
                  <p className="aid-display text-2xl">{c.value}</p>
                  <p className="text-[11px] text-slate-500">{c.hint}</p>
                  <p className="text-[11px] text-slate-400" dir="rtl">{c.ar}</p>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-white/90 bg-white/90 p-5 shadow-sm space-y-2">
              <h2 className="aid-display text-xl">How to read this</h2>
              <ul className="text-sm text-slate-600 space-y-1.5">
                <li><strong>Reach</strong> — people currently on a chronic program.</li>
                <li><strong>Continuity</strong> — average months they have stayed on support.</li>
                <li><strong>Delivered</strong> — share of this month’s refill cycles that were dispensed.</li>
                <li><strong>Said it helped</strong> — yes or somewhat, from the profile check-in.</li>
                <li><strong>Depth</strong> — how much of their medicine need they say was covered (1–5).</li>
                <li><strong>Life</strong> — how they rate daily life this month (1–5). Not a clinical score.</li>
              </ul>
              <p className="text-xs text-slate-500">
                Response rate this month: {pct(data.voice.response_rate)} of employees on a program.
                Low response means the numbers describe the people who answered, not everyone.
              </p>
              <p className="text-xs text-slate-500" dir="rtl">
                هذا رأي المستفيد، وليس تشخيصاً طبياً. إذا قلّ عدد الإجابات فالرقم يصف من أجاب فقط.
              </p>
            </section>

            <section className="rounded-2xl border border-white/90 bg-white/90 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e4ddd2] bg-[#f4f1ea]/70">
                <h2 className="aid-display text-lg">Voices this month</h2>
              </div>
              {data.recent.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">
                  No check-ins yet. Employees answer on My profile after they sign in with company, ID, and phone.
                </p>
              ) : (
                <ul className="divide-y divide-[#e4ddd2]">
                  {data.recent.map((row, i) => (
                    <li key={`${row.created_at}-${i}`} className="px-4 py-3 flex flex-wrap justify-between gap-2 text-sm">
                      <div>
                        <p className="font-medium">{row.emp_name || 'Employee'}</p>
                        <p className="text-xs text-slate-500">{row.company} · {row.helped}</p>
                        {row.note && <p className="text-xs text-slate-600 mt-1">{row.note}</p>}
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>Depth {row.depth}/5</p>
                        <p>Life {row.life}/5</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
