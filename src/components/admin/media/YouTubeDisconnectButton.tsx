"use client";

import { useState } from "react";

export function YouTubeDisconnectButton() {
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!window.confirm("Disconnect YouTube OAuth tokens from this server?")) return;
    setBusy(true);
    try {
      await fetch("/api/admin/youtube/oauth/disconnect", { method: "POST" });
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void run()}
      className="rounded-md border border-red-700/30 px-4 py-2 font-body text-sm font-semibold text-red-800 disabled:opacity-60"
    >
      {busy ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}
