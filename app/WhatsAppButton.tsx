const WA_NUMBER = '201225597010';
const WA_TEXT = 'مرحباً، أحتاج مساعدة بخصوص دعم العلاج الشهري.';

export function WhatsAppButton() {
  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp · Medicine Support Hub"
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#1ebe5d] md:bottom-6 md:right-6"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
        <path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 0 0 20.5 3.5zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.2.7.7-3.1-.2-.3A9.1 9.1 0 1 1 12 20.5zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4.1 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
      </svg>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
