import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy notice',
  description: 'What Medical Aid stores, why, and who can see it.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-6 text-sm leading-relaxed text-slate-700">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Legal</p>
        <h1 className="text-2xl font-semibold text-slate-900">Privacy notice</h1>
        <p className="text-xs text-slate-500">Effective 6 November 2026</p>
      </header>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">What we store</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Request fields: employee, patient, medicines, phone, optional prescription links.</li>
          <li>Program, claim, pharmacy, and refill records for an approved organization.</li>
          <li>Staff sign-in: Google email, used only to open the staff path.</li>
          <li>Audit events on intake, enroll, claim, pharmacy dispense, and org approval.</li>
        </ul>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">Why</h2>
        <p>
          To run the monthly chronic-medicine program: receive a request, track it, route it to a
          pharmacy, and show the organization its own impact. We do not sell data and we do not use
          it for advertising.
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">Who can see it</h2>
        <p>
          Public pages show only what the person just submitted, or a status lookup by request id.
          Staff of an organization see that organization’s records. Super-admins listed in
          OPS_ALLOWED_EMAILS can approve organizations. Processors: Neon (database), Vercel
          (hosting), Google (staff sign-in), and Meta (WhatsApp, when used).
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">How long</h2>
        <p>
          Program records stay for the life of the organization’s program, then until the
          organization asks for deletion or the pilot ends. Audit events stay with the record.
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">Your requests</h2>
        <p>
          An employee asks their organization. The organization asks us. We export or delete that
          organization’s data on written request, except what we must keep for a dispute or a legal
          duty.
        </p>
      </section>

      <p className="text-xs text-slate-400">
        Related: <Link href="/terms" className="underline">Terms</Link> ·{' '}
        <Link href="/dpa" className="underline">Data processing note</Link>
      </p>
    </main>
  );
}
