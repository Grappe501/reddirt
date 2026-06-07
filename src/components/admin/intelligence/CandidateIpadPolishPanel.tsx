import Link from "next/link";
import type { IpadBottomNavTab } from "@/lib/intelligence/v4/phase15P7IpadPolish";
import type { CandidateCommandNavSection } from "@/lib/intelligence/v4/candidateCommandNav";

export function CandidateIpadPolishPanel({
  tabs,
  sections,
}: {
  tabs: IpadBottomNavTab[];
  sections: CandidateCommandNavSection[];
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-5">
        {tabs.map((tab) => (
          <article key={tab.sectionId} className="rounded-xl border border-sky-100 bg-white p-3 text-center text-xs">
            <p className="font-bold text-kelly-navy">{tab.shortLabel}</p>
            <p className="mt-1 text-[10px] text-kelly-muted">{tab.linkCount} links</p>
          </article>
        ))}
      </section>

      {sections.map((sec) => {
        const tab = tabs.find((t) => t.sectionId === sec.id);
        return (
          <section key={sec.id}>
            <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">
              {sec.label} · {tab?.shortLabel}
            </h2>
            <p className="mb-3 text-sm text-kelly-muted">{sec.summary}</p>
            <div className="space-y-2">
              {sec.links.map((link) => (
                <article key={link.href} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
                  <Link href={link.href} className="font-bold text-kelly-navy underline">
                    {link.label}
                  </Link>
                  {link.description ? <p className="mt-1 text-xs text-kelly-muted">{link.description}</p> : null}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
