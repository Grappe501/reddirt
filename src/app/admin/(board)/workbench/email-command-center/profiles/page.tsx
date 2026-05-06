import Link from "next/link";
import {
  listApprovedRecentFacts,
  listPendingAudienceHints,
  listPendingProfileFactSuggestions,
} from "@/lib/email-command-center/profile-graph";
import { ProfileReviewAudienceHints } from "@/components/admin/email-workflow/ProfileReviewAudienceHints";
import { ProfileReviewFactSuggestionsPanel } from "@/components/admin/email-workflow/ProfileReviewFactSuggestionsPanel";
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
        <Link href="/admin/workbench/email-command-center/analytics" className="text-xs text-kelly-text/60 hover:underline">
          Analytics
        </Link>
        <Link href="/admin/workbench/email-command-center/map" className="text-xs text-kelly-text/60 hover:underline">
          Route map
        </Link>
        <Link href="/admin/workbench/email-command-center/readiness" className="text-xs text-kelly-text/60 hover:underline">
          Readiness
        </Link>
      </div>
      <h1 className="font-heading text-lg font-bold text-kelly-navy">Email — Profile &amp; hint review</h1>
      <p className="font-body text-xs text-kelly-text/80">
        EMAIL-CONTACT-PROFILE-GRAPH-1.0 + <strong>EMAIL-AI-PROFILE-INTELLIGENCE-2.0</strong> — staged intelligence from email queue and
        advisory AI with evidence-labeled metadata. Approve profile suggestions to record{" "}
        <code className="text-[10px]">EmailContactProfileFact</code> rows with provenance. Audience hints remain governance notes until
        future audience packets; they do not create SendGrid lists.
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
          <div className="mt-2">
            <ProfileReviewFactSuggestionsPanel
              suggestions={pendingSugs.map((s) => ({
                id: s.id,
                emailWorkflowItemId: s.emailWorkflowItemId,
                factValue: s.factValue,
                factKey: s.factKey,
                suggestionType: s.suggestionType,
                status: s.status,
                confidence: s.confidence,
                rationale: s.rationale,
                metadataJson: s.metadataJson,
                emailWorkflowItem: s.emailWorkflowItem,
                profile: s.profile
                  ? { displayName: s.profile.displayName, primaryEmail: s.profile.primaryEmail }
                  : null,
              }))}
            />
          </div>
        ) : (
          <div className="mt-1 rounded border border-kelly-text/12 bg-kelly-fog/40 px-2 py-2 font-body text-[11px] text-kelly-navy" role="status">
            <p className="font-semibold">No pending profile fact suggestions</p>
            <p className="mt-1 text-[10px] text-kelly-text/80">
              Suggestions appear after queue AI stores JSON on an item and the graph stages PENDING rows — nothing is wrong
              with an empty list on a fresh DB.
            </p>
            <p className="mt-2 text-[10px]">
              <span className="font-semibold">Next:</span>{" "}
              <Link href="/admin/workbench/email-queue" className="font-bold text-kelly-forest underline">
                Open email queue
              </Link>{" "}
              → open an item → run AI analysis (if configured) → return here.
            </p>
            <p className="mt-1 text-[10px] text-kelly-forest/90">
              <strong>Safety:</strong> approvals still required — no auto-merge to canonical volunteer profiles.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-text">Pending audience hints</h2>
        <ProfileReviewAudienceHints
          hints={pendingHints.map((h) => ({
            id: h.id,
            label: h.label,
            status: h.status,
            hintType: h.hintType,
            confidence: h.confidence,
            rationale: h.rationale,
            metadataJson: h.metadataJson,
            emailWorkflowItemId: h.emailWorkflowItemId,
            emailWorkflowItem: h.emailWorkflowItem,
          }))}
        />
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
          <div className="mt-1 rounded border border-kelly-text/12 bg-kelly-fog/40 px-2 py-2 font-body text-[11px] text-kelly-navy" role="status">
            <p className="font-semibold">No approved facts yet</p>
            <p className="mt-1 text-[10px] text-kelly-text/80">
              Audience Studio previews are safest once ACTIVE facts exist — approve suggestions above or add governed facts
              via contact import commit.
            </p>
            <p className="mt-2 text-[10px]">
              <Link href="/admin/workbench/email-command-center/audiences" className="font-bold text-kelly-forest underline">
                Audience Studio
              </Link>{" "}
              ·{" "}
              <Link href="/admin/workbench/email-command-center/imports" className="font-bold text-kelly-forest underline">
                Contact imports
              </Link>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
