import Link from "next/link";

import { requireRelationalUserPage } from "@/lib/campaign/relational-user-session";
import { RelationalRelationshipType } from "@prisma/client";

import { createRelationalContactUserAction } from "../actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewRelationalContactPage({ searchParams }: Props) {
  await requireRelationalUserPage();
  const sp = await searchParams;
  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="font-heading text-2xl font-bold">Add person</h1>
        <Link href="/relational" className="text-sm text-red-dirt hover:underline">
          ← Back
        </Link>
      </div>
      {sp.error ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {sp.error}
        </p>
      ) : null}
      <form action={createRelationalContactUserAction} className="space-y-4 rounded-card border border-deep-soil/10 p-6">
        <label className="block text-sm">
          <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">
            Display name *
          </span>
          <input
            name="displayName"
            required
            className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">First</span>
            <input name="firstName" className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Last</span>
            <input name="lastName" className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Phone</span>
          <input
            name="phone"
            type="tel"
            className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Email</span>
          <input
            name="email"
            type="email"
            className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Relationship</span>
          <select
            name="relationshipType"
            className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
            defaultValue={RelationalRelationshipType.UNKNOWN}
          >
            {Object.values(RelationalRelationshipType).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isCoreFive" className="rounded border-deep-soil/30" />
            <span>Part of my core five</span>
          </label>
          <label className="block text-sm">
            <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">
              Power-of-five slot (1–5)
            </span>
            <input
              name="powerOfFiveSlot"
              type="number"
              min={1}
              max={5}
              className="mt-1 w-24 rounded border border-deep-soil/15 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Notes</span>
          <textarea
            name="notes"
            rows={3}
            className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded bg-red-dirt px-4 py-2.5 text-sm font-semibold text-cream-canvas"
        >
          Save
        </button>
      </form>
    </div>
  );
}
