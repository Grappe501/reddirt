import Link from "next/link";
import { MessageStudioDraftPlanner } from "@/components/admin/email-command-center/MessageStudioDraftPlanner";
import { MESSAGE_STUDIO_CONTENT_BLOCKS } from "@/components/admin/email-command-center/message-studio-content-blocks";
import type { MessageStudioDraftListRow } from "@/lib/email-command-center/message-studio-drafts";

const badge =
  "rounded-full border border-kelly-text/15 bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-kelly-slate";
const card = "rounded-lg border border-kelly-text/12 bg-white/95 p-3 shadow-sm";
const h3 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/50";

const DRAFT_TYPES: {
  title: string;
  purpose: string;
  bestSource: string;
  risk: "Low" | "Medium" | "High";
  approval: string;
  futureRail: "Gmail 1:1 (future)" | "SendGrid broadcast (future)" | "Either (future)";
}[] = [
  {
    title: "Individual reply",
    purpose: "Respond to a single correspondent with context from the queue.",
    bestSource: "EmailWorkflowItem summaries + AI analysis (advisory).",
    risk: "Medium",
    approval: "Queue + comms policy",
    futureRail: "Gmail 1:1 (future)",
  },
  {
    title: "Volunteer follow-up",
    purpose: "Nurture volunteers after events or shifts.",
    bestSource: "Approved profile facts + Audience Studio segments.",
    risk: "Medium",
    approval: "Field director",
    futureRail: "Either (future)",
  },
  {
    title: "Donor follow-up",
    purpose: "Thank-you and stewardship without implying transactional consent.",
    bestSource: "Import provenance + facts; suppressions before any send.",
    risk: "High",
    approval: "Finance + counsel",
    futureRail: "SendGrid broadcast (future)",
  },
  {
    title: "Event invitation",
    purpose: "Drive RSVPs for campaign or county events.",
    bestSource: "Calendar + county facts + audience definitions.",
    risk: "Medium",
    approval: "Comms lead",
    futureRail: "SendGrid broadcast (future)",
  },
  {
    title: "Press response",
    purpose: "Structured reply to media inquiries.",
    bestSource: "Queue item + press routing metadata.",
    risk: "High",
    approval: "Communications director",
    futureRail: "Gmail 1:1 (future)",
  },
  {
    title: "Issue update",
    purpose: "Educate supporters on SOS-relevant policy topics.",
    bestSource: "Approved facts + issue tags; avoid unsourced claims.",
    risk: "Medium",
    approval: "Policy + counsel",
    futureRail: "SendGrid broadcast (future)",
  },
  {
    title: "County / regional update",
    purpose: "Hyper-local relevance for a geography.",
    bestSource: "County hints + audience definitions.",
    risk: "Medium",
    approval: "Regional lead",
    futureRail: "SendGrid broadcast (future)",
  },
  {
    title: "Newsletter",
    purpose: "Long-form recurring update.",
    bestSource: "Audience Studio + stacked facts + suppressions.",
    risk: "Medium",
    approval: "Editor + counsel",
    futureRail: "SendGrid broadcast (future)",
  },
  {
    title: "Rapid response",
    purpose: "Fast-turn messaging after news moments.",
    bestSource: "Queue intel + AI advisory (human rewrite required).",
    risk: "High",
    approval: "Rapid response lead + counsel",
    futureRail: "Either (future)",
  },
  {
    title: "Re-engagement message",
    purpose: "Win back inactive supporters.",
    bestSource: "Suppressions + engagement facts; careful consent posture.",
    risk: "High",
    approval: "Comms + counsel",
    futureRail: "SendGrid broadcast (future)",
  },
];

type MessageStudioViewProps = {
  querySource?: string;
  queryId?: string;
  queryAudienceDefinitionId?: string;
  queryImportBatchId?: string;
  openAiServerConfigured?: boolean;
  serverDraftRows?: MessageStudioDraftListRow[];
};

