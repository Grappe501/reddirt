"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";
import type { FactCardSection } from "@/lib/campaign-events/types";
import type { ApprovalPackagePayload } from "@/lib/campaign-events/approval-package";
import type { AiObservationEntry } from "@/lib/campaign-events/ai-tools/observations";
import { APPROVAL_STATUS_LABELS } from "@/lib/campaign-events/approval-timeline";
import { COMMUNICATION_NOTE_TYPE_LABELS, type EventCommunicationNoteType } from "@/lib/campaign-events/event-communication";
import { AUTOMATION_NEEDS_FUTURE } from "@/lib/campaign-events/review-meta";
import { addEventCommunicationNoteAction } from "@/app/admin/(board)/campaign-events/actions";
import { CountyWorkbenchLink } from "@/components/admin/CountyWorkbenchLink";
import { CampaignEventCard } from "./CampaignEventFactCard";
import { EventReviewModal } from "./EventReviewModal";
import { ApprovalPackagePreviewPanel } from "./ApprovalPackagePreviewPanel";
import { HotWashMediaSection } from "./hot-wash/HotWashMediaSection";
import type { HotWashMediaRecord } from "@/lib/campaign-events/media/hot-wash-media-types";
import type { HotWashNotes } from "@/lib/campaign-events/hot-wash-notes";
import type { HotWashIntelligenceData } from "@/lib/campaign-events/hot-wash-intelligence/hot-wash-intelligence-types";
import { reimbursementHref, travelLogHref } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";
import { CalendarSyncTruthPanel } from "./CalendarSyncTruthPanel";
import { PromotionAuditPanel } from "./PromotionAuditPanel";
import type { PromotionAuditEntry } from "@/lib/campaign-events/calendar-promotion/promotion-audit";
import type { EventPlanningData } from "@/lib/campaign-events/event-planning/event-planning-types";
import { EventPlanningWorkbook } from "./planning/EventPlanningWorkbook";
import type { EventFinanceData } from "@/lib/campaign-events/finance/finance-types";
import type { FinanceDocumentRecord } from "@/lib/campaign-events/finance/finance-document-types";
import { EventFinancialOperationsWorkspace } from "./finance/EventFinancialOperationsWorkspace";
import { EventCountyIntelligenceCard } from "@/components/admin/county-intelligence/EventCountyIntelligenceCard";
import { HotWashCountyImpactPanel } from "@/components/admin/county-intelligence/HotWashCountyImpactPanel";
import type { CountyIntelligenceSummary } from "@/lib/agents/county-intelligence/county-kpi-types";
import type { CountyHotWashImpactV2 } from "@/lib/agents/county-intelligence/county-hotwash-impact";
import { EventVolunteerPlanningPanel } from "@/components/admin/volunteers/EventVolunteerPlanningPanel";
import type { EventVolunteerContext } from "@/lib/campaign-events/volunteers/load-event-volunteer-context";

const TABS = [
  "overview",
  "fact_card",
  "travel",
  "run_of_show",
  "hot_wash",
  "costs",
  "team_notes",
  "approval",
  "communication",
  "attachments",
  "automation",
] as const;

type TabId = (typeof TABS)[number];

const TAB_LABELS: Record<TabId, string> = {
  overview: "Overview",
  fact_card: "Fact Card",
  travel: "Travel",
  run_of_show: "Run of Show",
  hot_wash: "Hot Wash",
  costs: "Financial Ops",
  team_notes: "Team Notes",
  approval: "Approval History",
  communication: "Communication",
  attachments: "Attachments",
  automation: "Automation Timeline",
};

