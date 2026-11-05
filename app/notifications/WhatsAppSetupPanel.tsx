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
        <div className="space-y-2 text-sm text-slate-700">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
            Nothing to send with yet. Dry-run is on. Paste one set of keys here in chat and I will set them on Vercel and redeploy. I will not invent keys.
          </p>
          <ol className="space-y-2">
            <li className="rounded-xl bg-slate-50 px-3 py-2">
              <strong>Meta Cloud API</strong>
              {' — '}
              <a className="underline" href="https://developers.facebook.com/" target="_blank" rel="noreferrer">
                Meta for Developers
              </a>
              <div className="mt-1 font-mono text-xs text-slate-600">
                WHATSAPP_PROVIDER=meta
                <br />
                WHATSAPP_TOKEN=…
                <br />
                WHATSAPP_PHONE_NUMBER_ID=…
              </div>
            </li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">
              <strong>Twilio</strong>
              {' — '}
              <a className="underline" href="https://console.twilio.com/" target="_blank" rel="noreferrer">
                Twilio console
              </a>
              <div className="mt-1 font-mono text-xs text-slate-600">
                WHATSAPP_PROVIDER=twilio
                <br />
                TWILIO_ACCOUNT_SID=AC…
                <br />
                TWILIO_AUTH_TOKEN=…
                <br />
                TWILIO_WHATSAPP_FROM=whatsapp:+…
              </div>
            </li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">
              <strong>Webhook</strong> — any endpoint that accepts JSON <code>{'{ to, body }'}</code>
              <div className="mt-1 font-mono text-xs text-slate-600">WHATSAPP_WEBHOOK_URL=https://…</div>
            </li>
          </ol>
        </div>
      )}
      <p className="text-xs text-slate-400">
        After saving env vars, redeploy. Full steps in <code>docs/whatsapp-setup.md</code>.
      </p>
    </section>
  );
}