export function MessageStudioView({
  querySource,
  queryId,
  queryAudienceDefinitionId,
  queryImportBatchId,
  openAiServerConfigured = false,
  serverDraftRows = [],
}: MessageStudioViewProps) {
  return (
    <div className="min-w-0 max-w-5xl space-y-4">
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
        <Link href="/admin/workbench/email-command-center/imports" className="text-xs text-kelly-text/60 hover:underline">
          Contact imports
        </Link>
        <Link href="/admin/workbench/email-command-center/automation" className="text-xs text-kelly-text/60 hover:underline">
          Automation Studio
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
        <Link
          href="/admin/workbench/email-command-center/send-execution"
          className="text-xs text-kelly-text/60 hover:underline"
        >
          Send execution governance
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Message Studio</h1>
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          Draft, personalize, review, and prepare campaign email <strong>without sending from this page</strong>.
          CAMPAIGN-VOICE-1.2 + EDITORIAL-REVIEW-DESK-1.0 — Campaign Voice + **Editorial Review Desk** (send-readiness before
          governance) + optional <strong>admin-server</strong> OpenAI drafting (advisory only). <strong>Local drafts</strong> autosave
          in <strong>browser localStorage</strong> (this device). <strong>Shared drafts</strong> (EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0)
          live in Postgres so staff can save, reopen, review, and route copy toward Send Execution Governance — still{" "}
          <strong>no send</strong> from this lane.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className={badge}>No live sends</span>
          <span className={badge}>Local + shared drafts</span>
          <span className={badge}>Approval required</span>
          <span className={badge}>SendGrid future</span>
          <span className={badge}>Gmail send future</span>
        </div>
      </header>

      <div className="rounded-lg border border-kelly-forest/25 bg-emerald-50/60 px-3 py-2 font-body text-[11px] text-emerald-950" role="note">
        <p className="font-semibold">First time here tonight?</p>
        <p className="mt-1 text-[10px] leading-snug">
          Open the{" "}
          <Link href="/admin/workbench/email-command-center/readiness" className="font-bold underline">
            Readiness checklist
          </Link>{" "}
          and{" "}
          <Link href="/admin/workbench/email-command-center/map" className="font-bold underline">
            Route map
          </Link>{" "}
          so the team shares the same mental model — still <strong>no send</strong>. Local drafts save to{" "}
          <strong>this browser</strong>; shared drafts anchor below at <strong>#shared-drafts</strong>.
        </p>
      </div>

      {(querySource || queryId || queryAudienceDefinitionId || queryImportBatchId) && (
        <div className="rounded-lg border border-kelly-forest/30 bg-emerald-50/70 px-3 py-2 font-body text-[11px] text-emerald-950" role="status">
          <p className="font-semibold">Context chips (no body text loaded)</p>
          <ul className="mt-1 list-inside list-disc text-[10px]">
            {querySource ? (
              <li>
                source=<span className="font-mono">{querySource}</span>
              </li>
            ) : null}
            {queryId ? (
              <li>
                id=<span className="font-mono">{queryId}</span> — use queue detail for full context; this page does not fetch bodies.
                Toggle <strong>Queue item context</strong> in Campaign Voice when you have reviewed the item; AI can use
                that selection only with the text you paste or summarize here.
              </li>
            ) : null}
            {queryAudienceDefinitionId ? (
              <li>
                audienceDefinitionId=<span className="font-mono">{queryAudienceDefinitionId}</span> — open Audience Studio to edit criteria.
              </li>
            ) : null}
            {queryImportBatchId ? (
              <li>
                importBatchId=<span className="font-mono">{queryImportBatchId}</span> — open import batch detail for row context.
              </li>
            ) : null}
          </ul>
        </div>
      )}

      <section className={`${card} border-rose-200/60 bg-rose-50/70`}>
        <h2 className={h3}>Governance</h2>
        <ul className="mt-2 list-inside list-disc space-y-0.5 font-body text-[11px] text-rose-950/95">
          <li>No SendGrid API sends, no Gmail sends, no auto-reply from this route.</li>
          <li>
            Optional OpenAI runs as <strong>admin server actions</strong> only when configured — advisory drafting, never
            auto-sent; operators must click to apply suggestions.
          </li>
          <li>AI Email Intelligence on queue detail remains advisory — bring vetted context into Message Studio.</li>
          <li>Suppressions and consent posture must be honored before any future execution packet.</li>
          <li>
            Read the full gate map on{" "}
            <Link href="/admin/workbench/email-command-center/send-execution" className="font-bold underline">
              Send Execution Governance
            </Link>{" "}
            — still <strong>no send</strong> from either route.
          </li>
        </ul>
      </section>

      <section className={card}>
        <h2 className={`${h3} text-kelly-navy`}>A. Draft types</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DRAFT_TYPES.map((d) => (
            <div key={d.title} className="rounded border border-kelly-text/10 bg-kelly-page/50 p-2">
              <p className="font-heading text-xs font-bold text-kelly-navy">{d.title}</p>
              <p className="mt-1 text-[10px] text-kelly-text/80">
                <span className="font-semibold text-kelly-text">Purpose:</span> {d.purpose}
              </p>
              <p className="mt-1 text-[10px] text-kelly-text/80">
                <span className="font-semibold text-kelly-text">Best source data:</span> {d.bestSource}
              </p>
              <p className="mt-1 text-[10px]">
                <span className="font-semibold text-kelly-text">Risk:</span>{" "}
                <span
                  className={
                    d.risk === "High"
                      ? "text-rose-800 font-semibold"
                      : d.risk === "Medium"
                        ? "text-amber-900 font-semibold"
                        : "text-emerald-900 font-semibold"
                  }
                >
                  {d.risk}
                </span>
                {" · "}
                <span className="font-semibold text-kelly-text">Approval:</span> {d.approval}
              </p>
              <p className="mt-1 text-[9px] text-kelly-text/65">
                Future send rail: <span className="font-mono">{d.futureRail}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className={h3}>B. Audience-aware drafting</h2>
        <p className="mt-1 font-body text-[11px] text-kelly-text/85">
          Local drafts can reference: <strong>approved profile facts</strong>, <strong>audience definitions</strong> (Audience
          Studio — use approved audience context to guide voice frames), <strong>queue item context</strong> (paste from
          detail — not auto-loaded), <strong>AI analysis</strong> (advisory JSON from queue detail),{" "}
          <strong>import provenance</strong> (CONTACT_IMPORT), and <strong>SendGrid suppressions</strong> (honor-before-send).
          Campaign Voice toggles document what you have actually reviewed. This build does <strong>not</strong> sync or send.
        </p>
      </section>

      <MessageStudioDraftPlanner
        querySource={querySource}
        queryId={queryId}
        queryAudienceDefinitionId={queryAudienceDefinitionId}
        queryImportBatchId={queryImportBatchId}
        openaiServerConfigured={openAiServerConfigured}
        serverDraftRows={serverDraftRows}
      />

      <section className={card}>
        <h2 className={h3}>D. Content block reference ({MESSAGE_STUDIO_CONTENT_BLOCKS.length} blocks)</h2>
        <p className="mt-1 text-[10px] text-kelly-text/70">
          The <strong>draft workspace</strong> above includes <strong>Insert into body</strong> and <strong>Copy block</strong>{" "}
          for each block. This list is read-only reference only.
        </p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {MESSAGE_STUDIO_CONTENT_BLOCKS.map((b) => (
            <li key={b.title} className="rounded border border-kelly-text/10 bg-kelly-page/40 px-2 py-1.5">
              <p className="font-semibold text-kelly-navy text-[11px]">{b.title}</p>
              <p className="mt-0.5 text-[10px] text-kelly-text/80">{b.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <h2 className={h3}>E. AI drafting (production posture)</h2>
        <ol className="mt-2 list-inside list-decimal space-y-1 font-body text-[11px] text-kelly-text/90">
          <li>
            Use <strong>AI Email Intelligence</strong> on the{" "}
            <Link href="/admin/workbench/email-queue" className="font-bold text-kelly-forest underline">
              email queue detail
            </Link>{" "}
            first when triaging (advisory JSON).
          </li>
          <li>
            In Message Studio, optional <strong>Campaign Voice AI</strong> runs on the server when{" "}
            <code className="text-[10px]">OPENAI_API_KEY</code> is set — still <strong>no send</strong>; apply suggestions
            manually.
          </li>
          <li>
            <strong>Nothing is auto-sent</strong> — execution requires future governed packets + human approval outside this
            page.
          </li>
        </ol>
      </section>

      <section className={card}>
        <h2 className={h3}>F. Approval path</h2>
        <div className="mt-2 flex flex-wrap items-center gap-1 font-body text-[10px] text-kelly-text/85">
          {[
            "Queue / Audience / Import",
            "→",
            "Message Studio draft",
            "→",
            "Review",
            "→",
            "Approval",
            "→",
            "Future SendGrid / Gmail execution",
          ].map((x, i) => (
            <span key={`${x}-${i}`} className={x === "→" ? "text-kelly-text/40" : "rounded bg-kelly-fog/80 px-1.5 py-0.5"}>
              {x}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-kelly-text/70">
          Queue approvals today are <strong>workflow state</strong> only — not provider sends. Message Studio extends the
          planning story without changing <code className="text-[9px]">EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM</code>.
        </p>
      </section>

      <section className={card}>
        <h2 className={h3}>G. Future send rails</h2>
        <ul className="mt-2 space-y-1 font-body text-[11px] text-kelly-text/85">
          <li>
            <strong>Gmail one-to-one send</strong> — future governed packet; staff OAuth + human composer outside Command
            Center send-from-item flag (remains false).
          </li>
          <li>
            <strong>SendGrid broadcast</strong> — future <span className="font-mono">EMAIL-SEND-EXECUTION-1.0</span> style
            packet; foundation ingestion exists today without list sync or send.
          </li>
          <li>
            <strong>Current status:</strong> <span className="font-semibold text-rose-900">disabled / not implemented on this page</span>.
          </li>
        </ul>
      </section>
    </div>
  );
}