export function EventDrilldownClient({
  row,
  initialPlanning,
  mediaItems = [],
  mediaByUploader = [],
  hotWashNotes = {},
  hotWashIntelligence,
  initialFinance,
  financeDocuments = [],
  fromTravel = false,
  returnMonth,
  approvalPackage,
  approvalObservations = [],
  promotionAuditEntries = [],
  countyContext = null,
  hotWashCountyImpact = null,
  volunteerContext = null,
}: {
  row: CalendarSurfaceRow;
  initialPlanning: EventPlanningData;
  mediaItems?: HotWashMediaRecord[];
  mediaByUploader?: Array<{ uploaderName: string; uploaderEmail: string; uploads: HotWashMediaRecord[] }>;
  hotWashNotes?: HotWashNotes;
  hotWashIntelligence: HotWashIntelligenceData;
  initialFinance: EventFinanceData;
  financeDocuments?: FinanceDocumentRecord[];
  fromTravel?: boolean;
  returnMonth?: string;
  approvalPackage?: ApprovalPackagePayload;
  approvalObservations?: AiObservationEntry[];
  promotionAuditEntries?: PromotionAuditEntry[];
  countyContext?: CountyIntelligenceSummary | null;
  hotWashCountyImpact?: CountyHotWashImpactV2 | null;
  volunteerContext?: EventVolunteerContext | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId | "planning">("planning");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [noteBody, setNoteBody] = useState("");
  const [noteType, setNoteType] = useState<EventCommunicationNoteType>("internal");
  const pkg = approvalPackage;

  const section = (id: string) => row.sections.find((s) => s.id === id);

  const addNote = () => {
    if (!noteBody.trim()) return;
    startTransition(async () => {
      await addEventCommunicationNoteAction(row.recordId, noteType, noteBody);
      setNoteBody("");
      router.refresh();
    });
  };

  const month = returnMonth ?? row.dateYmd.slice(0, 7);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 pb-12">
      {fromTravel && month ? (
        <section className="rounded-2xl border border-kelly-navy/25 bg-kelly-navy/[0.06] p-4 font-body text-sm">
          <p className="font-bold text-kelly-navy">Travel reimbursement correction</p>
          <p className="mt-1 text-kelly-muted">
            Edits here update the internal campaign ledger. Google Calendar sync is not enabled yet.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
            <Link href={travelLogHref(month)} className="text-kelly-navy underline">
              ← Tentative travel log
            </Link>
            <Link href={reimbursementHref(month)} className="underline">
              Official reimbursement request
            </Link>
            <button type="button" className="rounded-full bg-kelly-navy px-3 py-1 text-white" onClick={() => setReviewOpen(true)}>
              Open review modal
            </button>
          </div>
        </section>
      ) : null}

      <nav className="flex flex-wrap gap-1 rounded-2xl border border-kelly-text/10 bg-kelly-wash p-2 print:hidden">
        <button
          type="button"
          onClick={() => setTab("planning")}
          className={`rounded-full px-3 py-1.5 font-body text-xs font-bold ${tab === "planning" ? "bg-kelly-navy text-white" : "text-kelly-muted"}`}
        >
          Planning workbook
        </button>
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 font-body text-xs font-bold ${tab === id ? "bg-kelly-navy text-white" : "text-kelly-muted"}`}
          >
            {TAB_LABELS[id]}
          </button>
        ))}
        <button
          type="button"
          className="ml-auto rounded-full border border-kelly-navy/30 px-3 py-1.5 font-body text-xs font-bold text-kelly-navy"
          onClick={() => setReviewOpen(true)}
        >
          Quick review
        </button>
      </nav>

      {tab === "planning" ? (
        <>
          {volunteerContext ? <EventVolunteerPlanningPanel context={volunteerContext} /> : null}
          <EventPlanningWorkbook row={row} initialPlanning={initialPlanning} returnMonth={returnMonth} />
        </>
      ) : null}

      {tab !== "planning" && tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <CalendarSyncTruthPanel row={row} />
          <PromotionAuditPanel entries={promotionAuditEntries} />
          <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 font-body text-sm">
            <h2 className="font-heading font-bold">Operational snapshot</h2>
            <p className="mt-2">Decision: {row.decisionLabel ?? "Pending"}</p>
            <p>Review: {row.reviewStatus}</p>
            <p>Travel: {row.travelLine}</p>
            <p>Missing fields: {row.persistedMissingCount}</p>
            {row.surface.alerts.map((a) => (
              <p key={a.key} className="mt-1 text-amber-900">
                {a.label}
              </p>
            ))}
          </div>
          {pkg ? (
            <ApprovalPackagePreviewPanel payload={pkg} recordId={row.recordId} compact observations={approvalObservations} />
          ) : null}
        </div>
      )}

      {tab !== "planning" && tab === "fact_card" && <CampaignEventCard row={row} />}

      {tab !== "planning" && tab === "travel" && (
        <PlaceholderOrFields title="Travel" section={section("travel")} extra={<p className="font-body text-sm">{row.travelLine}</p>} />
      )}

      {tab !== "planning" && tab === "run_of_show" && (
        <p className="font-body text-sm text-kelly-muted">Run of show lives in the Planning workbook tab.</p>
      )}
      {tab !== "planning" && tab === "hot_wash" && (
        <>
          {hotWashCountyImpact ? <HotWashCountyImpactPanel impact={hotWashCountyImpact} /> : null}
        <HotWashMediaSection
          recordId={row.recordId}
          row={row}
          eventTitle={row.calendar.title}
          countyLabel={row.county}
          mediaItems={mediaItems}
          byUploader={mediaByUploader}
          hotWashNotes={hotWashNotes}
          hotWashIntelligence={hotWashIntelligence}
        />
        </>
      )}
      {tab !== "planning" && tab === "costs" && (
        <EventFinancialOperationsWorkspace row={row} initial={initialFinance} documents={financeDocuments} />
      )}
      {tab !== "planning" && tab === "team_notes" && (
        <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 font-body text-sm">
          <p>{row.factCard.why.campaignPurpose || "No team notes on fact card yet."}</p>
          <p className="mt-2 text-kelly-muted">Use Communication tab for threaded notes by role.</p>
        </div>
      )}

      {tab !== "planning" && tab === "approval" && (
        <div className="space-y-4">
          <ol className="space-y-2">
            {row.approvalTimeline.map((t) => (
              <li key={t.status} className="flex items-center gap-3 rounded-lg border border-kelly-text/10 px-3 py-2 font-body text-sm">
                <span className="font-bold">{APPROVAL_STATUS_LABELS[t.status]}</span>
                {t.at ? <span className="text-xs text-kelly-subtle">{new Date(t.at).toLocaleString()}</span> : <span className="text-xs text-kelly-text/40">Pending</span>}
              </li>
            ))}
          </ol>
          {pkg ? (
            <ApprovalPackagePreviewPanel payload={pkg} recordId={row.recordId} observations={approvalObservations} />
          ) : null}
        </div>
      )}

      {tab !== "planning" && tab === "communication" && (
        <div className="space-y-4">
          <ul className="space-y-2">
            {row.communicationThread.length === 0 ? (
              <li className="font-body text-sm text-kelly-muted">No notes yet — foundation for host, CM, candidate, and volunteer threads.</li>
            ) : (
              row.communicationThread.map((n) => (
                <li key={n.id} className="rounded-lg border border-kelly-text/10 px-3 py-2 font-body text-sm">
                  <p className="text-xs font-bold text-kelly-slate">
                    {COMMUNICATION_NOTE_TYPE_LABELS[n.noteType]} · {n.author} · {new Date(n.at).toLocaleString()}
                  </p>
                  <p className="mt-1">{n.body}</p>
                </li>
              ))
            )}
          </ul>
          <div className="rounded-2xl border border-dashed border-kelly-navy/25 p-4">
            <p className="font-body text-xs font-bold uppercase text-kelly-slate">Add note (local persistence)</p>
            <select className="mt-2 w-full rounded-lg border px-3 py-2 font-body text-sm" value={noteType} onChange={(e) => setNoteType(e.target.value as EventCommunicationNoteType)}>
              {Object.entries(COMMUNICATION_NOTE_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <textarea className="mt-2 w-full rounded-lg border px-3 py-2 font-body text-sm" rows={3} value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Logistics update, host follow-up, etc." />
            <button type="button" disabled={pending} className="mt-2 rounded-full bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white" onClick={addNote}>
              Save note
            </button>
          </div>
        </div>
      )}

      {tab !== "planning" && tab === "attachments" && (
        <div className="rounded-2xl border border-dashed border-kelly-text/20 p-8 text-center font-body text-sm text-kelly-muted">
          Attachments placeholder — receipts, run-of-show PDFs, and host agreements will land here (not receipts system yet).
        </div>
      )}

      {tab !== "planning" && tab === "automation" && (
        <ul className="grid gap-2 font-body text-sm">
          {AUTOMATION_NEEDS_FUTURE.map((a) => (
            <li key={a} className="rounded-lg border border-kelly-text/10 px-3 py-2 text-kelly-muted">
              {a.replaceAll("_", " ")} — planned
            </li>
          ))}
        </ul>
      )}

      {reviewOpen ? (
        <EventReviewModal
          recordId={row.recordId}
          onClose={() => {
            setReviewOpen(false);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function PlaceholderOrFields({
  title,
  section,
  placeholder,
  extra,
}: {
  title: string;
  section?: FactCardSection;
  placeholder?: string;
  extra?: React.ReactNode;
}) {
  const s = section;
  return (
    <div className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
      <h2 className="font-heading font-bold">{title}</h2>
      {extra}
      {placeholder && !s?.fields?.length ? <p className="mt-2 font-body text-sm text-kelly-muted">{placeholder}</p> : null}
      <dl className="mt-3 grid gap-2 sm:grid-cols-2 font-body text-sm">
        {s?.fields?.map((f) => (
          <div key={f.label}>
            <dt className="text-xs text-kelly-subtle">{f.label}</dt>
            <dd>{f.value || (f.status === "missing" ? "—" : "")}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
