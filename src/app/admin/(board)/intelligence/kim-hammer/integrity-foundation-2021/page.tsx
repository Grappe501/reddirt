import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { loadKimHammerIntegrityFoundation2021 } from "@/lib/opposition/kimHammerLegislativeNarratives";
import { KIM_HAMMER_COMMAND_CENTER_HREF } from "@/lib/opposition/kimHammerBriefingRegistry";
import Link from "next/link";

export default async function KimHammerIntegrityFoundation2021Page() {
  const pkg = loadKimHammerIntegrityFoundation2021();

  return (
    <KimHammerBriefingPageShell moduleId="integrity-foundation-2021">
      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Session</p>
          <p className="mt-1 text-xl font-bold">{pkg.sessionYear}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Bills in package</p>
          <p className="mt-1 text-xl font-bold">{pkg.billNumbers.length}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Enrolled acts</p>
          <p className="mt-1 text-xl font-bold">{pkg.actNumbers.length}</p>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Package bills</h2>
        <ul className="mt-2 space-y-2 text-kelly-muted">
          {pkg.billNumbers.map((billNumber, index) => (
            <li key={billNumber}>
              <Link
                href={`${KIM_HAMMER_COMMAND_CENTER_HREF}/bills/${encodeURIComponent(billNumber)}`}
                className="font-semibold text-kelly-navy underline"
              >
                {billNumber}
              </Link>
              {pkg.actNumbers[index] != null ? ` → Act ${pkg.actNumbers[index]}` : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Evolution link</h2>
        <p className="mt-2 text-kelly-muted">
          Precedes: {pkg.evolutionLink.precedes.length ? pkg.evolutionLink.precedes.join(", ") : "none (foundation layer)"}
        </p>
        <p className="mt-1 text-kelly-muted">Followed by: {pkg.evolutionLink.followedBy.join(", ")}</p>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Sources</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {pkg.sourceLinks.map((entry) => {
            const url = typeof entry === "string" ? entry : entry.url;
            const label = typeof entry === "string" ? entry : `${entry.billNumber} — ${entry.label}`;
            return (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer" className="text-kelly-navy underline">
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
        <ul className="mt-3 list-inside list-disc text-[10px] text-kelly-subtle">
          {pkg.governanceNotes.map((note) => (
            <li key={note.slice(0, 40)}>{note}</li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}
