import Link from "next/link";

export function PublicFieldPlaybookMarkdownReadError({
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
        The playbook file <code className="rounded bg-white px-1.5 py-0.5 text-xs">{sourceFile}</code> could not be read. Try
        again in a moment or start from the field playbook home.
      </p>
      <p className="mt-2 font-mono text-xs text-kelly-slate/90">{message}</p>
      <div className="mt-5 flex flex-wrap gap-3 font-body text-sm">
        <Link
          href="/field-playbook"
          className="rounded-lg bg-kelly-deep px-4 py-2 font-semibold text-white hover:bg-kelly-deep/90"
        >
          Field playbook home
        </Link>
        {pathKey ? (
          <Link href={`/field-playbook/${pathKey}`} className="rounded-lg border border-kelly-text/20 px-4 py-2 font-semibold hover:bg-white">
            Retry
          </Link>
        ) : null}
      </div>
    </div>
  );
}
