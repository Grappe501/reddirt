import Link from "next/link";
import { CommunicationThreadStatus, EmailOptInStatus, SmsOptInStatus } from "@prisma/client";
import { getWorkbenchData, getCountiesForOpsFilter } from "@/lib/ops/workbench-queries";
import { formatRoleLabel } from "@/lib/ops/roles";
import {
  getCommsWorkbenchData,
  getThreadForWorkbench,
  listRecentThreads,
  formatQueueItemLabel,
} from "@/lib/comms/workbench-data";
import {
  createCommunicationThreadAction,
  markThreadReadAction,
  updateCommunicationThreadAction,
  createScheduledSmsReminderAction,
  refreshThreadAiInsightAction,
  updateContactPreferenceFromWorkbenchAction,
} from "@/app/admin/workbench-comms-actions";
import { WorkbenchMessageComposer } from "@/components/admin/workbench/WorkbenchMessageComposer";
import { canSendEmail, canSendSms } from "@/lib/comms/preferences";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { prisma } from "@/lib/db";
import { CommsSendProvider } from "@prisma/client";
import { countPendingFestivalIngests } from "@/lib/festivals/admin-queries";
import { listAdminStrategyReferenceAssets } from "@/lib/campaign-ops/admin-strategy-reference";
import { getPressMonitorWorkbenchSummary } from "@/lib/media-monitor/workbench-queries";
import { getSocialWorkbenchSummary } from "@/lib/social/social-workbench-queries";
import { resolveWorkbenchCountyId, isPlausibleId } from "@/lib/workbench/county";
import { getOpenWorkForCampaignManager } from "@/lib/campaign-engine/open-work";
import { getTruthSnapshot } from "@/lib/campaign-engine/truth-snapshot";
import { UnifiedOpenWorkSection } from "@/components/admin/workbench/UnifiedOpenWorkSection";
import { CampaignManagerDashboardBands } from "@/components/admin/workbench/CampaignManagerDashboardBands";

type Props = {
  searchParams: Promise<{ county?: string; thread?: string; error?: string; lane?: string }>;
};

type WorkbenchLane = "all" | "calendar" | "orchestration";

const card =
  "rounded-md border border-deep-soil/10 bg-cream-canvas px-2 py-1.5 shadow-sm min-w-0";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const breakOut = "-mx-6 -mt-10 -mb-10 w-[calc(100%+3rem)] max-w-[calc(100vw-280px-3rem)] min-w-0 px-0 pt-0 pb-6 lg:-mx-12 lg:mt-0 lg:mb-0 lg:w-[calc(100%+6rem)] lg:max-w-none";

function workbenchQ(opts: { county?: string | null; thread?: string | null; lane?: WorkbenchLane }) {
  const u = new URLSearchParams();
  if (opts.county) u.set("county", opts.county);
  if (opts.thread) u.set("thread", opts.thread);
  if (opts.lane === "calendar") u.set("lane", "calendar");
  if (opts.lane === "orchestration") u.set("lane", "orchestration");
  const s = u.toString();
  return s ? `?${s}` : "";
}

