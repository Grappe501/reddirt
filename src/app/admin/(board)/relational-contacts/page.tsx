import {
  RelationalMatchStatus,
  RelationalOrganizingStatus,
  RelationalRelationshipType,
} from "@prisma/client";
import Link from "next/link";

import { createRelationalContactAdminAction } from "@/app/admin/relational-contacts-actions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminRelationalContactsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const err = typeof sp.error === "string" ? sp.error : null;
  const saved = sp.saved === "1";

  const rows = await prisma.relationalContact.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      owner: { select: { id: true, email: true, name: true } },
    },
  });

  return (
    <div className="max-w-5xl text-deep-soil">
      <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-red-dirt/80">
        Field / organizing · REL-2
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">Relational contacts</h1>
      <p className="mt-2 max-w-2xl font-body text-sm text-deep-soil/70">
        Human-entered network for volunteers (power-of-5 + relational organizing). Rows are <strong>not</strong> vote
        totals or automatic supporter classifications. Voter file matches are optional and review-driven.
      </p>

      {err === "owner" ? (
        <p className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-2 text-sm text-red-800">
          Enter owner email.
        </p>
      ) : null}
      {err === "nouser" ? (
        <p className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-2 text-sm text-red-800">
          No user with that email.
        </p>
      ) : null}
      {err === "name" ? (
        <p className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-2 text-sm text-red-800">
          Display name is required.
        </p>
      ) : null}
      {err === "create" ? (
        <p className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-2 text-sm text-red-800">
          Create failed (validation or DB).
        </p>
      ) : null}
      {saved ? (
        <p className="mt-4 rounded-md border border-emerald-600/30 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          Contact created.
        </p>
      ) : null}

      <form
        action={createRelationalContactAdminAction}
        className="mt-8 space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]"
      >
        <h2 className="font-heading text-lg font-bold">Create (minimal)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Owner user email *</span>
            <input
              name="ownerEmail"
              type="email"
              required
              className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Display name *</span>
            <input
              name="displayName"
              type="text"
              required
              className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">First name</span>
            <input name="firstName" type="text" className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Last name</span>
            <input name="lastName" type="text" className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Phone</span>
            <input name="phone" type="text" className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Email</span>
            <input name="email" type="email" className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">County (slug, optional)</span>
          <input
            name="countySlug"
            type="text"
            placeholder="e.g. pulaski"
            className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Relationship type</span>
          <select
            name="relationshipType"
            className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm"
            defaultValue={RelationalRelationshipType.UNKNOWN}
          >
            {Object.values(RelationalRelationshipType).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Organizing status</span>
          <select
            name="organizingStatus"
            className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm"
            defaultValue=""
          >
            <option value="">(default IDENTIFIED)</option>
            {Object.values(RelationalOrganizingStatus).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Match status</span>
          <select
            name="matchStatus"
            className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm"
            defaultValue=""
          >
            <option value="">(default UNMATCHED)</option>
            {Object.values(RelationalMatchStatus).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input name="isCoreFive" type="checkbox" className="rounded border-deep-soil/25" />
            Core five
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Slot 1–5</span>
            <input
              name="powerOfFiveSlot"
              type="number"
              min={1}
              max={5}
              className="ml-2 w-20 rounded border border-deep-soil/15 px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Notes</span>
          <textarea name="notes" rows={3} className="mt-1 w-full rounded border border-deep-soil/15 px-2 py-1.5 text-sm" />
        </label>
        <button
          type="submit"
          className="rounded-md bg-red-dirt px-4 py-2 font-body text-sm font-semibold text-cream-canvas hover:opacity-95"
        >
          Create contact
        </button>
      </form>

      <h2 className="mt-12 font-heading text-lg font-bold">All contacts (latest 200)</h2>
      <div className="mt-4 overflow-x-auto rounded-card border border-deep-soil/10">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-deep-soil/5 font-body text-xs font-semibold uppercase tracking-wider text-deep-soil/70">
            <tr>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Display</th>
              <th className="px-3 py-2">Relationship</th>
              <th className="px-3 py-2">Match</th>
              <th className="px-3 py-2">Organizing</th>
              <th className="px-3 py-2">Core 5</th>
              <th className="px-3 py-2">Last contact</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-deep-soil/10">
                <td className="px-3 py-2 font-mono text-xs text-deep-soil/80">
                  <span className="block">{r.owner.email}</span>
                </td>
                <td className="px-3 py-2">
                  <Link className="font-medium text-red-dirt underline-offset-2 hover:underline" href={`/admin/relational-contacts/${r.id}`}>
                    {r.displayName}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.relationshipType}</td>
                <td className="px-3 py-2">{r.matchStatus}</td>
                <td className="px-3 py-2 text-xs">{r.organizingStatus}</td>
                <td className="px-3 py-2">{r.isCoreFive ? `Y (${r.powerOfFiveSlot ?? "—"})` : "—"}</td>
                <td className="px-3 py-2 text-xs text-deep-soil/75">
                  {r.lastContactedAt ? r.lastContactedAt.toISOString().slice(0, 10) : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-deep-soil/60">
                  No relational contacts yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
