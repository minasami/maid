'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PharmacyLine } from '@/lib/pharmacy';

type RouteFilter = 'all' | 'eva' | 'not';

function matches(line: PharmacyLine, q: string): boolean {
  if (!q) return true;
  const hay = [
    line.patient_name,
    line.employee_name,
    line.employee_id,
    line.program_code,
    line.drug_name,
    line.line_code,
    line.claim_id,
    line.relation,
    line.cycle_status,
    line.item_status,
    line.formulary_flag,
    line.company_preferred ? 'eva' : 'not eva',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => hay.includes(token));
}

function qtyOf(l: PharmacyLine) {
  return l.dispensed_qty ?? l.approved_qty ?? l.qty;
}

function RouteBadge({ preferred }: { preferred: boolean }) {
  return preferred ? (
    <span className="inline-flex items-center rounded-full bg-[#0f6e56]/10 px-2 py-0.5 text-[11px] font-bold text-[#0b5744]">
      EVA
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
      NOT EVA
    </span>
  );
}

export function PharmacySearchList({
  lines,
  emptyHint,
}: {
  lines: PharmacyLine[];
  emptyHint?: boolean;
}) {
  const [q, setQ] = useState('');
  const [route, setRoute] = useState<RouteFilter>('all');

  const filtered = useMemo(() => {
    return lines.filter((l) => {
      if (route === 'eva' && !l.company_preferred) return false;
      if (route === 'not' && l.company_preferred) return false;
      return matches(l, q.trim());
    });
  }, [lines, q, route]);

  const groups = useMemo(() => {
    const map = new Map<string, PharmacyLine[]>();
    for (const line of filtered) {
      if (!map.has(line.cycle_id)) map.set(line.cycle_id, []);
      map.get(line.cycle_id)!.push(line);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const evaShown = filtered.filter((l) => l.company_preferred).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm space-y-3 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="aid-section-label">Pick list · قائمة الصرف</p>
            <label htmlFor="pharmacy-search" className="text-sm font-semibold text-slate-800">
              Search patients and medicines
            </label>
          </div>
          <p className="text-xs text-slate-500">
            {filtered.length} of {lines.length} lines · {groups.length} patient
            {groups.length === 1 ? '' : 's'} · {evaShown} EVA
          </p>
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            ⌕
          </span>
          <input
            id="pharmacy-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Patient, employee, drug, program…"
            className="w-full rounded-xl border border-[#e4ddd2] bg-white py-3 pl-9 pr-16 text-base outline-none focus:border-[#0f6e56] focus:ring-2 focus:ring-[#0f6e56]/20"
            autoComplete="off"
            dir="auto"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Route filter">
          {(
            [
              ['all', 'All routes'],
              ['eva', 'EVA only'],
              ['not', 'Not EVA'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={route === key}
              onClick={() => setRoute(key)}
              className={`min-h-[2.25rem] rounded-full px-3.5 py-1 text-xs font-semibold border transition ${
                route === key
                  ? 'bg-[#0f6e56] text-white border-[#0f6e56]'
                  : 'bg-white border-[#e4ddd2] text-slate-600 hover:border-[#0f6e56]/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#e4ddd2] bg-white/80 p-8 text-center text-sm text-slate-500 space-y-2">
          {q || route !== 'all' ? (
            <>
              <p>No matches{q ? ` for “${q}”` : ''}.</p>
              <button
                type="button"
                onClick={() => {
                  setQ('');
                  setRoute('all');
                }}
                className="text-[#0f6e56] font-medium underline"
              >
                Clear filters
              </button>
            </>
          ) : emptyHint ? (
            <>
              <p className="font-medium text-slate-700">No lines for this period.</p>
              <p className="text-xs">
                Process the{' '}
                <Link href="/intake-ops" className="text-[#0f6e56] font-medium underline">
                  queue
                </Link>{' '}
                and generate{' '}
                <Link href="/refills" className="text-[#0f6e56] font-medium underline">
                  refills
                </Link>{' '}
                first.
              </p>
              <p className="text-xs" dir="rtl">
                لا توجد أسطر لهذا الشهر — عالج الطابور ثم أنشئ دورات الصرف.
              </p>
            </>
          ) : (
            <p>No lines.</p>
          )}
        </div>
      )}

      {groups.map(([cycleId, group]) => {
        const head = group[0];
        const evaLines = group.filter((l) => l.company_preferred).length;
        return (
          <article
            key={cycleId}
            className="rounded-2xl border border-white/90 bg-white shadow-sm overflow-hidden"
          >
            <div className="bg-[#f4f1ea]/70 px-4 py-3 flex flex-wrap justify-between gap-3 border-b border-[#e4ddd2]">
              <div className="min-w-0">
                <p className="aid-display text-lg leading-tight truncate">{head.patient_name}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {head.employee_name}
                  {head.employee_id ? ` · ${head.employee_id}` : ''}
                  {head.program_code ? ` · ${head.program_code}` : ''}
                  {head.relation ? ` · ${head.relation}` : ''}
                </p>
              </div>
              <div className="text-right space-y-1 shrink-0">
                <span className="inline-block rounded-full bg-white border border-[#e4ddd2] px-2 py-0.5 text-[11px] font-semibold capitalize">
                  {head.cycle_status.replace(/_/g, ' ')}
                </span>
                <p className="text-[11px] text-slate-500">
                  {evaLines}/{group.length} EVA · {group.length} line
                  {group.length === 1 ? '' : 's'}
                </p>
                <Link
                  href={`/refills/${cycleId}`}
                  className="block text-xs font-semibold text-[#0f6e56] hover:underline"
                >
                  Cycle detail
                </Link>
              </div>
            </div>

            <ul className="md:hidden divide-y divide-[#e4ddd2]">
              {group.map((l) => (
                <li
                  key={`${l.cycle_id}-${l.line_code}`}
                  className="px-4 py-3 flex justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{l.drug_name}</p>
                    <p className="text-[11px] text-slate-500">
                      Qty {qtyOf(l)} · {l.item_status.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <RouteBadge preferred={!!l.company_preferred} />
                </li>
              ))}
            </ul>

            <table className="hidden md:table w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-slate-500 text-left bg-white">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Drug</th>
                  <th className="px-4 py-2.5 font-semibold">Qty</th>
                  <th className="px-4 py-2.5 font-semibold">Route</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {group.map((l) => (
                  <tr
                    key={`${l.cycle_id}-${l.line_code}`}
                    className="border-t border-[#e4ddd2] hover:bg-[#f4f1ea]/40"
                  >
                    <td className="px-4 py-3 font-medium">{l.drug_name}</td>
                    <td className="px-4 py-3 tabular-nums">{qtyOf(l)}</td>
                    <td className="px-4 py-3">
                      <RouteBadge preferred={!!l.company_preferred} />
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-slate-600">
                      {l.item_status.replace(/_/g, ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        );
      })}
    </div>
  );
}
