"use client";

import { useCallback, useState } from "react";

type Snippet = { id: string; label: string; text: string; note?: string };

const SNIPPETS: Snippet[] = [
  {
    id: "diagnose",
    label: "Safe DB diagnose",
    text: "npm run email:db:diagnose",
    note: "From RedDirt/. Prints presence + host hints — no secret values.",
  },
  {
    id: "preflight",
    label: "Command Center preflight",
    text: "npm run email:command-center:preflight",
    note: "DNS + migration set checks. Still from RedDirt/.",
  },
  {
    id: "gate",
    label: "Contact import gate chain",
    text: "npm run email:contact-import:gate",
    note: "Runs prisma migrate deploy then preflight then npm run check — operator-only on the correct DATABASE_URL.",
  },
];

const PS_SESSION_BLOCK = `# PowerShell (session only — paste values from Supabase Connect in your private editor)
cd <path-to-clone>\\RedDirt
$env:DATABASE_URL = "<paste URI from Supabase — Session or Direct per deployment.md>"
$env:DIRECT_URL    = "<often direct or session URI; must match prisma schema directUrl needs>"
npm run email:db:diagnose
npm run email:command-center:preflight
# npm run email:contact-import:gate   # optional: applies migrations + full check — run only when targeting the right DB
`;

function CopyRow({ snippet }: { snippet: Snippet }) {
  const [done, setDone] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet.text);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  }, [snippet.text]);

  return (
    <div className="rounded border border-kelly-text/10 bg-white/90 px-2 py-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-heading text-[10px] font-bold text-kelly-navy">{snippet.label}</span>
        <button
          type="button"
          onClick={onCopy}
          className="rounded border border-kelly-forest/40 bg-kelly-fog/70 px-2 py-0.5 font-body text-[9px] font-bold uppercase text-kelly-forest hover:bg-kelly-fog"
        >
          {done ? "Copied" : "Copy command"}
        </button>
      </div>
      <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[9px] text-kelly-text/90">{snippet.text}</pre>
      {snippet.note ? <p className="mt-1 font-body text-[9px] text-kelly-muted">{snippet.note}</p> : null}
    </div>
  );
}

export function HostedDbCopySnippets() {
  const [done, setDone] = useState(false);
  const copyPs = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PS_SESSION_BLOCK);
      setDone(true);
      window.setTimeout(() => setDone(false), 2200);
    } catch {
      setDone(false);
    }
  }, []);

  return (
    <div className="space-y-2">
      <p className="font-heading text-[10px] font-bold uppercase text-kelly-muted">One-click copy (no secrets)</p>
      <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-3">
        {SNIPPETS.map((s) => (
          <CopyRow key={s.id} snippet={s} />
        ))}
      </div>
      <div className="rounded border border-violet-200/70 bg-violet-50/50 px-2 py-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-heading text-[10px] font-bold text-violet-950">PowerShell session template</span>
          <button
            type="button"
            onClick={copyPs}
            className="rounded border border-violet-400/50 bg-white px-2 py-0.5 font-body text-[9px] font-bold uppercase text-violet-900 hover:bg-violet-100/80"
          >
            {done ? "Copied" : "Copy template"}
          </button>
        </div>
        <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-[9px] text-violet-950/90">{PS_SESSION_BLOCK}</pre>
        <p className="mt-1 font-body text-[9px] text-violet-900/80">
          Replace placeholders in a private editor — never commit <code className="text-[9px]">.env</code> with production strings.
        </p>
      </div>
    </div>
  );
}
