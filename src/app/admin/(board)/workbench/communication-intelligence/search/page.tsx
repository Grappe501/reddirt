import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function CommunicationIntelligenceSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const safe = q.length >= 2 && q.length <= 120;

  const [identities, gmailRows, calRows] = safe
    ? await Promise.all([
        prisma.communicationIdentity
          .findMany({
            where: {
              OR: [
                { normalizedEmail: { contains: q, mode: "insensitive" } },
                { displayName: { contains: q, mode: "insensitive" } },
              ],
            },
            take: 20,
            select: { id: true, displayName: true, normalizedEmail: true, reviewStatus: true },
          })
          .catch(() => []),
        prisma.gmailMessageRecord
          .findMany({
            where: { OR: [{ subject: { contains: q, mode: "insensitive" } }, { snippet: { contains: q, mode: "insensitive" } }] },
            take: 15,
            orderBy: { internalDate: "desc" },
            select: { id: true, subject: true, snippet: true, internalDate: true },
          })
          .catch(() => []),
        prisma.googleCalendarEventRecord
          .findMany({
            where: { summary: { contains: q, mode: "insensitive" } },
            take: 15,
            orderBy: { startAt: "desc" },
            select: { id: true, summary: true, startAt: true, privacyRedacted: true },
          })
          .catch(() => []),
      ])
    : [[], [], []];

  return (
    <div className="min-w-0 max-w-4xl space-y-3 px-2 py-3 text-[11px]">
      <Link href="/admin/workbench/communication-intelligence" className="text-[10px] font-semibold text-kelly-forest underline">
        ← Communication Intelligence
      </Link>
      <h1 className="font-heading text-lg font-bold text-kelly-navy">Search</h1>
      <form className="flex flex-wrap items-end gap-2 text-[10px]" method="get">
        <label>
          Query{" "}
          <input name="q" defaultValue={q} className="ml-1 w-64 rounded border px-1 py-0.5" placeholder="email, name, subject…" />
        </label>
        <button type="submit" className="rounded border border-kelly-navy/30 bg-white px-2 py-0.5 font-bold">
          Search
        </button>
      </form>
      {!safe ? <p className="text-[10px] text-kelly-text/60">Enter 2–120 characters.</p> : null}
      {safe ? (
        <>
          <section>
            <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/55">Identities</p>
            <ul className="mt-1 space-y-1">
              {identities.map((i) => (
                <li key={i.id}>
                  <Link href={`/admin/workbench/communication-intelligence/identities/${i.id}`} className="font-bold text-kelly-forest underline">
                    {i.displayName ?? i.normalizedEmail}
                  </Link>{" "}
                  <span className="text-[9px] text-kelly-text/55">{i.reviewStatus}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/55">Gmail (subject/snippet)</p>
            <ul className="mt-1 space-y-1 text-[10px]">
              {gmailRows.map((g) => (
                <li key={g.id}>
                  {g.subject ?? "(no subject)"} — <span className="text-kelly-text/65">{g.snippet?.slice(0, 120) ?? ""}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/55">Imported calendar</p>
            <ul className="mt-1 space-y-1 text-[10px]">
              {calRows.map((c) => (
                <li key={c.id}>
                  {c.summary ?? "(event)"} · {c.startAt?.toISOString() ?? "—"}
                  {c.privacyRedacted ? " · redacted" : ""}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}
