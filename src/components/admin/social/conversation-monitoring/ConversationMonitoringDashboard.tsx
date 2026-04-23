"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Building2, Layers, ListFilter, MapPin, Radio, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  addConversationItemToCandidateBriefAction,
  analyzeConversationItemAction,
  analyzeRecentUnanalyzedConversationItemsAction,
  createClarificationPostFromConversationItemAction,
  createFaqDraftFromConversationItemAction,
  createRapidResponseFromConversationItemAction,
  getConversationItemDetailForWorkbenchAction,
  routeConversationItemToCountyAction,
} from "@/app/admin/conversation-monitoring-actions";
import type {
  ConversationClusterListRow,
  ConversationItemDetail,
  ConversationItemListRow,
  ConversationMonitoringSummary,
  ConversationOpportunityListRow,
} from "@/lib/conversation-monitoring/conversation-monitoring-dto";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  UiBadge,
  UiButton,
  UiScrollArea,
} from "../social-ui-primitives";
import { cn } from "@/lib/utils";

type ViewId = "feed" | "clusters" | "opportunities" | "counties";

type Props = {
  summary: ConversationMonitoringSummary;
  initialItems: ConversationItemListRow[];
  clusters: ConversationClusterListRow[];
  opportunities: ConversationOpportunityListRow[];
  countyOptions: { id: string; displayName: string }[];
};

export function ConversationMonitoringDashboard({
  summary,
  initialItems,
  clusters,
  opportunities,
  countyOptions,
}: Props) {
  const router = useRouter();
  const [view, setView] = useState<ViewId>("feed");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialItems[0]?.id ?? null);
  const [detail, setDetail] = useState<ConversationItemDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    const d = await getConversationItemDetailForWorkbenchAction(id);
    setDetail(d);
    setDetailLoading(false);
  }, []);

  const refreshAll = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const filtered = useMemo(() => {
    return initialItems.filter((it) => {
      const st = statusFilter === "all" || it.status === statusFilter;
      const search =
        !q ||
        [it.bodyPreview, it.title, it.channel, it.analysisSummary].filter(Boolean).join(" ").toLowerCase().includes(q.toLowerCase());
      return st && search;
    });
  }, [initialItems, statusFilter, q]);

  return (
    <div className="space-y-4">
      <SummaryStrip
        summary={summary}
        view={view}
        onView={setView}
        onAnalyzeRecent={() => {
          start(async () => {
            setLastAction(null);
            const r = await analyzeRecentUnanalyzedConversationItemsAction(20);
            if (r.ok) {
              setLastAction(`Analyzed ${r.processed.length} item(s).${r.errors.length ? ` Errors: ${r.errors.length}` : ""}`);
              refreshAll();
            } else {
              setLastAction(`Batch failed: ${r.error}`);
            }
          });
        }}
        pending={pending}
      />

      <div className="grid min-h-[560px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        <FeedFilterRail
          view={view}
          q={q}
          onQ={setQ}
          statusFilter={statusFilter}
          onStatus={setStatusFilter}
          items={view === "feed" || view === "counties" ? filtered : []}
          selectedId={selectedId}
          onSelect={setSelectedId}
          clusters={clusters}
          opportunities={opportunities}
        />

        <CenterDetailPanel
          detail={detail}
          loading={detailLoading}
          view={view}
          summary={summary}
          clusters={clusters}
          opportunities={opportunities}
        />

        <IntelligenceActionRail
          detail={detail}
          pending={pending}
          start={start}
          lastAction={lastAction}
          setLastAction={setLastAction}
          countyOptions={countyOptions}
          onRefreshDetail={() => selectedId && void loadDetail(selectedId)}
          onRefreshAll={refreshAll}
        />
      </div>
    </div>
  );
}

