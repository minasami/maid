import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pilot invoice',
  description: 'Printable monthly invoice for the Medical Aid pilot.',
};

const FEE = 20000;

function clean(v: string | string[] | undefined, fallback: string) {
  const s = Array.isArray(v) ? v[0] : v;
  return (s || fallback).toString().slice(0, 80);
}

function issuedToday() {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Cairo',
  }).format(new Date());
}

export default function InvoicePage({
  searchParams,
}: {
  searchParams: {
    org?: string;
    month?: string;
    ref?: string;
    bank?: string;
    account?: string;
  };
}) {
  const org = clean(searchParams.org, 'Organization name');
  const month = clean(searchParams.month, 'November 2026');
  const ref = clean(searchParams.ref, 'MA-PILOT-001');
  const bank = clean(searchParams.bank, '');
  const account = clean(searchParams.account, '');
  const issued = issuedToday();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Invoice</p>
          <h1 className="text-2xl font-semibold text-slate-900">Medical Aid pilot</h1>
          <p className="text-xs text-slate-500">maid-beta · one organization</p>
        </div>
        <p className="text-right text-sm text-slate-600">
          <span className="block font-semibold text-slate-900">{ref}</span>
          Issued {issued}
        </p>
      </header>

      <section className="aid-card p-4 text-sm space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">From</p>
        <p className="font-semibold text-slate-900">Medicine Support Hub</p>
        <p className="text-slate-500">WhatsApp +20 12 25597010</p>
      </section>

      <section className="aid-card p-4 text-sm space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">Bill to</p>
        <p className="font-semibold text-slate-900">{org}</p>
        <p className="text-slate-500">Period: {month}</p>
      </section>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-3">
              Medical Aid pilot — one organization, one month
              <span className="block text-xs text-slate-500">
                Staff path, public intake and status, catalog, formulary routing
              </span>
            </td>
            <td className="py-3 text-right font-semibold">{FEE.toLocaleString('en-EG')} EGP</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="pt-3 font-semibold">Total due</td>
            <td className="pt-3 text-right text-lg font-semibold">{FEE.toLocaleString('en-EG')} EGP</td>
          </tr>
        </tfoot>
      </table>

      <section className="text-xs text-slate-500 space-y-1">
        <p>
          Payment: bank transfer
          {bank ? ` · ${bank}` : ''}
          {account ? ` · ${account}` : ''}. Send proof to the staff contact on file.
        </p>
        <p>
          This invoice follows the <Link href="/terms" className="underline">terms</Link> and the{' '}
          <Link href="/dpa" className="underline">data processing note</Link>.
        </p>
      </section>

      <form className="aid-card p-4 space-y-2 text-sm print:hidden" action="/invoice">
        <p className="font-semibold text-slate-900">Fill and print</p>
        <label className="block">
          <span className="text-xs text-slate-500">Organization</span>
          <input name="org" defaultValue={org === 'Organization name' ? '' : org} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Organization name" />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Month</span>
          <input name="month" defaultValue={month} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Reference</span>
          <input name="ref" defaultValue={ref} className="mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Bank</span>
          <input name="bank" defaultValue={bank} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Bank name" />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Account</span>
          <input name="account" defaultValue={account} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Account or IBAN" />
        </label>
        <button className="aid-cta-primary px-4 py-2 text-sm" type="submit">
          Update invoice
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 print:hidden">
        Use the browser print dialog to save a PDF.
      </p>
    </main>
  );
}
