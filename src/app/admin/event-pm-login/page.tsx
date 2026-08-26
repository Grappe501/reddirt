"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function EventPmLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const next = "/admin/events";
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const result = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (result.error) setError(result.error.message);
    } catch {
      setError("Campaign authentication is not configured for this environment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-6 py-16">
      <div className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/50">RedDirt Campaign Operations</p>
        <h1 className="mt-2 text-3xl font-semibold">Sign in to continue</h1>
        <p className="mt-3 text-black/65">Event Project Manager access requires an active campaign membership.</p>
        <button
          type="button"
          onClick={signIn}
          disabled={busy}
          className="mt-7 w-full rounded-lg bg-black px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Opening Google…" : "Continue with Google"}
        </button>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>
    </main>
  );
}