function SummaryStrip({
  summary,
  view,
  onView,
  onAnalyzeRecent,
  pending,
}: {
  summary: ConversationMonitoringSummary;
  view: ViewId;
  onView: (v: ViewId) => void;
  onAnalyzeRecent: () => void;
  pending: boolean;
}) {
  const tabs: { id: ViewId; label: string; icon: typeof Radio }[] = [
    { id: "feed", label: "Feed", icon: Radio },
    { id: "clusters", label: "Clusters", icon: Layers },
    { id: "opportunities", label: "Opportunities", icon: Sparkles },
    { id: "counties", label: "County trends", icon: MapPin },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Public conversation</h2>
          <p className="text-xs text-slate-600">Aggregated public signals (posts, press, comments as threads) — not private individuals.</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <UiButton
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full text-xs"
            disabled={pending}
            onClick={onAnalyzeRecent}
            title="Runs rules-based analysis on items without analysis (recent first)"
          >
            Analyze recent (no analysis)
          </UiButton>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <UiButton
                key={t.id}
                type="button"
                size="sm"
                variant={view === t.id ? "default" : "outline"}
                className="rounded-full"
                onClick={() => onView(t.id)}
              >
                <Icon className="mr-1 h-3.5 w-3.5" />
                {t.label}
              </UiButton>
            );
          })}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <MetricPill label="Items indexed" value={String(summary.itemCount)} />
        <MetricPill label="New" value={String(summary.newItems)} />
        <MetricPill label="Open / routed opps" value={String(summary.openOpportunities)} />
        <MetricPill label="Active clusters" value={String(summary.activeClusters)} />
        <MetricPill label="Watchlists" value={String(summary.watchlistCount)} />
      </div>
      {summary.topCounties.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold uppercase text-slate-500">Top counties (by items)</span>
          {summary.topCounties.map((c) => (
            <UiBadge key={c.countyId} className="border-slate-200 bg-slate-50 text-slate-800">
              {c.displayName} · {c.count}
            </UiBadge>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[10px] text-slate-500 border-t border-slate-100 pt-3">Ingest public items to see county mix (TODO: adapters + analysis).</p>
      )}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-1.5">
      <div className="text-[9px] font-bold uppercase text-slate-500">{label}</div>
      <div className="text-lg font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

function FeedFilterRail({
  view,
  q,
  onQ,
  statusFilter,
  onStatus,
  items,
  selectedId,
  onSelect,
  clusters,
  opportunities,
}: {
  view: ViewId;
  q: string;
  onQ: (s: string) => void;
  statusFilter: string;
  onStatus: (s: string) => void;
  items: ConversationItemListRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  clusters: ConversationClusterListRow[];
  opportunities: ConversationOpportunityListRow[];
}) {
  return (
    <Card className="rounded-3xl border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ListFilter className="h-4 w-4" />
          {view === "feed" && "Filter feed"}
          {view === "clusters" && "Clusters"}
          {view === "opportunities" && "Opportunities"}
          {view === "counties" && "Counties (same list)"}
        </CardTitle>
        <CardDescription className="text-xs">Ingestion adapters are server-side — UI never scrapes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {(view === "feed" || view === "counties") && (
          <>
            <input
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Search text / channel / summary"
              className="w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => onStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-2 py-1.5 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="NEW">New</option>
              <option value="ENRICHED">Enriched</option>
              <option value="CLUSTERED">Clustered</option>
            </select>
          </>
        )}
        <UiScrollArea className="h-[420px] pr-1">
          {view === "feed" || view === "counties" ? (
            <ul className="space-y-2">
              {items.length === 0 ? (
                <li className="text-xs text-slate-500">No rows yet — run `POST` ingestion (TODO) or add manual `ConversationItem` in Prisma Studio.</li>
              ) : (
                items.map((it) => (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(it.id)}
                      className={cn(
                        "w-full rounded-xl border p-2.5 text-left text-xs transition",
                        selectedId === it.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <div className="mb-0.5 flex flex-wrap items-center justify-between gap-1">
                        <span className={cn("font-semibold", selectedId === it.id ? "text-white" : "text-slate-800")}>{it.channel}</span>
                        <span className="flex flex-wrap gap-0.5">
                          {it.analyzedAt ? (
                            <UiBadge className={cn("text-[9px]", selectedId === it.id ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-900")}>
                              Analyzed
                            </UiBadge>
                          ) : (
                            <UiBadge className={cn("text-[9px]", selectedId === it.id ? "bg-amber-500/30 text-amber-100" : "bg-amber-100 text-amber-900")}>
                              Not analyzed
                            </UiBadge>
                          )}
                          {it.urgency ? <UiBadge className="text-[9px]">{it.urgency}</UiBadge> : null}
                        </span>
                      </div>
                      <p className={cn("line-clamp-3", selectedId === it.id ? "text-slate-200" : "text-slate-600")}>{it.bodyPreview}</p>
                      <div className={cn("mt-1 text-[9px]", selectedId === it.id ? "text-slate-400" : "text-slate-400")}>
                        {it.classification ? `${it.classification} · ` : ""}
                        {it.countyName ?? "County TBD"}
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
          {view === "clusters" && (
            <ul className="space-y-2">
              {clusters.length === 0 ? (
                <li className="text-xs text-slate-500">No clusters — clustering job TODO after analysis.</li>
              ) : (
                clusters.map((c) => (
                  <li key={c.id} className="rounded-xl border border-slate-200 p-2 text-xs">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-slate-500">
                      {c.itemCount} items · {c.countyName ?? "statewide"}{" "}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
          {view === "opportunities" && (
            <ul className="space-y-2">
              {opportunities.length === 0 ? (
                <li className="text-xs text-slate-500">No opportunities — rules engine TODO (urgency + spread).</li>
              ) : (
                opportunities.map((o) => (
                  <li key={o.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-2 text-xs">
                    <div className="font-medium text-amber-950">{o.title}</div>
                    <div className="text-amber-900/80">
                      {o.urgency} · intake {o.hasIntake ? "yes" : "no"} · social {o.hasSocial ? "yes" : "no"}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </UiScrollArea>
      </CardContent>
    </Card>
  );
}

function CenterDetailPanel({
  detail,
  loading,
  view,
  summary,
  clusters,
  opportunities,
}: {
  detail: ConversationItemDetail | null;
  loading: boolean;
  view: ViewId;
  summary: ConversationMonitoringSummary;
  clusters: ConversationClusterListRow[];
  opportunities: ConversationOpportunityListRow[];
}) {
  if (view === "clusters" || view === "opportunities") {
    return (
      <Card className="rounded-3xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">{view === "clusters" ? "Clustering view" : "Opportunity queue"}</CardTitle>
          <CardDescription>
            {view === "clusters"
              ? "Similar public signals roll up for narrative tracking — not person dossiers."
              : "Routed and converted opportunities tie to `WorkflowIntake` / `SocialContentItem` when you use the action rail on a feed item."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <p>Clusters: {clusters.length} · Open opportunities: {opportunities.length}</p>
          <p className="mt-2 text-xs text-slate-500">See left rail for the list. Feed view shows the normalized `ConversationItem` + `ConversationAnalysis`.</p>
        </CardContent>
      </Card>
    );
  }
  if (view === "counties") {
    return (
      <Card className="rounded-3xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            County trend lens
          </CardTitle>
          <CardDescription>Uses `countyId` on items; inference notes live on analysis rows.</CardDescription>
        </CardHeader>
        <CardContent>
          {summary.topCounties.length === 0 ? (
            <p className="text-sm text-slate-500">No county-linked items yet.</p>
          ) : (
            <ul className="space-y-2">
              {summary.topCounties.map((c) => (
                <li key={c.countyId} className="flex items-center justify-between rounded-xl border border-slate-100 px-2 py-1.5 text-sm">
                  <span>{c.displayName}</span>
                  <span className="font-semibold tabular-nums">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-3xl border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">Item detail</CardTitle>
        <CardDescription>Normalized public text + AI/rules enrichment (no private tracking).</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : !detail ? (
          <p className="text-sm text-slate-500">Select an item in the feed.</p>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{detail.channel}</span>·<span>{detail.sourceKind}</span>
              {detail.countyName ? <span>· {detail.countyName}</span> : null}
            </div>
            {detail.title ? <h3 className="text-lg font-semibold text-slate-900">{detail.title}</h3> : null}
            <p className="whitespace-pre-wrap text-slate-800">{detail.bodyText}</p>
            {detail.publicPermalink ? (
              <a href={detail.publicPermalink} target="_blank" rel="noreferrer" className="text-civic-slate text-xs underline break-all">
                {detail.publicPermalink}
              </a>
            ) : null}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
              <p className="font-bold text-slate-600">Analysis</p>
              {detail.analyzerVersion ? (
                <p className="mt-0.5 text-[10px] text-slate-500">Engine: {detail.analyzerVersion}</p>
              ) : null}
              {detail.analyzedAt ? (
                <p className="text-[10px] text-slate-500">Analyzed at {new Date(detail.analyzedAt).toLocaleString()}</p>
              ) : (
                <p className="text-[10px] text-amber-800">Not analyzed — use actions to run rules engine.</p>
              )}
              <p className="mt-1 text-slate-800">{detail.analysisSummary ?? "—"}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {detail.classification ? <UiBadge className="text-[9px]">{detail.classification}</UiBadge> : null}
                {detail.sentiment ? <UiBadge className="text-[9px]">{detail.sentiment}</UiBadge> : null}
                {detail.urgency ? <UiBadge className="text-[9px]">{detail.urgency}</UiBadge> : null}
                {detail.suggestedTone ? <UiBadge className="text-[9px]">tone: {detail.suggestedTone}</UiBadge> : null}
              </div>
              {detail.issueTags.length > 0 ? (
                <p className="mt-1 text-slate-600">Tags: {detail.issueTags.join(", ")}</p>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IntelligenceActionRail({
  detail,
  pending,
  start,
  lastAction,
  setLastAction,
  countyOptions,
  onRefreshDetail,
  onRefreshAll,
}: {
  detail: ConversationItemDetail | null;
  pending: boolean;
  start: (cb: () => void) => void;
  lastAction: string | null;
  setLastAction: (s: string | null) => void;
  countyOptions: { id: string; displayName: string }[];
  onRefreshDetail: () => void;
  onRefreshAll: () => void;
}) {
  const [routeCountyId, setRouteCountyId] = useState("");
  useEffect(() => {
    setRouteCountyId(detail?.countyId ?? "");
  }, [detail?.id, detail?.countyId]);

  return (
    <Card className="rounded-3xl border-slate-200">
      <CardHeader>
        <CardTitle className="text-sm">Actions & intelligence</CardTitle>
        <CardDescription className="text-xs">Converts to CampaignOS without leaving the workbench (when item selected).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {!detail ? <p className="text-xs text-slate-500">Pick a feed item for actions.</p> : null}
        {detail ? (
          <div className="flex flex-col gap-1.5">
            <div className="mb-1 rounded-xl border border-slate-100 bg-slate-50/90 p-2">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Analysis (rules v1)</p>
              <div className="flex flex-col gap-1">
                <UiButton
                  type="button"
                  size="sm"
                  className="h-8 w-full justify-center rounded-lg text-[11px]"
                  disabled={pending}
                  onClick={() => {
                    start(async () => {
                      const r = await analyzeConversationItemAction(detail.id);
                      if (r.ok) {
                        setLastAction(`Analyzed · ${r.classification} · opp ${r.opportunityAction}`);
                        onRefreshDetail();
                        onRefreshAll();
                      } else {
                        setLastAction(`Analyze failed: ${"error" in r ? r.error : "unknown"}`);
                      }
                    });
                  }}
                >
                  Analyze this item
                </UiButton>
              </div>
            </div>
            <div className="mb-1 rounded-xl border border-slate-100 bg-white p-2">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">County route</p>
              <select
                className="mb-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px]"
                value={routeCountyId}
                onChange={(e) => setRouteCountyId(e.target.value)}
                aria-label="Target county"
              >
                <option value="">Select county…</option>
                {countyOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName}
                  </option>
                ))}
              </select>
              <UiButton
                type="button"
                size="sm"
                variant="outline"
                className="h-8 w-full rounded-lg text-[11px]"
                disabled={pending || !routeCountyId}
                onClick={() => {
                  start(async () => {
                    const r = await routeConversationItemToCountyAction({
                      conversationItemId: detail.id,
                      countyId: routeCountyId,
                      createWorkflowIntake: true,
                      createSocialContentItem: false,
                      createCampaignTask: false,
                    });
                    if (r.ok) {
                      setLastAction(`Routed to county · intake ${r.workflowIntakeId ?? "—"}`);
                      onRefreshDetail();
                      onRefreshAll();
                    } else {
                      setLastAction(r.error);
                    }
                  });
                }}
              >
                Route to county (creates intake)
              </UiButton>
            </div>
            <UiButton
              type="button"
              size="sm"
              variant="outline"
              className="h-auto w-full justify-start rounded-xl py-1.5 text-left text-[11px]"
              disabled={pending}
              onClick={() => {
                start(async () => {
                  const r = await addConversationItemToCandidateBriefAction(detail.id);
                  setLastAction(r.ok ? `Flagged for candidate brief · opp ${r.opportunityId}` : r.error);
                  onRefreshDetail();
                  onRefreshAll();
                });
              }}
            >
              Add to candidate brief
            </UiButton>
            <ActionBtn
              label="Rapid response (intake + social)"
              disabled={pending}
              onClick={() => {
                start(async () => {
                  const r = await createRapidResponseFromConversationItemAction(detail.id);
                  setLastAction(r.ok ? "Created rapid response workflow + work item" : r.error);
                  if (r.ok) {
                    onRefreshAll();
                  }
                });
              }}
            />
            <ActionBtn
              label="Clarification post draft"
              disabled={pending}
              onClick={() => {
                start(async () => {
                  const r = await createClarificationPostFromConversationItemAction(detail.id);
                  setLastAction(r.ok ? `Clarification draft ${r.socialId}` : r.error);
                });
              }}
            />
            <ActionBtn
              label="FAQ / myth vs fact draft"
              disabled={pending}
              onClick={() => {
                start(async () => {
                  const r = await createFaqDraftFromConversationItemAction(detail.id);
                  setLastAction(r.ok ? `FAQ draft ${r.socialId}` : r.error);
                });
              }}
            />
            <Link
              href="/admin/workbench/social"
              className="mt-1 inline-block text-center text-xs text-civic-slate underline"
            >
              Open social queue (work items)
            </Link>
            <p className="text-[10px] text-slate-500">Watchlist admin form: settings (separate) — this rail updates analysis, routes counties, and flags briefs.</p>
          </div>
        ) : null}
        {lastAction ? <p className="text-[10px] text-slate-600">{lastAction}</p> : null}
      </CardContent>
    </Card>
  );
}

function ActionBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <UiButton type="button" variant="outline" className="h-auto w-full justify-start rounded-xl py-1.5 text-left text-xs" disabled={disabled} onClick={onClick}>
      {label}
    </UiButton>
  );
}
