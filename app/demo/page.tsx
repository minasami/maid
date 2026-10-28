import Link from 'next/link';
import { DemoShare } from './DemoShare';

const STEPS = [
  {
    n: '1',
    title: 'Submit',
    ar: 'قدّم طلباً',
    body: 'An employee asks for monthly medicine support. No account. About 3–5 minutes. The form saves as they type.',
    href: '/intake',
    cta: 'Open submit',
  },
  {
    n: '2',
    title: 'Status',
    ar: 'تابع الحالة',
    body: 'They return with the request number. Names stay masked until they verify company, ID, and phone.',
    href: '/request-status',
    cta: 'Open status',
  },
  {
    n: '3',
    title: 'Profile',
    ar: 'الملف',
    body: 'With company, employee ID, and phone they see their file, renew for 2027, and answer whether this month’s support helped.',
    href: '/me',
    cta: 'Open profile',
  },
];

const STAFF = [
  { n: '1', title: 'Queue', ar: 'الطابور', body: 'New requests land here. Process matches, enrolls, and drafts a claim.' },
  { n: '2', title: 'Claims', ar: 'المطالبات', body: 'Review the draft, then submit the amounts.' },
  { n: '3', title: 'Pharmacy', ar: 'الصيدلية', body: 'Available at EVA or not. Download the CSV for each route.' },
  { n: '4', title: 'Programs', ar: 'البرامج', body: 'The chronic file: meds, care-line, and continuity.' },
  { n: '5', title: 'Refills', ar: 'الصرف', body: 'This month’s cycle. Approve, then dispense.' },
  { n: '6', title: 'Impact', ar: 'الأثر', body: 'Who was reached, what was delivered, and whether people said it helped.' },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen text-slate-900 pb-24 md:pb-10">
      <div className="mx-auto max-w-2xl px-4 pt-8 space-y-8">
        <header className="space-y-3 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-medium text-[#0f6e56] ring-1 ring-emerald-100/80 shadow-sm">
            Live demo · عرض حي
          </p>
          <h1 className="aid-display text-4xl sm:text-5xl">Medical Aid</h1>
          <p className="text-lg text-slate-700">Monthly medicine support, from the request to the board.</p>
          <p className="text-sm text-slate-500" dir="rtl">
            دعم العلاج الشهري — من الطلب إلى لوحة الأثر
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Link href="/intake" className="aid-cta-primary px-5 py-2.5 text-sm">
              Try a request
            </Link>
            <Link href="/guide" className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold">
              Full guide
            </Link>
            <Link href="/org/register" className="rounded-2xl border bg-white px-5 py-2.5 text-sm font-semibold">
              Register an organization
            </Link>
            <DemoShare />
          </div>
          <p className="text-xs text-slate-400">
            Live: maid-beta.vercel.app · No account for people. Staff sign in with Google.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/demo-poster.jpg"
            alt="Medical Aid path: Queue, Claims, Pharmacy, Programs, Refills, Impact"
            className="mx-auto w-full max-w-xl rounded-2xl border border-[#e4ddd2] shadow-sm"
          />
        </header>

        <section className="space-y-3">
          <h2 className="aid-display text-2xl">For people</h2>
          <p className="text-sm text-slate-500">Three public doors. Nothing else is visible without staff sign-in.</p>
          <ol className="space-y-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-2xl border border-white/90 bg-white/90 p-4 shadow-sm flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0f6e56] text-white font-bold">
                  {s.n}
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold">{s.title} <span className="text-slate-400 font-normal" dir="rtl">· {s.ar}</span></p>
                  <p className="text-sm text-slate-600">{s.body}</p>
                  <Link href={s.href} className="text-sm font-semibold text-[#0f6e56] hover:underline">
                    {s.cta} →
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="aid-display text-2xl">For staff</h2>
          <p className="text-sm text-slate-500">One numbered path. Counts show how much is waiting.</p>
          <ol className="grid gap-2 sm:grid-cols-2">
            {STAFF.map((s) => (
              <li key={s.n} className="rounded-2xl border border-white/90 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-bold text-[#0f6e56]">{s.n}</p>
                <p className="font-semibold">{s.title} <span className="text-slate-400 font-normal" dir="rtl">· {s.ar}</span></p>
                <p className="text-sm text-slate-600 mt-1">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-500">
            Staff open this with Google sign-in on the allowlist, or the process secret. Organizations see only their own people.
          </p>
          <Link href="/sign-in" className="inline-flex text-sm font-semibold text-[#0f6e56] hover:underline">
            Staff sign-in →
          </Link>
        </section>

        <section className="rounded-2xl border border-[#e4ddd2] bg-[#f4f1ea]/70 p-5 space-y-2">
          <h2 className="aid-display text-2xl">What the board shows</h2>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>People reached, and how long they stay on a program.</li>
            <li>This month’s delivery, against last month.</li>
            <li>How many said the support helped, with depth and daily life.</li>
            <li>Each organization, flagged when it needs a look.</li>
          </ul>
          <p className="text-sm text-slate-500" dir="rtl">
            الأرقام من البرامج والصرف. الصوت من المستفيدين أنفسهم.
          </p>
        </section>

        <section className="text-center space-y-2 pb-6">
          <p className="text-sm text-slate-600">Share this page. It is the demo.</p>
          <p className="text-xs text-slate-400">https://maid-beta.vercel.app/demo</p>
        </section>
      </div>
    </main>
  );
}
