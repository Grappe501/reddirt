import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { loadKimHammerCountyAdministrationBurden } from "@/lib/opposition/kimHammerLegislativeNarratives";
import { KIM_HAMMER_COMMAND_CENTER_HREF } from "@/lib/opposition/kimHammerBriefingRegistry";
import Link from "next/link";

export default async function KimHammerCountyAdministrationBurdenPage() {
  const layer = loadKimHammerCountyAdministrationBurden();

  return (
    <KimHammerBriefingPageShell moduleId="county-administration-burden">
      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Doctrine</h2>
        {layer.doctrineLabel ? (
          <p className="mt-1 text-[10px] font-bold uppercase text-kelly-subtle">{layer.doctrineLabel}</p>
        ) : null}
        {layer.plainEnglishSummary ? (
          <p className="mt-2 text-kelly-muted">{layer.plainEnglishSummary}</p>
        ) : (
          <p className="mt-2 text-kelly-muted">
            County modernization contrast: SOS supports clerks and election commissioners with training and resources—not
            unfunded mandates from the Capitol.
          </p>
        )}
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        {layer.actors.map((actor) => (
          <article key={actor.role} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h3 className="font-semibold text-kelly-navy">{actor.name ?? actor.role}</h3>
            <p className="mt-2 text-kelly-muted">
              {actor.statutoryRelationship ?? actor.authorityScope ?? actor.role}
            </p>
            {actor.evidenceStatus ? (
              <p className="mt-2 text-[10px] uppercase text-kelly-subtle">{actor.evidenceStatus}</p>
            ) : null}
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Burden themes</h2>
        {layer.burdenThemes.map((theme) => {
          const linkedBills = theme.linkedBills ?? theme.linkedBillNumbers ?? [];
          const themeKey = theme.themeId ?? theme.id ?? theme.label ?? linkedBills.join("-");
          return (
            <article key={themeKey} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
              <p className="font-semibold text-kelly-navy">
                {(theme.themeId ?? theme.label ?? "theme").replaceAll("-", " ")}
              </p>
              <p className="mt-1 text-kelly-muted">{theme.plainEnglish ?? theme.description}</p>
              <p className="mt-2 text-kelly-muted"><strong>Kelly contrast:</strong> {theme.kellyContrastFrame}</p>
              <p className="mt-1 text-kelly-muted"><strong>Debate use:</strong> {theme.debateUse}</p>
              <p className="mt-2 flex flex-wrap gap-2">
                {linkedBills.map((bill) => (
                  <Link
                    key={bill}
                    href={`${KIM_HAMMER_COMMAND_CENTER_HREF}/bills/${encodeURIComponent(bill)}`}
                    className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800"
                  >
                    {bill}
                  </Link>
                ))}
              </p>
            </article>
          );
        })}
      </section>
    </KimHammerBriefingPageShell>
  );
}
