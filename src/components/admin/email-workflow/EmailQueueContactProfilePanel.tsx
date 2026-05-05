import Link from "next/link";
import { prisma } from "@/lib/db";
import { listAudienceHintsForQueueItem, listProfileFactsForQueueItem, listSuggestionsForQueueItem } from "@/lib/email-command-center/profile-graph";
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

  const rawAi = meta.emailAiAnalysis;
  const hasAiOutput =
    rawAi &&
    typeof rawAi === "object" &&
    !Array.isArray(rawAi) &&
    "output" in rawAi &&
    (rawAi as Record<string, unknown>).output != null;

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
      <p className="text-[10px] leading-snug text-kelly-text/70">
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
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">Profile row</p>
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
          <p className="mt-1 text-kelly-text/60">
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
        <p className="text-[10px] text-kelly-text/60">
          Source limitations (AI envelope): see <strong>AI Email Intelligence</strong> panel above.
        </p>
        <GenerateProfileSuggestionsFromAiButton itemId={itemId} disabled={!hasAiOutput} />
        {!hasAiOutput ? (
          <p className="mt-1 text-[10px] text-kelly-text/55">
            Run OpenAI email analysis first to stage profile/audience rows from stored output.
          </p>
        ) : null}
      </div>

      <div>
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">
          Profile fact suggestions
        </p>
        <ProfileFactSuggestionsList
          itemId={itemId}
          suggestions={suggestions.map((s) => ({ id: s.id, factValue: s.factValue, status: s.status }))}
        />
      </div>

      <div>
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">
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
          <p className="text-[11px] text-kelly-text/55">No approved facts on this profile yet.</p>
        )}
      </div>

      <div>
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">
          Audience hints (not segments)
        </p>
        <ProfileAudienceHintsList
          itemId={itemId}
          hints={hints.map((h) => ({ id: h.id, label: h.label, status: h.status }))}
        />
      </div>
    </div>
  );
}
