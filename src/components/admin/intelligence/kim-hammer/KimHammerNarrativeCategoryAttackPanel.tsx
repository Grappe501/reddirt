import Link from "next/link";
import type { BillCategoryAttackGuide } from "@/lib/opposition/kimHammerNarrativeTestingByCategory";

type KimHammerNarrativeCategoryAttackPanelProps = {
  categories: BillCategoryAttackGuide[];
};

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-kelly-navy">{title}</h4>
      <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs text-kelly-muted">
        {items.map((item) => (
          <li key={item.slice(0, 64)}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function KimHammerNarrativeCategoryAttackPanel({
  categories,
}: KimHammerNarrativeCategoryAttackPanelProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
        <p className="text-xs text-amber-950">
          <strong>Internal narrative testing only.</strong> Sample messages and attack playbooks are{" "}
          <strong>INTERPRETATION</strong> until enrolled-act verification. Cite Arkleg bill/act numbers
          before external use. Never deploy NEEDS_REVIEW categories on stage.
        </p>
      </div>

      <div className="grid gap-5">
        {categories.map((cat) => (
          <article
            key={cat.categoryId}
            id={cat.categoryId}
            className="rounded-xl border border-kelly-text/10 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-kelly-navy">{cat.label}</h2>
                <p className="mt-1 max-w-3xl text-xs text-kelly-muted">{cat.summary}</p>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                  cat.evidenceStatus === "NEEDS_REVIEW"
                    ? "bg-red-100 text-red-900"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {cat.evidenceStatus.replaceAll("_", " ")}
              </span>
            </div>

            {cat.billNumbers.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cat.billNumbers.map((bill) => (
                  <Link
                    key={bill}
                    href={`/admin/intelligence/kim-hammer/bills/${bill}`}
                    className="rounded-full border border-kelly-navy/20 bg-kelly-navy/5 px-2.5 py-0.5 text-[11px] font-semibold text-kelly-navy hover:bg-kelly-navy/10"
                  >
                    {bill}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                  Potential narrative messages
                </h3>
                <ul className="mt-2 space-y-2">
                  {cat.potentialMessages.map((msg) => (
                    <li
                      key={msg.slice(0, 48)}
                      className="rounded border border-emerald-100 bg-white px-3 py-2 text-xs italic text-kelly-text"
                    >
                      &ldquo;{msg}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-kelly-navy/10 bg-kelly-navy/[0.03] p-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-navy">
                  How to attack this bill set
                </h3>
                <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs text-kelly-muted">
                  {cat.howToAttack.map((step) => (
                    <li key={step.slice(0, 64)}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ListBlock title="Debate setup questions" items={cat.debateSetupQuestions} />
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-kelly-navy">
                  Rebuttal drill
                </h4>
                <p className="mt-1.5 text-xs text-kelly-muted">
                  <strong className="text-kelly-text">Hammer likely:</strong> {cat.hammerLikelyRebuttal}
                </p>
                <p className="mt-2 text-xs text-kelly-muted">
                  <strong className="text-emerald-800">Kelly pivot:</strong> {cat.kellyCounterPivot}
                </p>
              </div>
              <ListBlock title="Risks to avoid" items={cat.risksToAvoid} />
            </div>

            {cat.patternLaneId ? (
              <p className="mt-3 text-[10px] text-kelly-subtle">
                Pattern lane:{" "}
                <Link
                  href="/admin/intelligence/kim-hammer/pattern-analysis"
                  className="font-semibold text-kelly-navy hover:underline"
                >
                  {cat.patternLaneId}
                </Link>
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
