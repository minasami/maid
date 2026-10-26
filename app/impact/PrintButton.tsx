'use client';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-sm font-semibold text-[#0f6e56] hover:underline"
    >
      Print report
    </button>
  );
}
