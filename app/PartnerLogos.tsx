'use client';

import { useEffect, useState } from 'react';

type Org = { code: string; name: string; logo_url?: string | null };

export function PartnerLogos() {
  const [orgs, setOrgs] = useState<Org[]>([]);

  useEffect(() => {
    fetch('/api/orgs')
      .then((r) => r.json())
      .then((d) => {
        const rows = (d.organizations || []) as Org[];
        setOrgs(rows.filter((o) => o.logo_url));
      })
      .catch(() => setOrgs([]));
  }, []);

  if (!orgs.length) return null;

  return (
    <section className="space-y-2">
      <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Organizations on Medical Aid · المؤسسات
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {orgs.map((o) => (
          <div key={o.code} className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/80 bg-white/90 shadow-sm" title={o.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={o.logo_url || ''} alt={o.name} className="h-9 w-9 object-contain" />
          </div>
        ))}
      </div>
    </section>
  );
}
