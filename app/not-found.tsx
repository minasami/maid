import Link from 'next/link';
import { BrandMark } from './BrandMark';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <BrandMark size="md" showTitle={false} />
      <div className="space-y-2 max-w-sm">
        <p className="aid-section-label">404</p>
        <h1 className="aid-display text-3xl">Page not found</h1>
        <p className="text-sm text-slate-600">
          That link does not exist. Submit, check status, or open your profile.
        </p>
        <p className="text-sm text-slate-500" dir="rtl">
          الصفحة غير موجودة. يمكنك التقديم أو متابعة الحالة أو فتح الملف.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <Link href="/" className="aid-cta-primary px-5 py-2.5 text-sm">
          Home · الرئيسية
        </Link>
        <Link
          href="/intake"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Submit
        </Link>
        <Link
          href="/request-status"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Status
        </Link>
      </div>
    </main>
  );
}
