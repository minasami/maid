'use client';

const FAQS = [
  {
    q: 'Do I need an account?',
    a: 'No. Submit a request and keep the Request ID. To open your employee profile, use company + employee ID + phone.',
    ar: 'لا تحتاج حساباً. قدّم الطلب واحفظ رقم الطلب. الملف يفتح بالشركة والرقم الوظيفي والهاتف.',
  },
  {
    q: 'How do I renew for 2027?',
    a: 'Open My profile with your company, ID, and phone. Review the 2026 regimen and tap Renew — the form pre-fills. Target date is 10 December 2026.',
    ar: 'افتح ملفي بالشركة والرقم والهاتف، ثم جدّد. النموذج يُملأ تلقائياً. الموعد ١٠ ديسمبر ٢٠٢٦.',
  },
  {
    q: 'Why are names hidden on status?',
    a: 'Anyone with a Request ID sees masked names. Add the matching phone or employee ID to unlock the full view.',
    ar: 'أي شخص برقم الطلب يرى أسماء جزئية. أضف الهاتف أو الرقم الوظيفي لإظهار الأسماء الكاملة.',
  },
  {
    q: 'Who can see my data?',
    a: 'Only your organization staff after they sign in. Other organizations cannot see your requests.',
    ar: 'فريق مؤسستك فقط بعد تسجيل الدخول. المؤسسات الأخرى لا ترى طلباتك.',
  },
] as const;

export function HomeFaq() {
  return (
    <section className="space-y-2" aria-label="Common questions">
      <h2 className="aid-section-label text-center">Common questions · أسئلة شائعة</h2>
      <div className="space-y-2">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="rounded-2xl border border-white/90 bg-white/85 backdrop-blur group shadow-sm"
          >
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-800 flex items-center justify-between gap-3">
              <span>{item.q}</span>
              <span className="text-slate-400 group-open:rotate-45 transition text-lg leading-none" aria-hidden>
                +
              </span>
            </summary>
            <div className="px-4 pb-3 space-y-2">
              <p className="text-sm text-slate-600">{item.a}</p>
              <p className="text-sm text-slate-500" dir="rtl">
                {item.ar}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
