type Props = {
  countyName: string;
  playbookPath?: string;
};

/** Shown when bundled playbook markdown is missing — usually means election-plan:build was not run before deploy. */
export function CountyPlaybookMissingPanel({ countyName, playbookPath }: Props) {
  return (
    <section id="playbook" className="mb-8 scroll-mt-24">
      <div className="ep-card border-2 border-dashed border-amber-400/60 bg-amber-50/40">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-800">County playbook · not loaded</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{countyName} County playbook</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          Chapter 9 strategy prose (missions, electoral math, field targets) should appear here. On production this
          content ships in{" "}
          <code className="text-xs">data/election-plan/county-playbook-markdown.json</code> — built by{" "}
          <code className="text-xs">npm run election-plan:build</code> during Netlify deploy.
        </p>
        {playbookPath ? (
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
            Source file: <code className="text-[10px]">{playbookPath}</code>
          </p>
        ) : null}
        <p className="mt-4 text-sm font-semibold text-[var(--ep-navy)]">
          Operator: run <code className="text-xs">npm run election-plan:build</code> locally, commit the bundle JSON,
          and redeploy.
        </p>
      </div>
    </section>
  );
}
