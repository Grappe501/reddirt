"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

type Turn = { role: "user" | "assistant"; text: string };

function pathKeyFromPathname(pathname: string): string {
  const prefix = "/admin/campaign-strategy";
  if (!pathname.startsWith(prefix)) return "";
  return pathname.slice(prefix.length).replace(/^\/+/, "");
}

export function StrategyPartnerPanel() {
  const pathname = usePathname() ?? "";
  const routeKey = pathKeyFromPathname(pathname);

  const [entireManual, setEntireManual] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathKeyForRequest = entireManual ? undefined : routeKey;

  const send = useCallback(async () => {
    const message = input.trim();
    if (!message || loading) return;

    setLoading(true);
    setError(null);
    setInput("");

    const nextHistory: Turn[] = [...history, { role: "user", text: message }];

    try {
      const res = await fetch("/api/admin/campaign-strategy/strategy-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: history.map((t) => ({ role: t.role, text: t.text })),
          ...(pathKeyForRequest !== undefined ? { pathKey: pathKeyForRequest } : {}),
        }),
      });
      const data = unknownJson(await res.json().catch(() => ({})));
      if (!res.ok) {
        const msg =
          typeof data.message === "string"
            ? data.message
            : typeof data.error === "string"
              ? data.error
              : `Request failed (${res.status})`;
        throw new Error(msg);
      }
      const reply = typeof data.reply === "string" ? data.reply : "";
      if (!reply) throw new Error("Empty reply from strategy partner.");
      setHistory([...nextHistory, { role: "assistant", text: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setInput(message);
    } finally {
      setLoading(false);
    }
  }, [history, input, loading, pathKeyForRequest]);

  const scopeLabel =
    pathKeyForRequest === undefined
      ? "Entire manual"
      : pathKeyForRequest === ""
        ? "This page · overview"
        : `This page · ${pathKeyForRequest}`;

  return (
    <section
      aria-label="Strategy partner chat"
      className="mb-6 rounded-xl border border-kelly-gold/25 bg-white/90 px-4 py-4 shadow-sm print:hidden md:px-5 md:py-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-deep/75">
            Strategy partner
          </p>
          <p className="mt-1 font-body text-[13px] text-kelly-text/85">
            Ask against both the Kelly SOS strategic plan and the full{" "}
            <code className="rounded bg-kelly-fog px-1 text-[11px]">campaign-system-manual/</code> tree (same H2/H3
            chunk boundaries as{" "}
            <code className="rounded bg-kelly-fog px-1 text-[11px]">/api/admin/campaign-strategy/chunks</code>).
            Replies cite chunk ids; strategic-plan chunks open in the reader, campaign-system chunks show a repo path.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 font-body text-[12px] text-kelly-text/80">
          <input
            type="checkbox"
            checked={entireManual}
            onChange={(e) => setEntireManual(e.target.checked)}
            className="h-4 w-4 rounded border-kelly-text/30 text-kelly-blue focus:ring-kelly-blue"
          />
          Search entire manual
        </label>
      </div>

      <p className="mt-2 font-body text-[11px] text-kelly-text/60">
        Retrieval bias: <span className="font-medium text-kelly-text/75">{scopeLabel}</span>
      </p>

      <div
        className="mt-3 max-h-52 overflow-y-auto rounded-lg border border-kelly-text/10 bg-kelly-fog/30 px-3 py-2 font-body text-[13px] leading-snug text-kelly-navy"
        aria-live="polite"
      >
        {history.length === 0 ? (
          <p className="text-kelly-text/50">No messages yet.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((t, i) => (
              <li key={`${i}-${t.role}`}>
                <span className="font-semibold text-kelly-deep/90">
                  {t.role === "user" ? "You" : "Partner"}:{" "}
                </span>
                <span className="whitespace-pre-wrap">{t.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <p className="mt-2 font-body text-[12px] font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={3}
          maxLength={4000}
          placeholder="Ask about programs, cadence, LANE framing, GOTV…"
          className="min-h-[5rem] w-full resize-y rounded-lg border border-kelly-text/15 px-3 py-2 font-body text-[13px] text-kelly-navy placeholder:text-kelly-text/40 focus:border-kelly-blue focus:outline-none focus:ring-1 focus:ring-kelly-blue"
          disabled={loading}
          aria-label="Message to strategy partner"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={loading || !input.trim()}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-kelly-deep px-5 font-body text-[13px] font-semibold text-white hover:bg-kelly-navy disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Thinking…" : "Send"}
        </button>
      </div>
    </section>
  );
}

function unknownJson(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}
