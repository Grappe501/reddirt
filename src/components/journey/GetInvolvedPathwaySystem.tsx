import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { GetInvolvedPathwayDefinition } from "@/content/journey/get-involved-pathways";

type Props = {
  pathways: GetInvolvedPathwayDefinition[];
};

/**
 * Pass 3 — pathway cards for Get Involved (static copy + links to existing forms/pages).
 */
export function GetInvolvedPathwaySystem({ pathways }: Props) {
  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {pathways.map((p) => (
        <article
          key={p.id}
          className="flex flex-col rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]"
        >
          <h3 className="font-heading text-lg font-bold text-kelly-navy">{p.title}</h3>
          <dl className="mt-4 space-y-3 font-body text-sm leading-relaxed text-kelly-text/85">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/50">What you do</dt>
              <dd className="mt-1">{p.whatYouDo}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/50">Why it matters</dt>
              <dd className="mt-1">{p.whyItMatters}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/50">Time required</dt>
              <dd className="mt-1">{p.timeRequired}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-col gap-2 border-t border-kelly-text/10 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/50">Next action</p>
            <Button href={p.primaryAction.href} variant="primary" className="w-full justify-center sm:w-auto">
              {p.primaryAction.label}
            </Button>
            {p.secondaryAction ? (
              <Button href={p.secondaryAction.href} variant="outline" className="w-full justify-center sm:w-auto">
                {p.secondaryAction.label}
              </Button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function GetInvolvedIntakeTransparencyNote() {
  return (
    <p className="mx-auto mt-10 max-w-3xl text-center font-body text-xs leading-relaxed text-kelly-text/60">
      Forms on this site create a queue row for staff (
      <code className="rounded bg-kelly-text/5 px-1">WorkflowIntake</code>
      ) linked to your submission—no bots, no auto public posts. See{" "}
      <Link className="font-semibold text-kelly-navy underline" href="/privacy">
        privacy
      </Link>{" "}
      and{" "}
      <Link className="font-semibold text-kelly-navy underline" href="/terms">
        terms
      </Link>
      .
    </p>
  );
}
