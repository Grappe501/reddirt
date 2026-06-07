import Link from "next/link";

export function StrategyDoctrineJsonViewer({
  pathKey,
  raw,
  sourceFile,
}: {
  pathKey: string;
  raw: string;
  sourceFile: string;
}) {
  let formatted = raw;
  try {
    formatted = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    formatted = raw;
  }

  return (
    <article>
      <nav className="mb-6 text-xs text-kelly-muted">
        <Link href="/admin/intelligence/strategy-doctrine" className="font-semibold text-kelly-navy hover:underline">
          Strategy doctrine hub
        </Link>
        <span className="mx-1">/</span>
        <span>{pathKey}</span>
      </nav>

      <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11px] text-amber-950">
        SDI-1 read-only intake · source{" "}
        <code className="rounded bg-white/80 px-1">data/strategy-doctrine/{sourceFile}</code> · NEEDS_REVIEW until
        steward approval — not stage-safe without claims gate
      </p>

      <pre className="overflow-x-auto rounded-xl border border-kelly-text/10 bg-kelly-deep/97 p-4 text-[11px] leading-relaxed text-emerald-100">
        <code>{formatted}</code>
      </pre>
    </article>
  );
}
