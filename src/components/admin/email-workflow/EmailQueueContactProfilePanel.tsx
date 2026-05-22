import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  getStoredEmailAiOutputFromMetadata,
  listAudienceHintsForQueueItem,
  listProfileFactsForQueueItem,
  listSuggestionsForQueueItem,
} from "@/lib/email-command-center/profile-graph";
import { buildQueueItemProfileContextFromRow, suggestProfileFactsWithEvidence } from "@/lib/email-command-center/ai-profile-intelligence";
import {
  GenerateProfileSuggestionsFromAiButton,
  ProfileAudienceHintsList,
  ProfileFactSuggestionsList,
} from "@/components/admin/email-workflow/EmailWorkflowProfileGraphControls";

function asMetaRecord(v: unknown): Record<string, unknown> {
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return {};
}

export async function EmailQueueContactProfilePanel({ itemId }: { itemId: string }) {
  const item = await prisma.emailWorkflowItem.findUnique({
    where: { id: itemId },
    select: {
      metadataJson: true,
      emailContactProfileId: true,
      whoSummary: true,
      whatSummary: true,
      whenSummary: true,
      whereSummary: true,
      whySummary: true,
      impactSummary: true,
      recommendedResponseSummary: true,
      recommendedResponseRationale: true,
      intent: true,
      tone: true,
      sentiment: true,
    },
  });

  const meta = asMetaRecord(item?.metadataJson);
  const gmailReview =
    typeof meta.gmailReviewSource === "object" &&
    meta.gmailReviewSource != null &&
    !Array.isArray(meta.gmailReviewSource)
      ? (meta.gmailReviewSource as Record<string, unknown>)
      : null;
  const metadataOnlyGmail = Boolean(gmailReview && gmailReview.bodyStored !== true);

  const aiOut = item ? getStoredEmailAiOutputFromMetadata(item.metadataJson) : null;
  const hasAiOutput = Boolean(aiOut);
  const profileIntelPreview =
    item && aiOut
      ? suggestProfileFactsWithEvidence(buildQueueItemProfileContextFromRow(item, metadataOnlyGmail), aiOut).slice(0, 8)
      : [];

  const profile = item?.emailContactProfileId
    ? await prisma.emailContactProfile.findUnique({
        where: { id: item.emailContactProfileId },
      })
    : null;

  const [facts, suggestions, hints] = await Promise.all([
    listProfileFactsForQueueItem(itemId),
    listSuggestionsForQueueItem(itemId),
    listAudienceHintsForQueueItem(itemId),
  ]);

  return (
    <div className="mt-2 space-y-2 rounded border border-kelly-text/10 bg-kelly-page/40 p-2">
      <h2 className="font-heading text-sm font-bold text-kelly-text">Contact / Profile Intelligence</h2>
      <p className="text-[10px] leading-snug text-kelly-muted">
        <span className="font-semibold text-kelly-text">EMAIL-CONTACT-PROFILE-GRAPH-1.0</span> — facts require
        operator approval. Approved rows live on <code className="text-[9px]">EmailContactProfileFact</code> only;
        User/VolunteerProfile are not auto-updated here. Audience hints do <strong>not</strong> create SendGrid segments
        or comms plan members. No email is sent from this panel.
      </p>

      {metadataOnlyGmail ? (
        <p className="rounded border border-amber-200/70 bg-amber-50/80 px-2 py-1 text-[10px] text-amber-950">
          Gmail metadata-only row — context may be limited; verify in Gmail or richer sources before trusting
          suggestions.
        </p>
      ) : null}

      <div className="rounded border border-kelly-text/10 bg-white/80 px-2 py-1.5 text-[11px]">
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-muted">Profile row</p>
        {profile ? (
          <ul className="mt-1 space-y-0.5 text-kelly-text/85">
            <li>
              <strong className="text-kelly-text">ID:</strong> {profile.id}
            </li>
            {profile.primaryEmail ? (
              <li>
                <strong className="text-kelly-text">Primary email (hint):</strong> {profile.primaryEmail}
              </li>
            ) : null}
            {profile.displayName ? (
              <li>
                <strong className="text-kelly-text">Display:</strong> {profile.displayName}
              </li>
            ) : null}
            <li>
              <strong className="text-kelly-text">CRM user:</strong>{" "}
              {profile.userId ? <code className="text-[10px]">{profile.userId}</code> : "—"}
            </li>
          </ul>
        ) : (
          <p className="mt-1 text-kelly-muted">
            No Email Contact Profile linked yet. Run <strong>Generate suggestions from AI analysis</strong> to create
            and link a profile row from this queue item.
          </p>
        )}
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          <Link
            className="text-[10px] font-semibold text-kelly-slate underline"
            href="/admin/workbench/email-command-center/profiles"
          >
            Open Profile &amp; hint review queue →
          </Link>
          <Link
            className="text-[10px] font-semibold text-kelly-forest underline"
            href="/admin/workbench/email-command-center/audiences"
          >
            Audience Studio (approved-fact previews) →
          </Link>
        </p>
      </div>

      <div>
        <p className="text-[10px] text-kelly-muted">
          Source limitations (AI envelope): see <strong>AI Email Intelligence</strong> panel above.
        </p>
        <GenerateProfileSuggestionsFromAiButton itemId={itemId} disabled={!hasAiOutput} />
        {!hasAiOutput ? (
          <p className="mt-1 text-[10px] text-kelly-muted">
            Run OpenAI email analysis first to stage profile/audience rows from stored output.
          </p>
        ) : null}
      </div>

      {profileIntelPreview.length ? (
        <div className="rounded border border-kelly-forest/25 bg-kelly-fog/30 px-2 py-2">
          <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-forest/90">
            Profile intelligence 2.0 preview (not staged)
          </p>
          <p className="mt-0.5 text-[10px] text-kelly-muted">
            Deterministic recompute from queue fields + stored AI output — same family as staged rows after you click generate.
            Evidence labels are advisory; approve only after operator verification.
          </p>
          <ul className="mt-2 space-y-2">
            {profileIntelPreview.map((row, i) => (
              <li key={i} className="rounded border border-kelly-text/10 bg-white/90 px-2 py-1.5 text-[10px] text-kelly-text/85">
                <p className="font-semibold text-kelly-navy">{row.suggestedFact}</p>
                <p className="mt-0.5 text-[9px] text-kelly-muted">
                  {row.factType} · conf {row.confidence.toFixed(2)} · risk {row.riskLevel} · {row.sourceType}
                  {row.needsHumanReview ? " · needs review" : ""}
                </p>
                <p className="mt-1 text-[9px] text-kelly-muted">
                  <span className="font-semibold">Why:</span> {row.whySuggested}
                </p>
                <p className="mt-0.5 font-mono text-[9px] text-kelly-muted">{row.evidenceText.slice(0, 360)}</p>
                {row.shouldNotStoreReason ? (
                  <p className="mt-1 rounded bg-rose-50/90 px-1.5 py-0.5 text-[9px] text-rose-950">
                    Do not store: {row.shouldNotStoreReason}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
          Profile fact suggestions
        </p>
        <ProfileFactSuggestionsList
          itemId={itemId}
          suggestions={suggestions.map((s) => ({
            id: s.id,
            factValue: s.factValue,
            status: s.status,
            factKey: s.factKey,
            suggestionType: s.suggestionType,
            confidence: s.confidence,
            rationale: s.rationale,
            metadataJson: s.metadataJson,
          }))}
        />
      </div>

      <div>
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
          Approved profile facts
        </p>
        {facts.length ? (
          <ul className="mt-1 list-inside list-disc text-[11px] text-kelly-text/85">
            {facts.map((f) => (
              <li key={f.id}>
                <span className="font-semibold">{f.factKey}</span>: {f.factValue.slice(0, 400)}
                {f.factValue.length > 400 ? "…" : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-kelly-muted">No approved facts on this profile yet.</p>
        )}
      </div>

      <div>
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
          Audience hints (not segments)
        </p>
        <ProfileAudienceHintsList
          itemId={itemId}
          hints={hints.map((h) => ({
            id: h.id,
            label: h.label,
            status: h.status,
            hintType: h.hintType,
            confidence: h.confidence,
            rationale: h.rationale,
            metadataJson: h.metadataJson,
          }))}
        />
      </div>
    </div>
  );
}
