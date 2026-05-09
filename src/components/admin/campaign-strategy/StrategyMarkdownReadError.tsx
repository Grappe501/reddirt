import Link from "next/link";

export function StrategyMarkdownReadError({
  pathKey,
  sourceFile,
  message,
}: {
  pathKey: string;
  sourceFile: string;
  message: string;
}) {
  return (
    <div
      role="alert"
      className="max-w-[40rem] rounded-xl border border-amber-200/80 bg-amber-50/90 px-5 py-6 text-kelly-deep shadow-sm"
    >
      <h2 className="font-heading text-lg font-bold text-kelly-deep">Could not load this chapter</h2>
      <p className="mt-2 font-body text-sm leading-relaxed text-kelly-slate">
        The manual file <code className="rounded bg-white px-1.5 py-0.5 text-xs">{sourceFile}</code> could not be
        read from disk. This is usually temporary during deploy or a missing file in the server image.
      </p>
      <p className="mt-2 font-mono text-xs text-kelly-slate/90">{message}</p>
      <div className="mt-5 flex flex-wrap gap-3 font-body text-sm">
        <Link
          href="/admin/campaign-strategy"
          className="rounded-lg bg-kelly-deep px-4 py-2 font-semibold text-white hover:bg-kelly-deep/90"
        >
          Back to strategy home
        </Link>
        {pathKey ? (
          <Link href={`/admin/campaign-strategy/${pathKey}`} className="rounded-lg border border-kelly-text/20 px-4 py-2 font-semibold hover:bg-white">
            Retry
          </Link>
        ) : null}
      </div>
    </div>
  );
}
