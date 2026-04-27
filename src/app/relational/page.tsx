import Link from "next/link";

import { requireRelationalUserPage } from "@/lib/campaign/relational-user-session";
import { listRelationalContactsForUser } from "@/lib/campaign-engine/relational-contacts";
import { getUserRelationalSummary } from "@/lib/campaign-engine/relational-rollups";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ saved?: string; error?: string }> };

export default async function RelationalHomePage({ searchParams }: Props) {
  const userId = await requireRelationalUserPage();
  const sp = await searchParams;
  const [summary, contacts] = await Promise.all([
    getUserRelationalSummary(userId),
    listRelationalContactsForUser(userId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/80">REL-3</p>
        <h1 className="mt-1 font-heading text-3xl font-bold">Relational home</h1>
        <p className="mt-2 text-sm text-kelly-text/70">
          Your network of people — queue-first, no auto-messaging. Add contacts you are responsible
          for organizing.
        </p>
      </div>

      {sp.saved ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Saved.
        </p>
      ) : null}
      {sp.error ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {sp.error}
        </p>
      ) : null}

      <section className="grid gap-3 rounded-card border border-kelly-text/10 bg-kelly-page p-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-kelly-text/50">Total contacts</p>
          <p className="font-heading text-2xl font-bold">{summary.totalContacts}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-kelly-text/50">Core five</p>
          <p className="font-heading text-2xl font-bold">{summary.coreFiveCount}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-kelly-text/50">Matched to file</p>
          <p className="font-heading text-2xl font-bold">{summary.matchedCount}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-kelly-text/50">
            Touches (last 7 days)
          </p>
          <p className="font-heading text-2xl font-bold">{summary.last7DayTouches}</p>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold">People</h2>
        <Link
          href="/relational/new"
          className="rounded bg-kelly-navy px-4 py-2 text-sm font-semibold text-kelly-page hover:opacity-95"
        >
          Add person
        </Link>
      </div>

      {contacts.length === 0 ? (
        <p className="rounded border border-dashed border-kelly-text/20 px-4 py-8 text-center text-sm text-kelly-text/60">
          No contacts yet. Add someone you are organizing.
        </p>
      ) : (
        <ul className="divide-y divide-kelly-text/10 rounded-card border border-kelly-text/10">
          {contacts.map((c) => (
            <li key={c.id}>
              <Link
                href={`/relational/${c.id}`}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-kelly-text/[0.03] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-medium">{c.displayName}</span>
                  <span className="ml-2 text-xs text-kelly-text/55">{c.relationshipType}</span>
                </div>
                <div className="text-xs text-kelly-text/60">
                  {c.isCoreFive ? "Core five" : "—"} · {c.matchStatus} ·
                  {c.lastContactedAt
                    ? ` Last contact ${c.lastContactedAt.toLocaleDateString()}`
                    : " No touch logged"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
