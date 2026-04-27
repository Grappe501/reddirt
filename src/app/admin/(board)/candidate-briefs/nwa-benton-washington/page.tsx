import Link from "next/link";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { notFound } from "next/navigation";

const REL_PATH = "docs/briefs/KELLY_NWA_BENTON_WASHINGTON_CANDIDATE_BRIEF.md";

export default async function NwaBentonWashingtonBriefPage() {
  let content: string;
  try {
    const abs = path.join(process.cwd(), REL_PATH);
    content = await readFile(abs, "utf8");
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Candidate brief</p>
          <h1 className="font-heading text-2xl font-bold text-kelly-text">NWA — Benton & Washington</h1>
        </div>
        <Link
          href="/admin/candidate-briefs"
          className="text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline"
        >
          ← All candidate briefs
        </Link>
      </div>
      <p className="mb-3 font-mono text-[10px] text-kelly-text/50">
        Source: <code className="rounded bg-kelly-text/5 px-1">{REL_PATH}</code> · print target ≤3 pages · internal only
      </p>
      <div className="max-h-[min(75vh,700px)] overflow-y-auto rounded-xl border border-kelly-text/10 bg-kelly-page shadow-inner">
        <pre className="whitespace-pre-wrap break-words p-5 font-body text-[13px] leading-snug text-kelly-text/90">
          {content}
        </pre>
      </div>
    </div>
  );
}
