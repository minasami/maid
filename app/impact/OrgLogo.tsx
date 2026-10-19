'use client';

import { useState } from 'react';

function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 160;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not draw logo'));
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => reject(new Error('Could not read image'));
    img.src = url;
  });
}

export function OrgLogo({
  code,
  name,
  logoUrl,
}: {
  code?: string;
  name: string;
  logoUrl?: string | null;
}) {
  const [url, setUrl] = useState(logoUrl || '');
  const [current, setCurrent] = useState(logoUrl || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState(code || '');

  async function save(next: string | null) {
    const target = code || codeInput;
    if (!target) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/orgs/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: target, logo_url: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not save logo');
      setCurrent(next || '');
      setMsg(next ? 'Logo saved' : 'Logo removed');
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#e4ddd2] bg-white">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt={`${name} logo`} className="h-full w-full object-contain" />
        ) : (
          <span className="text-lg font-bold text-[#0f6e56]">{(name || 'O').slice(0, 1)}</span>
        )}
      </div>
      <div className="space-y-1">
          {!code && (
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="Company code"
              className="rounded-lg border border-[#e4ddd2] px-2 py-1 text-xs uppercase"
            />
          )}
          <p className="text-xs font-semibold text-slate-600">Company logo · شعار الشركة</p>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-lg border border-[#e4ddd2] bg-white px-3 py-1.5 text-xs font-medium">
              Upload
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const data = await shrink(file);
                    setUrl(data);
                    await save(data);
                  } catch (err: unknown) {
                    setMsg(err instanceof Error ? err.message : 'Error');
                  }
                }}
              />
            </label>
            <input
              value={url.startsWith('data:') ? '' : url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="or paste image URL"
              className="rounded-lg border border-[#e4ddd2] px-2 py-1 text-xs"
            />
            <button type="button" disabled={busy || !url} onClick={() => save(url)} className="text-xs font-semibold text-[#0f6e56]">
              Save URL
            </button>
            {current && (
              <button type="button" disabled={busy} onClick={() => save(null)} className="text-xs text-slate-500">
                Remove
              </button>
            )}
          </div>
          {msg && <p className="text-[11px] text-slate-500">{msg}</p>}
        </div>
    </div>
  );
}
