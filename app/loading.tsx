import { BrandMark } from './BrandMark';

export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="animate-pulse">
        <BrandMark size="md" showTitle={false} />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="aid-display text-xl">Medical Aid</p>
        <p className="text-sm text-slate-600">Loading…</p>
        <p className="text-xs text-slate-500" dir="rtl">جاري التحميل…</p>
        <div className="mt-3 h-1.5 w-36 overflow-hidden rounded-full bg-[#e4ddd2]">
          <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-[#0f6e56]" />
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
