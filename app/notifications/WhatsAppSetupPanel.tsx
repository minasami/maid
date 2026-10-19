export function WhatsAppSetupPanel({
  mode,
  hasMeta,
  hasTwilio,
  hasWebhook,
}: {
  mode: string;
  hasMeta: boolean;
  hasTwilio: boolean;
  hasWebhook: boolean;
}) {
  const ready = mode !== 'none';
  return (
    <section className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm space-y-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="aid-section-label">WhatsApp · واتساب</p>
          <h2 className="aid-display text-xl">
            {ready ? 'Channel ready' : 'Connect a provider'}
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            ready ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
          }`}
        >
          {ready ? mode : 'not connected'}
        </span>
      </div>
      <p className="text-sm text-slate-600">
        Intake confirmations, refill reminders, and the 2027 renewal campaign all go through this channel.
        Dry-run is on until a provider is set.
      </p>
      <p className="text-sm text-slate-500" dir="rtl">
        تأكيد الاستلام وتذكير الصرف وحملة ٢٠٢٧ تمر من هنا. الوضع التجريبي مفعّل حتى تربط مزوداً.
      </p>
      {!ready && (
        <ol className="space-y-2 text-sm text-slate-700">
          <li className="rounded-xl bg-slate-50 px-3 py-2">
            <strong>Meta Cloud API</strong> — set <code>WHATSAPP_PROVIDER=meta</code>,{' '}
            <code>WHATSAPP_TOKEN</code>, <code>WHATSAPP_PHONE_NUMBER_ID</code>
            {hasMeta ? ' · keys present' : ''}
          </li>
          <li className="rounded-xl bg-slate-50 px-3 py-2">
            <strong>Twilio</strong> — set <code>WHATSAPP_PROVIDER=twilio</code>,{' '}
            <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>,{' '}
            <code>TWILIO_WHATSAPP_FROM</code>
            {hasTwilio ? ' · keys present' : ''}
          </li>
          <li className="rounded-xl bg-slate-50 px-3 py-2">
            <strong>Webhook</strong> — <code>WHATSAPP_WEBHOOK_URL</code> receives JSON{' '}
            <code>{'{ to, body }'}</code>
            {hasWebhook ? ' · set' : ''}
          </li>
        </ol>
      )}
      <p className="text-xs text-slate-400">
        After saving env vars, redeploy. Full steps in <code>docs/whatsapp-setup.md</code>.
      </p>
    </section>
  );
}
