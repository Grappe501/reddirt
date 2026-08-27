import { redirect } from "next/navigation";
import { PERMISSIONS } from "@/lib/event-pm/auth/permissions";
import { requireEventPmPermission } from "@/lib/event-pm/auth/server";
import { EventPmAuthError } from "@/lib/event-pm/auth/types";

export const dynamic = "force-dynamic";

export default async function EventProjectManagerAuthProofPage() {
  try {
    const actor = await requireEventPmPermission(PERMISSIONS.EVENT_VIEW_ALL);

    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/55">P0-S5 infrastructure proof</p>
          <h1 className="mt-2 text-3xl font-semibold">Event Project Manager</h1>
          <p className="mt-3 max-w-2xl text-black/70">
            Authentication, campaign membership, server-side authorization, and the Event PM database are active.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-black/[0.035] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-black/50">Signed in as</dt>
              <dd className="mt-1 font-medium">{actor.displayName ?? actor.email}</dd>
            </div>
            <div className="rounded-xl bg-black/[0.035] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-black/50">Role</dt>
              <dd className="mt-1 font-medium">{actor.role}</dd>
            </div>
            <div className="rounded-xl bg-black/[0.035] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-black/50">Event access</dt>
              <dd className="mt-1 font-medium">Campaign-wide read access</dd>
            </div>
            <div className="rounded-xl bg-black/[0.035] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-black/50">Security gates</dt>
              <dd className="mt-1 font-medium">Authentication PASS · Authorization PASS · Database PASS</dd>
            </div>
          </dl>

          <form action="/auth/logout" method="post" className="mt-8">
            <button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  } catch (error) {
    if (error instanceof EventPmAuthError && error.status === 401) {
      redirect("/admin/event-pm-login?next=/admin/events");
    }
    if (error instanceof EventPmAuthError) {
      return (
        <main className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-red-900/15 bg-white p-8">
            <h1 className="text-2xl font-semibold">Campaign access unavailable</h1>
            <p className="mt-3 text-black/70">{error.message}</p>
            <p className="mt-2 text-sm text-black/50">Reference: {error.code}</p>
          </div>
        </main>
      );
    }
    throw error;
  }
}
