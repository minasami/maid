import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pilot offer',
  description: 'Paid pilot for one organization — 20,000 EGP per month.',
};

export default function PilotPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          One organization · one environment
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Paid pilot</h1>
        <p className="text-slate-600">
          Monthly chronic medicine support, operated on maid-beta.
        </p>
        <p className="text-sm text-slate-500" dir="rtl">
          تجربة مدفوعة لمنظمة واحدة — دعم العلاج الشهري
        </p>
      </header>

      <section className="aid-card p-5 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">Pilot fee</p>
        <p className="text-4xl font-semibold text-slate-900">20,000 EGP</p>
        <p className="text-sm text-slate-500">per organization · per month · billed monthly</p>
      </section>

      <section className="aid-card p-4 space-y-2 text-sm text-slate-700">
        <h2 className="font-semibold text-slate-900">Included</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Staff path: queue, claims, pharmacy, programs, refills, impact.</li>
          <li>Public path: submit a request, check status, employee profile.</li>
          <li>Google sign-in for staff. Organization registration by approval.</li>
          <li>Egyptian drug catalog and formulary routing (EVA / not EVA).</li>
          <li>WhatsApp notices, once Meta approves the account and templates.</li>
        </ul>
      </section>

      <section className="aid-card p-4 space-y-2 text-sm text-slate-700">
        <h2 className="font-semibold text-slate-900">Not included yet</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>WHO assessment and the AI coach — off until management turns them on.</li>
          <li>Self-serve signup. The first organization is onboarded by approval.</li>
          <li>A long-term contract. This is a 3-month pilot, then monthly.</li>
        </ul>
      </section>

      <section className="aid-card p-4 space-y-2 text-sm text-slate-700" id="onboarding">
        <h2 className="font-semibold text-slate-900">Onboarding, without us in the loop</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Organization registers at <Link href="/org/register?intent=pilot" className="underline">/org/register</Link>. The message is prefilled for the pilot.</li>
          <li>An allow-listed admin approves it.</li>
          <li>The org admin invites operators. They sign in with Google.</li>
          <li>Staff follow the numbered path on Home. People use Submit and Status only.</li>
          <li>Invoice is issued from <Link href="/invoice" className="underline">/invoice</Link>.</li>
        </ol>
      </section>

      <div className="flex flex-wrap gap-2 justify-center">
        <Link href="/org/register?intent=pilot" className="aid-cta-primary px-5 py-2.5 text-sm">
          Start the pilot
        </Link>
        <Link href="/invoice" className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold">
          Make an invoice
        </Link>
        <Link href="/demo" className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold">
          See the demo
        </Link>
      </div>

      <p className="text-center text-xs text-slate-400">
        <Link href="/terms" className="underline">Terms</Link>
        {' · '}
        <Link href="/privacy" className="underline">Privacy</Link>
        {' · '}
        <Link href="/dpa" className="underline">Data processing note</Link>
      </p>
    </main>
  );
}
