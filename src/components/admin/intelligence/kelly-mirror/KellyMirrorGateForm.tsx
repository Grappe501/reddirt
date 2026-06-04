"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function KellyMirrorGateForm() {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/intelligence/kelly-mirror-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error === "not_configured" ? "Mirror not configured on server." : "Incorrect passphrase.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded-xl border border-kelly-text/10 bg-white p-6 text-sm">
      <p className="font-bold text-kelly-navy">Candidate-only passphrase</p>
      <p className="mt-2 text-xs text-kelly-muted">
        Separate from staff admin login. Set <code className="text-[10px]">KELLY_MIRROR_PASSPHRASE</code> in Netlify — share
        only with Kelly.
      </p>
      <input
        type="password"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        className="mt-4 min-h-11 w-full rounded-lg border border-kelly-text/20 px-3"
        autoComplete="off"
        placeholder="Passphrase"
      />
      {error ? <p className="mt-2 font-bold text-rose-900">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 min-h-11 w-full rounded-lg bg-kelly-navy font-bold text-white disabled:opacity-50"
      >
        {busy ? "Checking…" : "Unlock mirror"}
      </button>
    </form>
  );
}
