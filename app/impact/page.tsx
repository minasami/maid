import Link from 'next/link';
import { FlowSteps } from '../FlowSteps';
import { getImpactSummary } from '@/lib/impact';
import { resolveImpactScope } from '@/lib/impactScope';

export const dynamic = 'force-dynamic';

function defaultPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function pct(n: number | null) {
  return n == null ? '—' : `${n}%`;
}

function Bar({ value, max = 5 }: { value: number | null; max?: number }) {
  const w = value == null ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-2 rounded-full bg-[#e4ddd2] overflow-hidden">
      <div className="h-full rounded-full bg-[#0f6e56]" style={{ width: `${w}%` }} />
    </div>
  );
}

export default async function ImpactPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = searchParams.period || defaultPeriod();
  const scope = await resolveImpactScope();
  let data = null as Awaited<ReturnType<typeof getImpactSummary>> | null;
  let error: string | null = null;
  try {
    data = await getImpactSummary(period, scope);
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Could not load impact';
  }

  const cards = data
    ? [
        { label: 'People reached', ar: 'من وصلهم الدعم', value: String(data.reach.unique_patients), hint: `${data.reach.active_programs} active programs` },
        { label: 'Continuity', ar: 'استمرار', value: `${data.continuity.avg_months_on_program} mo`, hint: `${data.continuity.dropouts} dropouts` },
        { label: 'Delivered', ar: 'تم الصرف', value: pct(data.delivery.delivery_rate), hint: `${data.delivery.dispensed} of ${data.delivery.cycles}` },
        { label: 'Said it helped', ar: 'قالوا إنه ساعد', value: pct(data.voice.helped_rate), hint: `${data.voice.checkins} answers` },
      ]
    : [];

  return (
    <main className="min-h-screen p-4 sm:p-6 text-slate-900 pb-28 md:pb-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-3">
          <FlowSteps current={5} />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="aid-section-label">Organization dashboard · لوحة الأثر</p>
              <h1 className="aid-display text-3xl sm:text-4xl">Beneficiary impact</h1>
              <p className="text-sm text-slate-600">
                {data?.org_label || scope.label}. Reach, continuity, delivery, and what people say about depth and daily life.
              </p>
              <p className="text-sm text-slate-500" dir="rtl">
                هل الدعم يصل؟ وهل يغيّر الاحتياج وجودة الحياة؟
              </p>
            </div>
            <Link href="/me" className="text-sm font-semibold text-[#0f6e56] hover:underline">
              How people answer →
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {cards.map((c) => (
                <div key={c.label} className="aid-kpi text-left space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{c.label}</p>
                  <p className="aid-display text-3xl">{c.value}</p>
                  <p className="text-[11px] text-slate-500">{c.hint}</p>
                  <p className="text-[11px] text-slate-400" dir="rtl">{c.ar}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <section className="rounded-2xl border border-white/90 bg-white/90 p-5 shadow-sm space-y-3">
                <h2 className="aid-display text-xl">Did it help?</h2>
                <p className="text-xs text-slate-500">From this month’s check-ins · من إجابات هذا الشهر</p>
                {(
                  [
                    ['Yes', data.voice.helped_yes, 'bg-[#0f6e56]'],
                    ['Somewhat', data.voice.helped_somewhat, 'bg-[#0d9488]'],
                    ['No', data.voice.helped_no, 'bg-slate-400'],
                  ] as const
                ).map(([label, count, color]) => {
                  const total = data.voice.checkins || 1;
                  const w = data.voice.checkins ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{label}</span>
                        <span className="tabular-nums text-slate-500">{count} · {w}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#e4ddd2] overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-slate-500">
                  Response rate {pct(data.voice.response_rate)} of employees on a program.
                </p>
              </section>

              <section className="rounded-2xl border border-white/90 bg-white/90 p-5 shadow-sm space-y-4">
                <h2 className="aid-display text-xl">How deep, how much</h2>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Depth of cover</span>
                    <span className="tabular-nums">{data.voice.avg_depth == null ? '—' : `${data.voice.avg_depth} / 5`}</span>
                  </div>
                  <Bar value={data.voice.avg_depth} />
                  <p className="text-[11px] text-slate-500" dir="rtl">كم غطى من الاحتياج الدوائي</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Daily life this month</span>
                    <span className="tabular-nums">{data.voice.avg_life == null ? '—' : `${data.voice.avg_life} / 5`}</span>
                  </div>
                  <Bar value={data.voice.avg_life} />
                  <p className="text-[11px] text-slate-500" dir="rtl">جودة الحياة كما يصفها المستفيد</p>
                </div>
                <p className="text-xs text-slate-500">
                  1 is little or hard. 5 is almost all of the need, or a good month. Not a clinical score.
                </p>
              </section>
            </div>

            <section className="rounded-2xl border border-white/90 bg-white/90 p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="aid-display text-xl">Last three months</h2>
                <p className="text-xs text-slate-500">Is the help getting deeper?</p>
              </div>
              {data.trend.length === 0 ? (
                <p className="text-sm text-slate-500">No check-ins yet. Trend starts after the first answers.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-3">
                  {data.trend.map((row) => (
                    <div key={row.period} className="rounded-xl border border-[#e4ddd2] bg-[#f4f1ea]/50 p-3 space-y-1">
                      <p className="text-xs font-semibold text-slate-500">{row.period}</p>
                      <p className="aid-display text-2xl">{row.helped_rate == null ? '—' : `${row.helped_rate}%`}</p>
                      <p className="text-[11px] text-slate-500">{row.checkins} answers · helped</p>
                      <p className="text-[11px] text-slate-600">Depth {row.avg_depth ?? '—'} · Life {row.avg_life ?? '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {data.voice.checkins === 0 && (
              <section className="rounded-2xl border border-[#0f6e56]/20 bg-[#0f6e56]/5 p-5 space-y-2">
                <h2 className="aid-display text-xl">Ask people to answer</h2>
                <p className="text-sm text-slate-600">
                  Reach and delivery already show. Depth and life appear when beneficiaries open My profile and send this month’s check-in.
                </p>
                <p className="text-sm text-slate-500" dir="rtl">
                  اطلب من المستفيد فتح الملف والإجابة على سؤال هذا الشهر.
                </p>
                <Link href="/me" className="inline-block aid-cta-primary px-4 py-2 text-sm">
                  Open profile check-in
                </Link>
              </section>
            )}

            <section className="rounded-2xl border border-white/90 bg-white/90 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e4ddd2] bg-[#f4f1ea]/70 flex justify-between gap-2">
                <h2 className="aid-display text-lg">Voices this month</h2>
                <span className="text-xs text-slate-500">{data.recent.length} shown</span>
              </div>
              {data.recent.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">
                  No check-ins yet. People answer on My profile with company, ID, and phone.
                </p>
              ) : (
                <ul className="divide-y divide-[#e4ddd2]">
                  {data.recent.map((row, i) => (
                    <li key={`${row.created_at}-${i}`} className="px-4 py-3 flex flex-wrap justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium">{row.emp_name || 'Employee'}</p>
                        <p className="text-xs text-slate-500 capitalize">{row.company} · {row.helped}</p>
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

            <p className="text-xs text-slate-500">
              Reach, continuity, and delivery come from programs and refills. Depth and life come from the people you support. A low response rate means the voice numbers describe who answered, not everyone.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
