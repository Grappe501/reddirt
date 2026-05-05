import Link from "next/link";
import {
  listApprovedRecentFacts,
  listPendingAudienceHints,
  listPendingProfileFactSuggestions,
} from "@/lib/email-command-center/profile-graph";
import { ProfileFactSuggestionsList } from "@/components/admin/email-workflow/EmailWorkflowProfileGraphControls";
import { ProfileReviewAudienceHints } from "@/components/admin/email-workflow/ProfileReviewAudienceHints";
import { EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM } from "@/lib/email-workflow/governance";

export const dynamic = "force-dynamic";

export default async function EmailCommandCenterProfilesPage() {
  const [pendingSugs, recentFacts, pendingHints] = await Promise.all([
    listPendingProfileFactSuggestions(),
    listApprovedRecentFacts(80),
    listPendingAudienceHints(),
  ]);

  return (
    <div className="min-w-0 max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/workbench/email-command-center"
          className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
        >
          ← Email Command Center
        </Link>
        <Link href="/admin/workbench/email-queue" className="text-xs text-kelly-text/60 hover:underline">
          Email queue
        </Link>
        <Link href="/admin/workbench/email-command-center/audiences" className="text-xs text-kelly-text/60 hover:underline">
          Audience Studio
        </Link>
      </div>
      <h1 className="font-heading text-lg font-bold text-kelly-navy">Email — Profile &amp; hint review</h1>
      <p className="font-body text-xs text-kelly-text/80">
        EMAIL-CONTACT-PROFILE-GRAPH-1.0 — staged intelligence from email queue and advisory AI. Approve profile
        suggestions to record <code className="text-[10px]">EmailContactProfileFact</code> rows with provenance.
        Audience hints remain governance notes until future audience packets; they do not create SendGrid lists.
      </p>

      <section className="rounded-lg border border-kelly-text/12 bg-rose-50/50 px-3 py-2">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wide text-rose-950">Governance</h2>
        <ul className="mt-1 list-inside list-disc text-[11px] text-rose-950/90">
          <li>Profile facts require explicit operator approval — nothing auto-merges into User/VolunteerProfile here.</li>
          <li>
            Approved facts power{" "}
            <Link href="/admin/workbench/email-command-center/audiences" className="font-semibold underline">
              Audience Studio
            </Link>{" "}
            previews; pending hints are not broadcast-eligible until governed.
          </li>
          <li>Audience hints are not comms segments — no mass email from this route.</li>
          <li>No Gmail bodies, no SendGrid, no outbound sends — <code className="text-[10px]">canSendFromItem=false</code>{" "}
            ({String(EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM)}).
          </li>
        </ul>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-text">Pending profile fact suggestions</h2>
        {pendingSugs.length ? (
          <ul className="mt-2 space-y-3">
            {pendingSugs.map((s) => (
              <li key={s.id} className="rounded border border-kelly-text/10 bg-kelly-page/40 p-2 text-[11px]">
                <p className="font-semibold text-kelly-navy">{s.factValue}</p>
                <p className="text-[10px] text-kelly-text/60">
                  Item:{" "}
                  <Link className="underline" href={`/admin/workbench/email-queue/${s.emailWorkflowItemId}`}>
                    {s.emailWorkflowItem.title ?? s.emailWorkflowItem.whatSummary ?? s.emailWorkflowItemId}
                  </Link>
                  {" · "}
                  {s.emailWorkflowItem.status}
                </p>
                {s.profile ? (
                  <p className="text-[10px] text-kelly-text/55">
                    Profile: {s.profile.displayName ?? "—"} · {s.profile.primaryEmail ?? "no email hint"}
                  </p>
                ) : null}
                <ProfileFactSuggestionsList
                  itemId={s.emailWorkflowItemId}
                  suggestions={[{ id: s.id, factValue: s.factValue, status: s.status }]}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[11px] text-kelly-text/55">No pending profile fact suggestions.</p>
        )}
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-text">Pending audience hints</h2>
        <ProfileReviewAudienceHints hints={pendingHints} />
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-text">Recently approved profile facts</h2>
        {recentFacts.length ? (
          <ul className="mt-2 space-y-1 text-[11px] text-kelly-text/85">
            {recentFacts.map((f) => (
              <li key={f.id} className="rounded border border-kelly-text/8 bg-kelly-page/30 px-2 py-1">
                <span className="font-semibold">{f.factKey}</span>: {f.factValue.slice(0, 280)}
                {f.factValue.length > 280 ? "…" : ""}
                <span className="block text-[9px] text-kelly-text/50">
                  Profile {f.profileId}
                  {f.approvedAt ? ` · ${f.approvedAt.toISOString()}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[11px] text-kelly-text/55">No approved facts recorded yet.</p>
        )}
      </section>
    </div>
  );
}
