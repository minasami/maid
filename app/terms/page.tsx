import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'Terms for the Medical Aid pilot — monthly chronic medicine support.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-6 text-sm leading-relaxed text-slate-700">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Legal</p>
        <h1 className="text-2xl font-semibold text-slate-900">Terms of use</h1>
        <p className="text-xs text-slate-500">Effective 6 November 2026 · Pilot offer</p>
      </header>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">1. What this is</h2>
        <p>
          Medical Aid is a private platform for employer chronic-medicine programs. It handles
          requests, status, employee self-service, pharmacy routing, claims, refills, and an impact
          board. It is not a hospital, pharmacy, insurer, or medical device.
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">2. Who may use it</h2>
        <p>
          People submit a request or check status without an account. Staff of an approved
          organization sign in with Google. Organization registration is by approval. You may not
          use the platform for any purpose other than the program you were approved for.
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">3. Pilot fee</h2>
        <p>
          The current offer is a paid pilot: <strong>20,000 EGP per organization per month</strong>,
          billed monthly, for one organization. It includes staff access, intake, claims, pharmacy
          routing, programs, refills, and the impact board. WhatsApp notices are included once Meta
          has approved the account and templates. See the <Link href="/pilot" className="underline">pilot offer</Link>.
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">4. Data</h2>
        <p>
          The organization is the controller of employee and patient data it enters. Medical Aid
          processes that data only to run the program. See the <Link href="/privacy" className="underline">privacy notice</Link> and
          the <Link href="/dpa" className="underline">data processing note</Link>.
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">5. No medical advice</h2>
        <p>
          Outputs are operational. They are not a diagnosis, prescription, or clinical decision.
          A human reviews claims, invoices, and high-risk items before enrollment.
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">6. Availability</h2>
        <p>
          The pilot runs on maid-beta. It is provided as available. We will tell the organization
          before any planned stop. The pilot may end with 30 days’ notice from either side.
        </p>
      </section>

      <section className="aid-card space-y-2 p-4">
        <h2 className="font-semibold text-slate-900">7. Contact</h2>
        <p>
          Questions: the staff emails on file, or the organization contact used at registration.
        </p>
      </section>

      <p className="text-xs text-slate-400">
        These terms are a starter for the pilot. Have counsel review them before a long-term contract.
      </p>
    </main>
  );
}
