"use client";

import { motion } from "framer-motion";
import { Clock3, Flame, ShieldAlert, TrendingUp } from "lucide-react";
import type {
  SocialAccountOption,
  SocialWorkbenchListItem,
  WorkbenchOperationalSnapshot,
} from "@/lib/social/social-workbench-dto";
import type {
  ConversationClusterListRow,
  ConversationItemListRow,
  ConversationMonitoringSummary,
  ConversationOpportunityListRow,
} from "@/lib/conversation-monitoring/conversation-monitoring-dto";
import { ConversationMonitoringDashboard } from "./conversation-monitoring/ConversationMonitoringDashboard";
import { SocialWorkbenchLive } from "./SocialWorkbenchLive";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, UiBadge } from "./social-ui-primitives";
import { UiTabs, UiTabsContent, UiTabsList, UiTabsTrigger } from "./social-ui-primitives";
import { useState } from "react";

const metrics = [
  { label: "Posts this week", value: "—", sub: "Wire post analytics" },
  { label: "Replies needing action", value: "—", sub: "Inbox TBD" },
  { label: "Scheduled next 72h", value: "—", sub: "From variant schedules" },
  { label: "Top issue", value: "—", sub: "Engagement NLP TBD" },
] as const;

function statusColor(status: string) {
  if (["Urgent", "Due soon", "High"].includes(status)) return "bg-red-100 text-red-700 border-red-200";
  if (["Scheduled", "Approved", "Supporter", "Ready"].includes(status)) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (["Draft", "Open", "Question", "Medium"].includes(status)) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

type Props = {
  initialQueue: SocialWorkbenchListItem[];
  socialAccounts: SocialAccountOption[];
  conversation?: {
    summary: ConversationMonitoringSummary;
    initialItems: ConversationItemListRow[];
    clusters: ConversationClusterListRow[];
    opportunities: ConversationOpportunityListRow[];
    countyOptions: { id: string; displayName: string }[];
  };
};

/**
 * Main Social Workbench shell: hero, live two-column work area (`SocialWorkbenchLive`), and command rail.
 * Queue and detail are DB-backed; engagement/analytics in this file remain TODO scaffolding.
 */
export function SocialWorkbenchCommandUI({ initialQueue, socialAccounts, conversation }: Props) {
  return (
    <div className="min-h-screen w-full max-w-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white shadow-2xl">
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.5fr_.8fr] lg:items-end">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <UiBadge className="border-white/20 bg-white/10 text-white">CampaignOS</UiBadge>
                    <UiBadge className="border-white/20 bg-white/10 text-white">Social Workbench</UiBadge>
                    <UiBadge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-200">DB-backed queue</UiBadge>
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">Social Media Command Workbench</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                    Select a <code className="text-slate-200">SocialContentItem</code>, edit master copy, manage variants, and run Author Studio
                    with the work item id in request bodies.
                  </p>
                  <p className="mt-3 max-w-3xl text-xs text-slate-400">Selection-aware hero metrics are still placeholders; the right column shows the active work item.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-slate-300">{metric.label}</div>
                      <div className="mt-1 text-2xl font-semibold">{metric.value}</div>
                      <div className="mt-1 text-xs text-slate-400">{metric.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {conversation ? (
          <div className="mb-4">
            <UiTabs defaultValue="content" className="w-full">
              <UiTabsList className="grid w-full max-w-md grid-cols-2 rounded-2xl bg-slate-100 p-1">
                <UiTabsTrigger value="content" className="rounded-xl text-xs">
                  Content queue
                </UiTabsTrigger>
                <UiTabsTrigger value="monitoring" className="rounded-xl text-xs">
                  Conversation monitoring
                </UiTabsTrigger>
              </UiTabsList>
              <UiTabsContent value="content" className="mt-4">
                <SocialWorkbenchGridColumn initialQueue={initialQueue} socialAccounts={socialAccounts} />
              </UiTabsContent>
              <UiTabsContent value="monitoring" className="mt-4">
                <ConversationMonitoringDashboard
                  summary={conversation.summary}
                  initialItems={conversation.initialItems}
                  clusters={conversation.clusters}
                  opportunities={conversation.opportunities}
                  countyOptions={conversation.countyOptions}
                />
              </UiTabsContent>
            </UiTabs>
          </div>
        ) : (
          <SocialWorkbenchGridColumn initialQueue={initialQueue} socialAccounts={socialAccounts} />
        )}

      </div>
    </div>
  );
}

function SocialWorkbenchGridColumn({
  initialQueue,
  socialAccounts,
}: {
  initialQueue: SocialWorkbenchListItem[];
  socialAccounts: SocialAccountOption[];
}) {
  const [opSnapshot, setOpSnapshot] = useState<WorkbenchOperationalSnapshot | null>(null);

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <SocialWorkbenchLive
        initialQueue={initialQueue}
        socialAccounts={socialAccounts}
        onOperationalSnapshotChange={setOpSnapshot}
      />

      <div className="space-y-6">
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Active work item</CardTitle>
                <CardDescription>Live context for the row selected in the queue — variants, tasks, and readiness.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {opSnapshot ? (
                  <>
                    <div>
                      <div className="text-sm font-semibold leading-snug text-slate-900">{opSnapshot.title?.trim() || "Untitled"}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <UiBadge className="border-slate-200 text-slate-700">{opSnapshot.kindLabel}</UiBadge>
                        <UiBadge className={statusColor(opSnapshot.statusLabel)}>{opSnapshot.statusLabel}</UiBadge>
                        {!opSnapshot.hasBodyCopy ? (
                          <UiBadge className="border-amber-200 bg-amber-50 text-amber-900">No master copy yet</UiBadge>
                        ) : null}
                      </div>
                    </div>
                    <ul className="space-y-1.5 text-sm text-slate-600">
                      <li className="flex justify-between gap-2">
                        <span>Platform variants</span>
                        <span className="font-medium text-slate-900">{opSnapshot.variantCount}</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span>Scheduled slots</span>
                        <span className="font-medium text-slate-900">{opSnapshot.variantsScheduled}</span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span>Campaign tasks (open / total)</span>
                        <span className="font-medium text-slate-900">
                          {opSnapshot.tasksOpen} / {opSnapshot.taskCount}
                        </span>
                      </li>
                    </ul>
                    {(opSnapshot.workflowIntakeTitle || opSnapshot.workflowIntakeId) && (
                      <p className="text-xs text-slate-500">
                        Intake: {opSnapshot.workflowIntakeTitle ?? opSnapshot.workflowIntakeId}
                      </p>
                    )}
                    {(opSnapshot.campaignEventTitle || opSnapshot.campaignEventId) && (
                      <p className="text-xs text-slate-500">
                        Event: {opSnapshot.campaignEventTitle ?? opSnapshot.campaignEventId}
                      </p>
                    )}
                    <p className="text-[10px] font-mono text-slate-400">ID: {opSnapshot.socialContentItemId}</p>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Publish readiness</div>
                      <ul className="space-y-1.5">
                        {opSnapshot.readinessChecklist.map((row) => (
                          <li key={row.id} className="flex items-start gap-2 text-xs text-slate-700">
                            <span className={row.done ? "text-emerald-600" : "text-slate-300"} aria-hidden>
                              {row.done ? "✓" : "○"}
                            </span>
                            <span className={row.done ? "text-slate-600" : "text-slate-500"}>{row.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Select a work item in the queue to see counts and links here.</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Campaign Command Rail</CardTitle>
                <CardDescription>Heuristics from the current selection. Rule-based nudges will layer on later.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {opSnapshot?.status === "IN_REVIEW" ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                      <ShieldAlert className="h-4 w-4" />
                      In review
                    </div>
                    <p className="mt-2 text-sm text-red-800">Comms or approvers may be waiting on this work item. Check tasks on the Studio tab.</p>
                  </div>
                ) : null}
                {opSnapshot && opSnapshot.variantsScheduled === 0 && opSnapshot.variantCount > 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                      <Clock3 className="h-4 w-4" />
                      Scheduling
                    </div>
                    <p className="mt-2 text-sm text-amber-800">No variant has a <code className="text-xs">scheduledAt</code> yet. Use the Variants or Calendar tab.</p>
                  </div>
                ) : null}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                    <Flame className="h-4 w-4" />
                    Author Studio
                  </div>
                  <p className="mt-2 text-sm text-emerald-900">
                    POSTs include <code className="text-xs">socialContentItemId</code> and, when set, <code className="text-xs">campaignEventId</code> and{" "}
                    <code className="text-xs">workflowIntakeId</code>. Draft, rewrite, and platform pack can write master copy and variant rows; task export creates
                    <code className="text-xs"> CampaignTask</code> rows.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-slate-600">
                  <TrendingUp className="h-4 w-4" />
                  Performance
                </CardTitle>
                <CardDescription>TODO: metrics by work item and variant ids (analytics pass).</CardDescription>
              </CardHeader>
            </Card>
      </div>
    </div>
  );
}
