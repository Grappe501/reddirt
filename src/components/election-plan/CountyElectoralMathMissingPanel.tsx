import Link from "next/link";

type Props = {
  countySlug: string;
  countyName: string;
  kind: "drop-off" | "registration-dashboard";
};

const META = {
  "drop-off": {
    title: "Chapter 4 · Democratic drop-off",
    bundleKey: "dropOffBySlug",
    sourceDir: "chapter-04-democratic-drop-off/counties",
  },
  "registration-dashboard": {
    title: "Chapter 5 · Registration dashboard",
    bundleKey: "registrationBySlug",
    sourceDir: "chapter-05-fifty-thousand-new-voter-plan/counties",
  },
} as const;

export function CountyElectoralMathMissingPanel({ countySlug, countyName, kind }: Props) {
  const meta = META[kind];

  return (
    <section>
      <Link
        href={`/election-plan/counties/${countySlug}`}
        className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
      >
        ← {countyName} County playbook
      </Link>
      <div className="ep-card mt-4 border-2 border-dashed border-amber-400/60 bg-amber-50/40 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-800">{meta.title} · not loaded</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">{countyName} County</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          Electoral math prose for this county should ship in{" "}
          <code className="text-xs">data/election-plan/county-electoral-math-markdown.json</code> (
          <code className="text-xs">{meta.bundleKey}</code>). Built during{" "}
          <code className="text-xs">npm run election-plan:build</code>.
        </p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Source markdown:{" "}
          <code className="text-[10px]">docs/strategic-plan/.../part-ii-electoral-math/{meta.sourceDir}/</code>
        </p>
        <p className="mt-4 text-sm font-semibold text-[var(--ep-navy)]">
          Operator: run <code className="text-xs">npm run election-plan:build</code> from RedDirt, commit the bundle, and
          redeploy.
        </p>
      </div>
    </section>
  );
}
