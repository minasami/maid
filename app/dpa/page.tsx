import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data processing note',
  description: 'How Medical Aid processes an organization’s employee and patient data.',
};

export default function DpaPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-6 text-sm leading-relaxed text-slate-700">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Legal</p>
        <h1 className="text-2xl font-semibold text-slate-900">Data processing note</h1>
        <p className="text-xs text-slate-500">Pilot · 6 November 2026</p>
      </header>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">Roles</h2>
        <p>
          The organization decides why the data is collected. It is the controller. Medical Aid
          processes that data only to run the program the organization approved. It is the processor.
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">Instructions</h2>
        <p>
          Processing is limited to: intake, status, employee self-service, claims, pharmacy routing,
          refills, impact, audit, and WhatsApp notices the organization turns on. We do not use the
          data to train a model, and we do not share it with another organization.
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">Sub-processors</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Neon — database, EU central.</li>
          <li>Vercel — application hosting.</li>
          <li>Google — staff sign-in only.</li>
          <li>Meta — WhatsApp Cloud API, when the organization uses notices.</li>
        </ul>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">Security</h2>
        <p>
          Staff access is Google sign-in plus an allow-list. Organization registration is by
          approval. Public pages do not list other people’s records. Audit events are written on
          intake, enroll, claim, pharmacy dispense, and org approval.
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">End of pilot</h2>
        <p>
          On written request, or within 30 days of the pilot ending, we export the organization’s
          records and then delete them from the active database, except what a dispute or a legal
          duty requires us to keep.
        </p>
      </section>

      <p className="text-xs text-slate-400">
        This note is the processing term for the pilot. A signed agreement can replace it. Related:{' '}
        <Link href="/privacy" className="underline">Privacy</Link> ·{' '}
        <Link href="/terms" className="underline">Terms</Link>
      </p>
    </main>
  );
}