export default async function AdminWorkbenchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const err = sp.error;
  const lane: WorkbenchLane =
    sp.lane === "calendar" ? "calendar" : sp.lane === "orchestration" ? "orchestration" : "all";
  const activeThreadId = sp.thread?.trim() || null;
  const cleanThreadId = activeThreadId && isPlausibleId(activeThreadId) ? activeThreadId : null;
  const badThreadParam = Boolean(activeThreadId) && !cleanThreadId;

  let counties: Awaited<ReturnType<typeof getCountiesForOpsFilter>>;
  let countyId: string | null;
  let invalidCounty: boolean;
  let data: Awaited<ReturnType<typeof getWorkbenchData>>;
  let comms: Awaited<ReturnType<typeof getCommsWorkbenchData>>;
  let activeThread: Awaited<ReturnType<typeof getThreadForWorkbench>>;
  let recentForRail: Awaited<ReturnType<typeof listRecentThreads>>;
  let staffGmail: Awaited<ReturnType<typeof prisma.staffGmailAccount.findUnique>>;
  let pendingFestivalIngest: number;
  let adminStrategyRefs: Awaited<ReturnType<typeof listAdminStrategyReferenceAssets>>;
  let pressMonitor: Awaited<ReturnType<typeof getPressMonitorWorkbenchSummary>>;
  let socialSum: Awaited<ReturnType<typeof getSocialWorkbenchSummary>>;
  let uwr1OpenWork: Awaited<ReturnType<typeof getOpenWorkForCampaignManager>>;
  let truthSnapshot: Awaited<ReturnType<typeof getTruthSnapshot>>;

  try {
    counties = await getCountiesForOpsFilter();
    const validCounty = new Set(counties.map((c) => c.id));
    const r = resolveWorkbenchCountyId(sp.county, validCounty);
    countyId = r.countyId;
    invalidCounty = r.invalidParam;

    const actorId = await getAdminActorUserId();
    [
      data,
      comms,
      activeThread,
      recentForRail,
      staffGmail,
      pendingFestivalIngest,
      adminStrategyRefs,
      pressMonitor,
      socialSum,
      uwr1OpenWork,
      truthSnapshot,
    ] = await Promise.all([
      getWorkbenchData({ countyId }),
      getCommsWorkbenchData({ countyId, lane }),
      cleanThreadId ? getThreadForWorkbench(cleanThreadId) : Promise.resolve(null),
      listRecentThreads(countyId, 20),
      actorId
        ? prisma.staffGmailAccount.findUnique({
            where: { userId: actorId, isActive: true },
          })
        : Promise.resolve(null),
      countPendingFestivalIngests().catch(() => 0),
      listAdminStrategyReferenceAssets().catch(() => []),
      getPressMonitorWorkbenchSummary().catch(() => ({
        mentionsToday: 0,
        editorialsOpinion: 0,
        tvMentions: 0,
        responseNeeded: 0,
        needsAmplification: 0,
        pendingReview: 0,
      })),
      getSocialWorkbenchSummary().catch(() => ({ inPipeline: 0, inReview: 0, published: 0 })),
      getOpenWorkForCampaignManager({ limitPerSource: 8, maxTotal: 20 }).catch((): Awaited<
        ReturnType<typeof getOpenWorkForCampaignManager>
      > => []),
      getTruthSnapshot(),
    ]);
  } catch (e) {
    console.error("AdminWorkbenchPage load", e);
    return (
      <div className="border border-red-200/80 bg-red-50/60 px-4 py-5">
        <h1 className="font-heading text-lg font-bold text-deep-soil">Campaign workbench</h1>
        <p className="mt-1 font-body text-sm text-red-900">
          Could not load this page. Check database connectivity, then refresh. If the problem continues, see server logs.
        </p>
        <pre className="mt-2 max-h-32 overflow-auto rounded border border-red-200/50 bg-white/80 p-2 font-mono text-xs text-red-800">
          {e instanceof Error ? e.message : "Unknown error"}
        </pre>
        <a
          href="/admin/workbench"
          className="mt-3 inline-block rounded border border-deep-soil/20 bg-white px-2 py-1 text-sm font-semibold"
        >
          Reset URL and retry
        </a>
      </div>
    );
  }

  const threadNotFound = Boolean(cleanThreadId) && !activeThread;
  const active =
    activeThread && (!countyId || !activeThread.countyId || activeThread.countyId === countyId) ? activeThread : null;
  const threadCountyHidden = Boolean(cleanThreadId) && Boolean(activeThread) && !active;

  const seenThread = new Set<string>();
  const combinedRail: {
    id: string;
    label: string;
    sub: string;
    href: string;
    urgent?: boolean;
    selectThreadId: string | null;
  }[] = [];
  const calPrefix = countyId ? `&countyId=${encodeURIComponent(countyId)}` : "";

  for (const s of comms.orchestrationShells) {
    if (lane === "calendar") break;
    combinedRail.push({
      id: `orch-${s.id}`,
      label: s.name,
      sub: `Auto campaign · ${s.campaignType} · ${s.status}${s.eventTitle ? ` · ${s.eventTitle}` : ""}`,
      href: `/admin/workbench/comms/broadcasts/${s.id}`,
      urgent: s.status === "APPROVAL_NEEDED",
      selectThreadId: null,
    });
  }
  if (lane === "orchestration") {
    for (const t of comms.unreadThreads) {
      if (seenThread.has(t.id)) continue;
      seenThread.add(t.id);
      combinedRail.push({
        id: t.id,
        label: t.primaryPhone ?? t.primaryEmail ?? "Thread",
        sub: t.threadStatus,
        href: `/admin/workbench${workbenchQ({ thread: t.id, county: countyId, lane })}`,
        urgent: t.unreadCount > 0,
        selectThreadId: t.id,
      });
    }
    for (const t of recentForRail) {
      if (seenThread.has(t.id)) continue;
      seenThread.add(t.id);
      combinedRail.push({
        id: t.id,
        label: t.primaryPhone ?? t.primaryEmail ?? t.id.slice(0, 8),
        sub: t.threadStatus,
        href: `/admin/workbench${workbenchQ({ thread: t.id, county: countyId, lane })}`,
        selectThreadId: t.id,
      });
    }
  } else {
  for (const et of data.eventTaskPriority) {
    const eid = et.eventId;
    if (!eid || !et.event) continue;
    const overdue = et.dueAt && et.dueAt < new Date();
    const sub = et.blocksReadiness
      ? "Event task · blocker"
      : overdue
        ? "Event task · overdue"
        : et.taskType === "MEDIA" && et.event.endAt < new Date()
          ? "Event task · media (post-event)"
          : "Event task · due soon";
    combinedRail.push({
      id: `etask-${et.id}`,
      label: `${et.event.title} — ${et.title}`,
      sub,
      href: `/admin/workbench/calendar?event=${encodeURIComponent(eid)}&view=week${calPrefix}`,
      urgent: true,
      selectThreadId: null,
    });
  }
  for (const q of comms.priorityQueue) {
    const selectThreadId = q.threadId ?? null;
    const calHref = q.eventId
      ? `/admin/workbench/calendar?event=${encodeURIComponent(q.eventId)}&view=queue${countyId ? `&countyId=${encodeURIComponent(countyId)}` : ""}`
      : null;
    combinedRail.push({
      id: `q-${q.id}`,
      label: formatQueueItemLabel({
        actionType: q.actionType,
        event: q.event,
        thread: q.thread
          ? { primaryPhone: q.thread.primaryPhone, primaryEmail: q.thread.primaryEmail }
          : null,
      }),
      sub: String(q.actionType).replaceAll("_", " "),
      href:
        calHref ||
        (selectThreadId
          ? `/admin/workbench${workbenchQ({ thread: selectThreadId, county: countyId, lane })}`
          : `/admin/workbench${workbenchQ({ county: countyId, lane })}`),
      urgent: true,
      selectThreadId,
    });
    if (selectThreadId) seenThread.add(selectThreadId);
  }
  for (const t of comms.unreadThreads) {
    if (seenThread.has(t.id)) continue;
    seenThread.add(t.id);
    combinedRail.push({
      id: t.id,
      label: t.primaryPhone ?? t.primaryEmail ?? "Thread",
      sub: t.threadStatus,
      href: `/admin/workbench${workbenchQ({ thread: t.id, county: countyId, lane })}`,
      urgent: t.unreadCount > 0,
      selectThreadId: t.id,
    });
  }
  for (const t of recentForRail) {
    if (seenThread.has(t.id)) continue;
    seenThread.add(t.id);
    combinedRail.push({
      id: t.id,
      label: t.primaryPhone ?? t.primaryEmail ?? t.id.slice(0, 8),
      sub: t.threadStatus,
      href: `/admin/workbench${workbenchQ({ thread: t.id, county: countyId, lane })}`,
      selectThreadId: t.id,
    });
  }
  }

  const canSms = Boolean(active?.primaryPhone);
  const canEmail = Boolean(active?.primaryEmail);
  const defaultMode = canSms ? "SMS" : "EMAIL";
  const effPref = active?.effectivePreference ?? null;
  const smsGate = canSendSms(effPref);
  const emailGate = canSendEmail(effPref);
  const lastGmailOut =
    active?.messages
      .slice()
      .reverse()
      .find((m) => m.provider === CommsSendProvider.GMAIL && m.direction === "OUTBOUND") ?? null;

  return (
    <div className={breakOut}>
      {/* CM-1: De facto Campaign Manager / orchestration hub — see docs/campaign-manager-orchestration-map.md */}
      <div className="border-b border-deep-soil/10 bg-washed-canvas px-2 py-1.5 md:px-3">
        <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-lg font-bold text-deep-soil md:text-xl">Campaign workbench</h1>
            <p className="font-body text-[11px] text-deep-soil/65">
              Communications · {new Date().toLocaleString()}. Dense layout for full HD; side rails stack on small screens.
            </p>
          </div>
          <div className="flex flex-wrap gap-0.5">
            <Link
              href={`/admin/workbench${workbenchQ({ county: null, lane })}`}
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${!countyId && lane === "all" ? "bg-deep-soil text-cream-canvas" : "border border-deep-soil/20 bg-white"}`}
            >
              All
            </Link>
            {counties.map((c) => (
              <Link
                key={c.id}
                href={`/admin/workbench${workbenchQ({ county: c.id, lane })}`}
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  countyId === c.id ? "bg-deep-soil text-cream-canvas" : "border border-deep-soil/20 bg-white"
                }`}
              >
                {c.displayName}
              </Link>
            ))}
            <Link
              href={`/admin/workbench${workbenchQ({ county: countyId, lane: "all" })}`}
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${lane === "all" ? "bg-washed-denim text-cream-canvas" : "border border-washed-denim/30 bg-washed-denim/10 text-civic-slate"}`}
            >
              Queue all
            </Link>
            <Link
              href={`/admin/workbench${workbenchQ({ county: countyId, lane: "calendar" })}`}
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${lane === "calendar" ? "bg-washed-denim text-cream-canvas" : "border border-washed-denim/30 bg-washed-denim/10 text-civic-slate"}`}
            >
              Calendar ops
            </Link>
            <Link
              href={`/admin/workbench${workbenchQ({ county: countyId, lane: "orchestration" })}`}
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${lane === "orchestration" ? "bg-deep-soil text-cream-canvas" : "border border-deep-soil/20 bg-white"}`}
            >
              Automations
            </Link>
            <Link
              href="/admin/workbench/calendar"
              className="rounded border border-washed-denim/40 bg-washed-denim/10 px-1.5 py-0.5 text-[10px] font-bold text-civic-slate"
            >
              Calendar HQ
            </Link>
            <Link
              href="/admin/workbench/festivals"
              className="rounded border border-deep-soil/20 bg-white px-1.5 py-0.5 text-[10px] font-bold text-deep-soil"
            >
              Community events{pendingFestivalIngest > 0 ? ` (${pendingFestivalIngest})` : ""}
            </Link>
            <Link
              href="/admin/workbench/social"
              className="rounded border border-washed-denim/30 bg-cream-canvas px-1.5 py-0.5 text-[10px] font-bold text-civic-slate"
            >
              Social{socialSum.inPipeline + socialSum.inReview > 0 ? ` (${socialSum.inPipeline + socialSum.inReview})` : ""}
            </Link>
            <Link
              href="/admin/workbench/email-queue"
              className="rounded border border-washed-denim/20 bg-cream-canvas px-1.5 py-0.5 text-[10px] font-bold text-civic-slate"
            >
              Email workflow
            </Link>
            <Link
              href="/admin/workbench/positions"
              className="rounded border border-deep-soil/15 bg-cream-canvas px-1.5 py-0.5 text-[10px] font-bold text-deep-soil"
            >
              By position
            </Link>
            <Link
              href="/admin/workbench/seats"
              className="rounded border border-deep-soil/15 bg-cream-canvas px-1.5 py-0.5 text-[10px] font-bold text-deep-soil"
            >
              Seats
            </Link>
          </div>
        </div>
      </div>

      {err ? (
        <p className="px-2 py-1 font-body text-xs text-red-800 md:px-3" role="alert">
          {err === "contact" ? "Add a phone or email to open a new thread." : null}
          {err === "phone" ? "Could not parse phone; use 10 digits or E.164." : null}
          {err === "ai" ? "AI summary could not be generated. Check OpenAI and try again." : null}
          {err === "gmail_not_configured" ? "Gmail OAuth is not configured (set GOOGLE_GMAIL_* or Calendar client + redirect for /api/gmail/oauth/callback)." : null}
          {err === "gmail_needs_actor" ? "Set ADMIN_ACTOR_USER_EMAIL to a User to connect Gmail, then use Connect Gmail in the workbench." : null}
          {!["contact", "phone", "ai", "gmail_not_configured", "gmail_needs_actor"].includes(String(err))
            ? `Error code: ${String(err).replace(/[<>\"']/g, "")}`
            : null}
        </p>
      ) : null}
      {invalidCounty ? (
        <p className="px-2 py-0.5 font-body text-xs text-amber-900 md:px-3" role="status">
          Unknown county in URL — filter cleared. Pick a county chip above.
        </p>
      ) : null}
      {badThreadParam ? (
        <p className="px-2 py-0.5 font-body text-xs text-amber-900 md:px-3" role="status">
          Invalid thread id in URL — open a thread from the left rail.
        </p>
      ) : null}

      <CampaignManagerDashboardBands snapshot={truthSnapshot} />

      <details className="mx-2 mb-1 rounded border border-deep-soil/10 bg-cream-canvas/90 px-2 py-1 md:mx-3">
        <summary className="cursor-pointer font-body text-[10px] font-semibold text-deep-soil/70">
          BRAIN-OPS-2 / BRAIN-OPS-3 truth snapshot (read-only)
        </summary>
        <div className="mt-1 space-y-1.5">
          <div>
            <p className={h2}>County goal mirror</p>
            <pre className="max-h-32 overflow-auto rounded border border-deep-soil/5 bg-white/80 px-1 py-0.5 font-mono text-[9px] leading-snug text-deep-soil/85">
              {JSON.stringify(truthSnapshot.countyGoalMirror, null, 2)}
            </pre>
          </div>
          <div>
            <p className={h2}>Truth metrics</p>
            <pre className="max-h-36 overflow-auto rounded border border-deep-soil/5 bg-white/80 px-1 py-0.5 font-mono text-[9px] leading-snug text-deep-soil/85">
              {JSON.stringify(truthSnapshot.truth, null, 2)}
            </pre>
          </div>
          <div>
            <p className={h2}>Health</p>
            <pre className="max-h-40 overflow-auto rounded border border-deep-soil/5 bg-white/80 px-1 py-0.5 font-mono text-[9px] leading-snug text-deep-soil/85">
              {JSON.stringify(
                {
                  missingData: truthSnapshot.health.missingData,
                  staleData: truthSnapshot.health.staleData,
                  conflicts: truthSnapshot.health.conflicts,
                  warnings: truthSnapshot.health.warnings,
                  warningGroups: truthSnapshot.health.warningGroups,
                },
                null,
                2,
              )}
            </pre>
          </div>
          <div>
            <p className={h2}>Governance</p>
            <pre className="max-h-28 overflow-auto rounded border border-deep-soil/5 bg-white/80 px-1 py-0.5 font-mono text-[9px] leading-snug text-deep-soil/85">
              {JSON.stringify(truthSnapshot.governance, null, 2)}
            </pre>
          </div>
          <p className="font-mono text-[8px] text-deep-soil/50">generatedAt: {truthSnapshot.generatedAt.toISOString()}</p>
        </div>
      </details>

      <UnifiedOpenWorkSection items={uwr1OpenWork} />

      <div className="grid grid-cols-2 gap-1 border-b border-deep-soil/10 bg-cream-canvas/80 px-1 py-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-12">
        <div className={card}>
          <p className={h2}>Needs reply</p>
          <p className="font-heading text-lg font-bold text-red-dirt">{data.commsSummary.needsReplyCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Unread threads</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{data.commsSummary.unreadThreadCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Queue pending</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{data.commsSummary.pendingQueueCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Cal queue</p>
          <p className="font-heading text-lg font-bold text-civic-slate">{data.commsSummary.calendarQueuePending}</p>
          <Link href={`/admin/workbench${workbenchQ({ county: countyId, lane: "calendar" })}`} className="text-[10px] font-semibold text-civic-slate">
            →
          </Link>
        </div>
        <div className={card}>
          <p className={h2}>Auto campaigns</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{data.commsSummary.automationShellCount}</p>
          <Link
            href={`/admin/workbench${workbenchQ({ county: countyId, lane: "orchestration" })}`}
            className="text-[10px] font-semibold text-civic-slate"
          >
            Orchestrate
          </Link>
        </div>
        <div className={card}>
          <p className={h2}>Msg volume today</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{data.commsSummary.messagesTodayCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Open tasks</p>
          <p className="font-heading text-lg font-bold text-red-dirt">{data.openTaskCount}</p>
          <Link href="/admin/tasks" className="text-[10px] font-semibold text-civic-slate">
            →
          </Link>
        </div>
        <div className={card}>
          <p className={h2}>Due today</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{data.tasksDueToday.length}</p>
        </div>
        <div className={card}>
          <p className={h2}>Overdue</p>
          <p className="font-heading text-lg font-bold text-red-800">{data.tasksOverdue.length}</p>
        </div>
        <div className={card}>
          <p className={h2}>Media review</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{data.pendingMediaReview.length}</p>
          <Link href="/admin/owned-media?status=PENDING_REVIEW" className="text-[10px] font-semibold text-civic-slate">
            →
          </Link>
        </div>
        <div className={card}>
          <p className={h2}>Events ingest</p>
          <p className={`font-heading text-lg font-bold ${pendingFestivalIngest > 0 ? "text-amber-900" : "text-deep-soil"}`}>
            {pendingFestivalIngest}
          </p>
          <Link href="/admin/workbench/festivals" className="text-[10px] font-semibold text-civic-slate">
            Review
          </Link>
        </div>
        <div className={card}>
          <p className={h2}>Social workbench</p>
          <p className="font-heading text-lg font-bold text-deep-soil">
            {socialSum.inPipeline + socialSum.inReview > 0 ? socialSum.inPipeline + socialSum.inReview : "—"}
          </p>
          <Link href="/admin/workbench/social" className="text-[10px] font-semibold text-civic-slate">
            Open
          </Link>
        </div>
        <div className={card}>
          <p className={h2}>Press today</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{pressMonitor.mentionsToday}</p>
          <Link href="/admin/media-monitor" className="text-[10px] font-semibold text-civic-slate">
            Monitor
          </Link>
        </div>
        <div className={card}>
          <p className={h2}>Press · review</p>
          <p className={`font-heading text-lg font-bold ${pressMonitor.pendingReview > 0 ? "text-amber-900" : "text-deep-soil"}`}>
            {pressMonitor.pendingReview}
          </p>
          <Link href="/admin/media-monitor?review=PENDING" className="text-[10px] font-semibold text-civic-slate">
            Queue
          </Link>
        </div>
        <div className={card}>
          <p className={h2}>Press · respond</p>
          <p className={`font-heading text-lg font-bold ${pressMonitor.responseNeeded > 0 ? "text-red-dirt" : "text-deep-soil"}`}>
            {pressMonitor.responseNeeded}
          </p>
          <Link href="/admin/media-monitor?flags=response" className="text-[10px] font-semibold text-civic-slate">
            Filter
          </Link>
        </div>
      </div>

      <div className="grid min-h-[520px] grid-cols-1 divide-y divide-deep-soil/10 border-b border-deep-soil/10 xl:min-h-[calc(100vh-220px)] xl:grid-cols-[minmax(260px,360px)_1fr_minmax(260px,360px)] xl:divide-x xl:divide-y-0">
        <aside className="flex max-h-[50vh] flex-col overflow-hidden bg-cream-canvas/50 xl:max-h-none">
          <div className="border-b border-deep-soil/10 px-2 py-1">
            <p className={h2}>
              {lane === "orchestration" ? "Automation shells + threads" : "Priority queue + threads"}
            </p>
            <p className="mt-0.5 font-body text-[10px] text-deep-soil/55">
              {lane === "orchestration"
                ? "Event-linked auto campaigns (not sent) first; then recent threads."
                : "Queue first, then unread, then recency."}
            </p>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto p-1 text-[11px]">
            {combinedRail.length === 0 ? (
              <li className="px-1 text-deep-soil/55">No items yet. Create a thread below.</li>
            ) : (
              combinedRail.map((row) => (
                <li key={row.id}>
                  <Link
                    href={row.href}
                    className={`block rounded border border-transparent px-1 py-0.5 hover:border-deep-soil/15 hover:bg-white/80 ${
                      row.selectThreadId && activeThreadId && row.selectThreadId === activeThreadId
                        ? "border-deep-soil/20 bg-white/90"
                        : ""
                    }`}
                  >
                    <span className={`block truncate font-medium ${row.urgent ? "text-red-dirt" : "text-deep-soil"}`}>
                      {row.label}
                    </span>
                    <span className="text-[9px] text-deep-soil/50">{row.sub}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-deep-soil/10 p-1">
            <p className={`${h2} mb-0.5`}>New thread</p>
            <form action={createCommunicationThreadAction} className="grid gap-0.5">
              <input type="hidden" name="countyId" value={countyId ?? ""} />
              <input
                name="primaryPhone"
                placeholder="Phone"
                maxLength={32}
                autoComplete="off"
                className="w-full border border-deep-soil/15 bg-white px-1 font-mono text-[10px]"
              />
              <input
                name="primaryEmail"
                type="email"
                maxLength={320}
                autoComplete="off"
                placeholder="Email"
                className="w-full border border-deep-soil/15 bg-white px-1 font-mono text-[10px]"
              />
              <select
                name="preferredChannel"
                className="w-full border border-deep-soil/15 bg-white px-0.5 text-[10px]"
                defaultValue="SMS"
              >
                <option value="SMS">SMS</option>
                <option value="EMAIL">Email</option>
              </select>
              <button
                type="submit"
                className="rounded border border-deep-soil/20 bg-deep-soil/90 px-1 py-0.5 text-[10px] font-bold text-cream-canvas"
              >
                Open thread
              </button>
            </form>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col bg-white/40">
          {active ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-1 border-b border-deep-soil/10 px-2 py-1">
                <div>
                  <h2 className="font-heading text-sm font-bold text-deep-soil">Active thread</h2>
                  <p className="font-mono text-[10px] text-deep-soil/70">
                    {active.primaryPhone ?? "—"} · {active.primaryEmail ?? "—"} · {active.id.slice(0, 12)}…
                  </p>
                </div>
                <form action={markThreadReadAction} className="m-0">
                  <input type="hidden" name="threadId" value={active.id} />
                  <button
                    type="submit"
                    className="rounded border border-deep-soil/15 bg-cream-canvas px-1.5 py-0.5 text-[10px] font-semibold"
                  >
                    Mark read
                  </button>
                </form>
              </div>
              <div className="border-b border-deep-soil/10 bg-cream-canvas/40 px-2 py-1.5 text-[10px] text-deep-soil/80">
                <p className={h2}>AI triage (refresh to update)</p>
                {active.aiThreadSummary || active.aiNextBestAction ? (
                  <div className="mt-0.5 space-y-0.5">
                    {active.aiThreadSummary ? <p className="whitespace-pre-wrap font-body">{active.aiThreadSummary}</p> : null}
                    {active.aiNextBestAction ? (
                      <p className="font-semibold text-civic-slate">Next: {active.aiNextBestAction}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-deep-soil/50">No summary yet. Use the button below the composer.</p>
                )}
                <form action={refreshThreadAiInsightAction} className="mt-1">
                  <input type="hidden" name="threadId" value={active.id} />
                  <input type="hidden" name="countyId" value={countyId ?? ""} />
                  <button
                    type="submit"
                    className="rounded border border-washed-denim/30 bg-white px-1.5 py-0.5 text-[9px] font-bold text-civic-slate"
                  >
                    Refresh AI summary + next step
                  </button>
                </form>
                {active.nextActionDueAt ? (
                  <p className="mt-0.5 text-[9px] text-deep-soil/55">
                    Staff due: {active.nextActionDueAt.toLocaleString()}
                  </p>
                ) : null}
              </div>
              <ul className="min-h-0 max-h-[min(50vh,420px)] flex-1 overflow-y-auto border-b border-deep-soil/10 p-1 font-mono text-[10px] leading-relaxed md:max-h-[min(45vh,520px)]">
                {active.messages.map((m) => (
                  <li
                    key={m.id}
                    className={`mb-1 max-w-full whitespace-pre-wrap break-words border-l-2 pl-1 ${
                      m.direction === "INBOUND" ? "border-washed-denim bg-cream-canvas/30" : "border-red-dirt/30 bg-white/50"
                    }`}
                  >
                    <span className="text-deep-soil/45">
                      {m.channel} {m.provider} {m.direction} {m.deliveryStatus}{" "}
                      {m.createdAt.toLocaleString()}
                    </span>
                    {m.subject ? <span className="block font-semibold text-deep-soil/80">Subj: {m.subject}</span> : null}
                    {m.bodyText}
                  </li>
                ))}
              </ul>
              <WorkbenchMessageComposer
                threadId={active.id}
                canSms={canSms}
                canEmail={canEmail}
                defaultMode={defaultMode}
                initialSubject="Following up from the campaign"
                smsBlocked={smsGate.ok ? null : smsGate.reason}
                emailBlocked={emailGate.ok ? null : emailGate.reason}
                gmailConnected={Boolean(staffGmail)}
                gmailSendAs={staffGmail?.sendAsEmail ?? null}
                gmailReplyAnchorId={lastGmailOut?.id ?? null}
              />
              <p className="mt-0.5 px-2 text-[9px] text-deep-soil/50">
                {staffGmail ? (
                  <span>
                    Staff Gmail: <span className="font-mono">{staffGmail.sendAsEmail}</span>
                  </span>
                ) : (
                  <a
                    className="font-semibold text-civic-slate"
                    href="/api/gmail/oauth/start"
                    target="_self"
                  >
                    Connect staff Gmail
                  </a>
                )}{" "}
                · SendGrid = broadcast/structured. Gmail = human 1:1.
              </p>
            </>
          ) : (
            <div className="p-3 font-body text-xs text-deep-soil/60">
              {threadNotFound && !badThreadParam ? (
                <p className="mb-2 rounded border border-amber-200/80 bg-amber-50/80 px-2 py-1 text-amber-950">
                  Thread not found (id may have been deleted or pasted incorrectly).{" "}
                  <Link
                    className="font-semibold text-civic-slate underline"
                    href={`/admin/workbench${workbenchQ({ county: countyId, lane })}`}
                  >
                    Clear thread
                  </Link>
                </p>
              ) : null}
              {threadCountyHidden ? (
                <p className="mb-2 rounded border border-amber-200/80 bg-amber-50/80 px-2 py-1 text-amber-950">
                  This thread is in another county.{" "}
                  <Link
                    className="font-semibold text-civic-slate underline"
                    href={`/admin/workbench${workbenchQ({ thread: cleanThreadId, county: null, lane })}`}
                  >
                    View without county filter
                  </Link>{" "}
                  or change the county tab above.
                </p>
              ) : null}
              Select a thread in the left rail, or open a new one. Webhooks:{" "}
              <code className="rounded bg-cream-canvas px-0.5">/api/webhooks/twilio</code>,{" "}
              <code className="rounded bg-cream-canvas px-0.5">/api/webhooks/sendgrid</code>.
            </div>
          )}
        </section>

        <aside className="flex flex-col border-t border-deep-soil/10 bg-cream-canvas/40 xl:border-t-0">
          {active ? (
            <>
              <div className="border-b border-deep-soil/10 px-2 py-1">
                <h3 className="font-heading text-xs font-bold text-deep-soil">Supporter / volunteer context</h3>
              </div>
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-1.5 text-[11px]">
                <p>
                  <span className="text-deep-soil/45">Status:</span> {active.threadStatus} · u/{active.unreadCount} · p/
                  {active.priorityScore}
                </p>
                {active.assignedRoleKey ? (
                  <p>
                    <span className="text-deep-soil/45">Target role:</span> {formatRoleLabel(active.assignedRoleKey)}
                  </p>
                ) : null}
                {active.user ? (
                  <p>
                    <span className="text-deep-soil/45">User:</span> {active.user.name ?? active.user.email}
                    {active.user.phone ? <span className="ml-1 font-mono">· {active.user.phone}</span> : null}
                  </p>
                ) : null}
                {active.user?.linkedVoterRecord ? (
                  <p>
                    <span className="text-deep-soil/45">Voter file:</span> {active.user.linkedVoterRecord.countySlug}{" "}
                    {[active.user.linkedVoterRecord.firstName, active.user.linkedVoterRecord.lastName]
                      .filter(Boolean)
                      .join(" ") || "—"}
                    {active.user.linkedVoterRecord.precinct ? ` · p${active.user.linkedVoterRecord.precinct}` : ""}
                  </p>
                ) : null}
                {active.volunteerProfile ? (
                  <p>
                    <span className="text-deep-soil/45">Volunteer:</span>{" "}
                    {active.volunteerProfile.user.name ?? active.volunteerProfile.user.email}
                    {active.volunteerProfile.user.phone ? (
                      <span className="ml-1 font-mono">· {active.volunteerProfile.user.phone}</span>
                    ) : null}
                  </p>
                ) : null}
                {active.county ? (
                  <p>
                    <span className="text-deep-soil/45">County:</span> {active.county.displayName}
                  </p>
                ) : null}
                {active.tagAssignments.length ? (
                  <ul className="mt-0.5 flex flex-wrap gap-0.5">
                    {active.tagAssignments.map((a) => (
                      <li
                        key={a.tagId}
                        className="rounded border border-deep-soil/15 bg-white/80 px-1 py-0.5 text-[9px] font-mono"
                      >
                        {a.tag.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[10px] text-deep-soil/50">No tags (seed CommunicationTag + assign later).</p>
                )}

                <div className="mt-1 space-y-0.5 border-t border-deep-soil/10 pt-1">
                  <p className="text-[9px] font-bold uppercase text-deep-soil/45">Contact compliance</p>
                  <p className="text-[9px] text-deep-soil/55">
                    Email: {effPref?.emailOptInStatus ?? "—"} · SMS: {effPref?.smsOptInStatus ?? "—"}{" "}
                    {effPref?.globalUnsubscribeAt ? "· global email unsub" : ""}
                    {effPref?.smsOptOutAt ? "· SMS opt-out at " + effPref.smsOptOutAt.toLocaleString() : ""}
                  </p>
                  <form action={updateContactPreferenceFromWorkbenchAction} className="grid gap-0.5">
                    <input type="hidden" name="threadId" value={active.id} />
                    <div className="flex flex-wrap gap-1">
                      <label className="text-[9px] text-deep-soil/45">
                        Email
                        <select
                          name="emailOptInStatus"
                          defaultValue={effPref?.emailOptInStatus ?? EmailOptInStatus.UNKNOWN}
                          className="ml-0.5 border border-deep-soil/15 bg-white text-[9px]"
                        >
                          {Object.values(EmailOptInStatus).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-[9px] text-deep-soil/45">
                        SMS
                        <select
                          name="smsOptInStatus"
                          defaultValue={effPref?.smsOptInStatus ?? SmsOptInStatus.UNKNOWN}
                          className="ml-0.5 border border-deep-soil/15 bg-white text-[9px]"
                        >
                          {Object.values(SmsOptInStatus).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="flex items-center gap-0.5 text-[9px] text-deep-soil/55">
                      <input type="checkbox" name="globalUnsubscribe" defaultChecked={Boolean(effPref?.globalUnsubscribeAt)} />
                      Global email unsubscribe
                    </label>
                    <button type="submit" className="w-fit rounded border border-deep-soil/20 bg-white px-1 py-0.5 text-[9px] font-bold">
                      Save opt-in / suppression
                    </button>
                  </form>
                </div>

                <form action={updateCommunicationThreadAction} className="mt-1 space-y-0.5 border-t border-deep-soil/10 pt-1">
                  <input type="hidden" name="threadId" value={active.id} />
                  <label className="block text-[9px] text-deep-soil/45">Thread status</label>
                  <select
                    name="threadStatus"
                    defaultValue={active.threadStatus}
                    className="w-full border border-deep-soil/15 bg-white px-0.5 text-[10px]"
                  >
                    {Object.values(CommunicationThreadStatus).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <label className="mt-0.5 block text-[9px] text-deep-soil/45">Assign role (text key)</label>
                  <input
                    name="assignedRoleKey"
                    defaultValue={active.assignedRoleKey ?? ""}
                    placeholder="e.g. volunteer_coordinator"
                    className="w-full border border-deep-soil/15 bg-white px-0.5 text-[10px]"
                  />
                  <label className="mt-0.5 block text-[9px] text-deep-soil/45">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={active.notes ?? ""}
                    className="w-full border border-deep-soil/15 bg-white p-0.5 text-[10px]"
                  />
                  <label className="mt-0.5 block text-[9px] text-deep-soil/45">Next action due (staff)</label>
                  <input
                    name="nextActionDueAt"
                    type="datetime-local"
                    defaultValue={
                      active.nextActionDueAt
                        ? new Date(active.nextActionDueAt.getTime() - active.nextActionDueAt.getTimezoneOffset() * 60000)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    className="w-full border border-deep-soil/15 bg-white px-0.5 text-[10px]"
                  />
                  <button
                    type="submit"
                    className="mt-0.5 rounded border border-deep-soil/20 bg-white px-1 py-0.5 text-[10px] font-bold"
                  >
                    Save
                  </button>
                </form>
                <form action={createScheduledSmsReminderAction} className="mt-1 border-t border-deep-soil/10 pt-1">
                  <p className="text-[9px] font-bold uppercase text-deep-soil/45">Schedule reminder (queue row)</p>
                  <input type="hidden" name="threadId" value={active.id} />
                  <input
                    name="scheduledAt"
                    type="datetime-local"
                    className="mt-0.5 w-full border border-deep-soil/15 bg-white text-[10px]"
                  />
                  <button
                    type="submit"
                    className="mt-0.5 rounded border border-deep-soil/15 bg-cream-canvas px-1 py-0.5 text-[10px] font-semibold"
                  >
                    Add to queue
                  </button>
                </form>
                <div className="border-t border-deep-soil/10 pt-1 text-[9px] text-deep-soil/45">
                  <p className="font-bold uppercase">Ops snapshot (read-only here)</p>
                  <p>Upcoming: {data.upcomingEvents[0]?.title ?? "—"}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-2 font-body text-[11px] text-deep-soil/55">Select a thread to see supporter context and notes.</div>
          )}
        </aside>
      </div>

      <div className="mt-0 grid grid-cols-1 gap-1 border-b border-deep-soil/10 bg-cream-canvas/60 px-1 py-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6">
        <div className={card}>
          <h2 className="font-heading text-xs font-bold text-deep-soil">Tasks due today</h2>
          <ul className="mt-0.5 max-h-28 overflow-y-auto text-[10px]">
            {data.tasksDueToday.length === 0 ? (
              <li className="text-deep-soil/55">None</li>
            ) : (
              data.tasksDueToday.map((t) => (
                <li key={t.id} className="truncate border-b border-deep-soil/5 py-0.5">
                  {t.title}
                </li>
              ))
            )}
          </ul>
        </div>
        <div className={card}>
          <h2 className="font-heading text-xs font-bold text-deep-soil">Upcoming events</h2>
          <ul className="mt-0.5 max-h-28 overflow-y-auto text-[10px]">
            {data.upcomingEvents.length === 0 ? (
              <li className="text-deep-soil/55">None</li>
            ) : (
              data.upcomingEvents.map((e) => (
                <li key={e.id} className="truncate">
                  <Link href={`/admin/events/${e.id}`} className="text-civic-slate">
                    {e.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className={card}>
          <h2 className="font-heading text-xs font-bold text-deep-soil">Signup intake / media</h2>
          <p className="mt-0.5 text-[10px]">
            Pending rows: {data.pendingSignupIntakeRows} · Media inbox: {data.pendingMediaReview.length}
          </p>
          <div className="mt-0.5 flex flex-wrap gap-1 text-[10px]">
            <Link className="text-civic-slate" href="/admin/volunteers/intake">
              Intake
            </Link>
            <Link className="text-civic-slate" href="/admin/owned-media/batches">
              Batches
            </Link>
            <Link className="text-civic-slate" href="/admin/owned-media/grid">
              Grid
            </Link>
          </div>
        </div>
        <div className={card}>
          <h2 className="font-heading text-xs font-bold text-deep-soil">Earned media (press)</h2>
          <p className="mt-0.5 text-[10px] leading-snug text-deep-soil/70">
            New today: <strong>{pressMonitor.mentionsToday}</strong> · Editorials/op-eds:{" "}
            <strong>{pressMonitor.editorialsOpinion}</strong> · TV rows: <strong>{pressMonitor.tvMentions}</strong> ·
            Amplify flagged: <strong>{pressMonitor.needsAmplification}</strong>
          </p>
          <div className="mt-0.5 flex flex-wrap gap-1 text-[10px]">
            <Link className="text-civic-slate" href="/admin/media-monitor">
              All mentions
            </Link>
            <Link className="text-civic-slate" href="/admin/media-monitor?type=TV">
              TV
            </Link>
            <Link className="text-civic-slate" href="/admin/media-monitor?flags=editorial">
              Editorial/opinion
            </Link>
            <Link className="text-civic-slate" href="/admin/media-monitor?flags=amplify">
              Amplify
            </Link>
            <Link className="text-civic-slate" href="/press-coverage" target="_blank" rel="noreferrer">
              Public page
            </Link>
          </div>
        </div>
        <div className={card}>
          <h2 className="font-heading text-xs font-bold text-deep-soil">Strategy & coordination</h2>
          <p className="mt-0.5 text-[10px] text-deep-soil/60">
            Staff playbooks (e.g. DNC) — not public. Run{" "}
            <code className="rounded bg-deep-soil/5 px-0.5">npm run ingest:dnc-playbook</code> after updating the file.
          </p>
          <ul className="mt-0.5 max-h-20 overflow-y-auto text-[10px]">
            {adminStrategyRefs.length === 0 ? (
              <li className="text-deep-soil/50">None ingested yet</li>
            ) : (
              adminStrategyRefs.map((a) => (
                <li key={a.id} className="truncate border-b border-deep-soil/5 py-0.5">
                  <Link href={`/admin/owned-media/${a.id}`} className="text-civic-slate" title={a.fileName}>
                    {a.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

