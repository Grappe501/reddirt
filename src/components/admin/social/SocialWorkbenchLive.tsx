"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Library,
  PencilLine,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  CampaignTaskStatus,
  SocialContentKind,
  SocialContentStatus,
  SocialMessageTacticMode,
  SocialMessageToneMode,
  SocialPlatform,
  SocialVariantStatus,
} from "@prisma/client";
import {
  createSocialTaskPackAction,
  createSocialPlatformVariantAction,
  deleteSocialPlatformVariantAction,
  getSocialContentWorkbenchDetailAction,
  type TaskPackKey,
  updateSocialContentItemAction,
  updateSocialPlatformVariantAction,
} from "@/app/admin/workbench-social-actions";
import { toDatetimeLocalInputValue, parseDatetimeLocalToUtc } from "@/lib/social/date-input";
import { socialEnumLabel } from "@/lib/social/enum-labels";
import type {
  SocialAccountOption,
  SocialContentWorkbenchDetail,
  SocialPlatformVariantDetail,
  SocialWorkbenchListItem,
  WorkbenchOperationalSnapshot,
} from "@/lib/social/social-workbench-dto";
import { MediaLibraryDrawer } from "./MediaLibraryDrawer";
import { MasterAuthorStudio, TaskFlowCard, type MasterAuthorWorkbenchContext } from "./master-author";
import { SocialWorkbenchAttachedMediaSection } from "./SocialWorkbenchAttachedMediaSection";
import { SocialWorkbenchAnalyticsPanel } from "./SocialWorkbenchAnalyticsPanel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  UiBadge,
  UiButton,
  UiInput,
  UiScrollArea,
  UiTabs,
  UiTabsContent,
  UiTabsList,
  UiTabsTrigger,
  UiTextarea,
  NativeSelect,
} from "./social-ui-primitives";
import { cn } from "@/lib/utils";

function statusColorClass(status: string) {
  if (["Urgent", "IN_REVIEW", "PUBLISHING", "TODO", "Media"].includes(status)) {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (["Scheduled", "APPROVED", "SCHEDULED", "PUBLISHED", "DONE", "READY", "Comms"].includes(status)) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (["Draft", "DRAFT", "OPEN", "MEDIUM", "IN_PROGRESS", "FOLLOW_UP"].includes(status)) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function queuePill(s: SocialContentStatus) {
  if (s === "PUBLISHED" || s === "ARCHIVED" || s === "CANCELLED") return { label: socialEnumLabel(s), cls: "bg-slate-100 text-slate-600" };
  if (s === "IN_REVIEW" || s === "PUBLISHING") return { label: socialEnumLabel(s), cls: "bg-red-100 text-red-800" };
  return { label: socialEnumLabel(s), cls: "bg-slate-200 text-slate-800" };
}

const CONTENT_KIND_OPTIONS = Object.values(SocialContentKind).map((k) => ({ value: k, label: socialEnumLabel(k) }));
const CONTENT_STATUS_OPTIONS = Object.values(SocialContentStatus).map((k) => ({ value: k, label: socialEnumLabel(k) }));
const MESSAGE_TONE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— Unspecified —" },
  ...Object.values(SocialMessageToneMode).map((m) => ({ value: m, label: socialEnumLabel(m) })),
];
const MESSAGE_TACTIC_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— Unspecified —" },
  ...Object.values(SocialMessageTacticMode).map((m) => ({ value: m, label: socialEnumLabel(m) })),
];
const PLATFORM_OPTIONS = Object.values(SocialPlatform).map((k) => ({ value: k, label: socialEnumLabel(k) }));
const VARIANT_STATUS_OPTIONS = Object.values(SocialVariantStatus).map((k) => ({ value: k, label: socialEnumLabel(k) }));

type QueueRowProps = { item: SocialWorkbenchListItem; active: boolean; onClick: () => void };

function SocialQueueRow({ item, active, onClick }: QueueRowProps) {
  const pill = queuePill(item.status);
  const updated = formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true });
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition",
        active ? "border-slate-900 bg-slate-900 text-white shadow-lg" : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <UiBadge className={active ? "border-white/20 bg-white/15 text-white" : pill.cls}>{pill.label}</UiBadge>
        <span className={cn("text-xs", active ? "text-slate-300" : "text-slate-500")}>{updated}</span>
      </div>
      <div className="text-sm font-semibold leading-5">{item.title?.trim() || "Untitled"}</div>
      <div className={cn("mt-3 flex flex-wrap items-center gap-2 text-xs", active ? "text-slate-300" : "text-slate-500")}>
        <span>{socialEnumLabel(item.kind)}</span>
        <span>•</span>
        <span>{item.variantCount} variants</span>
        <span>•</span>
        <span>{item.taskCount} tasks</span>
      </div>
    </button>
  );
}

function ItemEditForm({
  detail,
  onSaved,
}: {
  detail: SocialContentWorkbenchDetail;
  onSaved: () => void;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [title, setTitle] = useState(detail.title ?? "");
  const [bodyCopy, setBodyCopy] = useState(detail.bodyCopy ?? "");
  const [kind, setKind] = useState(detail.kind);
  const [status, setStatus] = useState(detail.status);
  const [messageToneMode, setMessageToneMode] = useState(detail.messageToneMode ?? "");
  const [messageTacticMode, setMessageTacticMode] = useState(detail.messageTacticMode ?? "");

  useEffect(() => {
    setTitle(detail.title ?? "");
    setBodyCopy(detail.bodyCopy ?? "");
    setKind(detail.kind);
    setStatus(detail.status);
    setMessageToneMode(detail.messageToneMode ?? "");
    setMessageTacticMode(detail.messageTacticMode ?? "");
  }, [detail.id, detail.updatedAt, detail.title, detail.bodyCopy, detail.kind, detail.status, detail.messageToneMode, detail.messageTacticMode]);

  return (
    <form
      className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        const fd = new FormData();
        fd.set("id", detail.id);
        fd.set("title", title);
        fd.set("bodyCopy", bodyCopy);
        fd.set("kind", kind);
        fd.set("status", status);
        if (messageToneMode) fd.set("messageToneMode", messageToneMode);
        else fd.set("messageToneMode", "");
        if (messageTacticMode) fd.set("messageTacticMode", messageTacticMode);
        else fd.set("messageTacticMode", "");
        start(async () => {
          const r = await updateSocialContentItemAction(fd);
          if (!r.ok) {
            setErr(r.error);
            return;
          }
          onSaved();
        });
      }}
    >
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Title</label>
        <UiInput className="rounded-2xl" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Kind</label>
          <NativeSelect
            value={kind}
            onValueChange={(v) => setKind(v as SocialContentKind)}
            options={CONTENT_KIND_OPTIONS}
            aria-label="Content kind"
            className="rounded-2xl"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Status</label>
          <NativeSelect
            value={status}
            onValueChange={(v) => setStatus(v as SocialContentStatus)}
            options={CONTENT_STATUS_OPTIONS}
            aria-label="Content status"
            className="rounded-2xl"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Message tone (voice)</label>
          <p className="mb-1 text-[10px] text-slate-500">Trust-oriented voice label for learning (not outrage).</p>
          <NativeSelect
            value={messageToneMode}
            onValueChange={(v) => setMessageToneMode(v)}
            options={MESSAGE_TONE_OPTIONS}
            aria-label="Message tone"
            className="rounded-2xl"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Message framing (tactic)</label>
          <p className="mb-1 text-[10px] text-slate-500">How the post is structured (story vs explainer vs clarify), separate from tone.</p>
          <NativeSelect
            value={messageTacticMode}
            onValueChange={(v) => setMessageTacticMode(v)}
            options={MESSAGE_TACTIC_OPTIONS}
            aria-label="Message tactic"
            className="rounded-2xl"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Body copy (master)</label>
        <UiTextarea
          className="min-h-[120px] rounded-2xl"
          value={bodyCopy}
          onChange={(e) => setBodyCopy(e.target.value)}
          maxLength={50000}
        />
        <p className="mt-0.5 text-[10px] text-slate-500">
          Per-platform text lives in Variants. Author Studio can update this field when you run compose or platform-pack with a work item selected, or use Save master in the Studio.
        </p>
      </div>
      <UiButton type="submit" className="rounded-xl" disabled={pending}>
        {pending ? "Saving…" : "Save work item"}
      </UiButton>
    </form>
  );
}

function VariantForm({
  mode,
  socialContentItemId,
  socialAccounts,
  initial,
  onDone,
}: {
  mode: "create" | "edit";
  socialContentItemId: string;
  socialAccounts: SocialAccountOption[];
  initial?: SocialPlatformVariantDetail;
  onDone: () => void;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [platform, setPlatform] = useState<SocialPlatform>(initial?.platform ?? "OTHER");
  const [accountId, setAccountId] = useState<string>(initial?.socialAccountId ?? "");
  const [copyText, setCopyText] = useState<string>(initial?.copyText ?? "");
  const [vStatus, setVStatus] = useState<SocialVariantStatus>(initial?.status ?? "DRAFT");
  const [sched, setSched] = useState<string>(toDatetimeLocalInputValue(initial?.scheduledAt));

  const accountOptions = useMemo(
    () => [
      { value: "", label: "— None (draft target) —" },
      ...socialAccounts.map((a) => ({ value: a.id, label: `${a.label} · ${socialEnumLabel(a.platform)}` })),
    ],
    [socialAccounts]
  );

  useEffect(() => {
    if (mode !== "edit" || !initial) return;
    setPlatform(initial.platform);
    setAccountId(initial.socialAccountId ?? "");
    setCopyText(initial.copyText ?? "");
    setVStatus(initial.status);
    setSched(toDatetimeLocalInputValue(initial.scheduledAt));
  }, [mode, initial]);

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        const fd = new FormData();
        fd.set("socialContentItemId", socialContentItemId);
        if (mode === "edit" && initial) {
          fd.set("id", initial.id);
        }
        fd.set("platform", platform);
        fd.set("socialAccountId", accountId);
        fd.set("copyText", copyText);
        fd.set("status", vStatus);
        const d = parseDatetimeLocalToUtc(sched);
        fd.set("scheduledAt", d ? d.toISOString() : "");
        start(async () => {
          const r =
            mode === "create" ? await createSocialPlatformVariantAction(fd) : await updateSocialPlatformVariantAction(fd);
          if (!r.ok) {
            setErr(r.error);
            return;
          }
          onDone();
        });
      }}
    >
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500">Platform</span>
          <NativeSelect
            value={platform}
            onValueChange={(v) => setPlatform(v as SocialPlatform)}
            options={PLATFORM_OPTIONS}
            className="mt-0.5 rounded-xl"
            aria-label="Platform"
          />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500">Account</span>
          <NativeSelect
            value={accountId}
            onValueChange={setAccountId}
            options={accountOptions}
            className="mt-0.5 rounded-xl"
            aria-label="Social account"
          />
        </div>
      </div>
      <div>
        <span className="text-[10px] font-bold uppercase text-slate-500">Copy</span>
        <UiTextarea className="mt-0.5 min-h-[100px] rounded-2xl" value={copyText} onChange={(e) => setCopyText(e.target.value)} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500">Variant status</span>
          <NativeSelect
            value={vStatus}
            onValueChange={(v) => setVStatus(v as SocialVariantStatus)}
            options={VARIANT_STATUS_OPTIONS}
            className="mt-0.5 rounded-xl"
            aria-label="Variant status"
          />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500">Scheduled (local)</span>
          <UiInput
            className="mt-0.5 rounded-xl"
            type="datetime-local"
            value={sched}
            onChange={(e) => setSched(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <UiButton type="submit" size="sm" className="rounded-xl" disabled={pending}>
          {mode === "create" ? (pending ? "Adding…" : "Add variant") : pending ? "Saving…" : "Save variant"}
        </UiButton>
      </div>
    </form>
  );
}

function VariantCard({
  v,
  socialContentItemId,
  socialAccounts,
  onChanged,
}: {
  v: SocialPlatformVariantDetail;
  socialContentItemId: string;
  socialAccounts: SocialAccountOption[];
  onChanged: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <Card className="rounded-3xl border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{socialEnumLabel(v.platform)}</CardTitle>
          <UiBadge className={statusColorClass(v.status)}>{socialEnumLabel(v.status)}</UiBadge>
        </div>
        <CardDescription>
          {v.accountLabel ? (
            <span>
              Account: {v.accountLabel}
              {v.accountHandle ? ` @${v.accountHandle}` : ""}
            </span>
          ) : (
            "No account selected"
          )}
          {v.scheduledAt ? ` · ${new Date(v.scheduledAt).toLocaleString()}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <VariantForm
          mode="edit"
          socialContentItemId={socialContentItemId}
          socialAccounts={socialAccounts}
          initial={v}
          onDone={onChanged}
        />
        <UiButton
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl text-red-700"
          disabled={pending}
          onClick={() => {
            if (!confirm("Delete this platform variant?")) return;
            start(async () => {
              const r = await deleteSocialPlatformVariantAction(v.id, socialContentItemId);
              if (r.ok) onChanged();
              else alert(r.error);
            });
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </UiButton>
      </CardContent>
    </Card>
  );
}

function TaskPackButtons({
  socialContentItemId,
  onCreated,
}: {
  socialContentItemId: string;
  onCreated: () => void;
}) {
  const [pending, start] = useTransition();
  const packs: { key: TaskPackKey; label: string }[] = [
    { key: "comms_review", label: "Comms review pack" },
    { key: "schedule_publish", label: "Schedule & publish" },
    { key: "media_production", label: "Media production" },
    { key: "monitor_engagement", label: "Engagement monitor" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {packs.map((p) => (
        <UiButton
          key={p.key}
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const r = await createSocialTaskPackAction(socialContentItemId, p.key);
              if (r.ok) onCreated();
              else alert(r.error);
            });
          }}
        >
          {pending ? "…" : p.label}
        </UiButton>
      ))}
    </div>
  );
}

export function SocialWorkbenchLive({
  initialQueue,
  socialAccounts,
  onOperationalSnapshotChange,
}: {
  initialQueue: SocialWorkbenchListItem[];
  socialAccounts: SocialAccountOption[];
  onOperationalSnapshotChange?: (snapshot: WorkbenchOperationalSnapshot | null) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialQueue[0]?.id ?? null);
  const [detail, setDetail] = useState<SocialContentWorkbenchDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);

  const platformVariantsForLibrary = useMemo(
    () =>
      (detail?.platformVariants ?? []).map((v) => ({
        id: v.id,
        label: `${socialEnumLabel(v.platform)}`,
      })),
    [detail?.platformVariants]
  );

  useEffect(() => {
    if (initialQueue.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((cur) => (cur && initialQueue.some((i) => i.id === cur) ? cur : initialQueue[0]!.id));
  }, [initialQueue]);

  const refreshDetail = useCallback(async () => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    const r = await getSocialContentWorkbenchDetailAction(selectedId);
    if (r.ok) {
      setDetail(r.detail);
    } else {
      setDetail(null);
    }
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setDetailLoading(false);
      return;
    }
    setDetail(null);
    let cancelled = false;
    setDetailLoading(true);
    getSocialContentWorkbenchDetailAction(selectedId).then((r) => {
      if (cancelled) return;
      if (r.ok) {
        setDetail(r.detail);
      } else {
        setDetail(null);
      }
      setDetailLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const onMutationDone = useCallback(() => {
    void refreshDetail();
    router.refresh();
  }, [refreshDetail, router]);

  useEffect(() => {
    if (!onOperationalSnapshotChange) return;
    if (!selectedId || !detail) {
      onOperationalSnapshotChange(null);
      return;
    }
    const tasksOpen = detail.tasks.filter(
      (t) => t.status !== CampaignTaskStatus.DONE && t.status !== CampaignTaskStatus.CANCELLED
    ).length;
    const variantsScheduled = detail.platformVariants.filter((v) => v.scheduledAt).length;
    const hasBody = Boolean(detail.bodyCopy?.trim());
    const readinessChecklist: { id: string; label: string; done: boolean }[] = [
      { id: "body", label: "Master copy (body) present", done: hasBody },
      { id: "variant", label: "At least one platform variant", done: detail.platformVariants.length > 0 },
      { id: "schedule", label: "At least one scheduled slot", done: variantsScheduled > 0 },
      { id: "tasks", label: "Campaign tasks in flight or done", done: detail.tasks.length > 0 },
      {
        id: "review",
        label: "Status beyond raw draft (e.g. in review, scheduled)",
        done: detail.status !== "DRAFT",
      },
    ];
    onOperationalSnapshotChange({
      socialContentItemId: selectedId,
      title: detail.title,
      kindLabel: socialEnumLabel(detail.kind),
      status: detail.status,
      statusLabel: socialEnumLabel(detail.status),
      variantCount: detail.platformVariants.length,
      taskCount: detail.tasks.length,
      tasksOpen,
      variantsScheduled,
      hasBodyCopy: hasBody,
      campaignEventId: detail.campaignEventId,
      campaignEventTitle: detail.campaignEventTitle,
      workflowIntakeId: detail.workflowIntakeId,
      workflowIntakeTitle: detail.workflowIntakeTitle,
      readinessChecklist,
    });
  }, [selectedId, detail, onOperationalSnapshotChange]);

  const displayedQueue = useMemo(() => {
    if (!search.trim()) return initialQueue;
    const q = search.toLowerCase();
    return initialQueue.filter(
      (i) =>
        (i.title ?? "").toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        socialEnumLabel(i.kind).toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q)
    );
  }, [initialQueue, search]);

  const selectedListRow = useMemo(
    () => (selectedId ? initialQueue.find((i) => i.id === selectedId) : undefined),
    [initialQueue, selectedId]
  );

  const workbenchContext: MasterAuthorWorkbenchContext | null = selectedId
    ? {
        socialContentItemId: selectedId,
        campaignEventId: detail?.campaignEventId ?? null,
        workflowIntakeId: detail?.workflowIntakeId ?? null,
        onWorkbenchPersist: onMutationDone,
        workItemBodyCopy: detail?.bodyCopy ?? null,
        workItemDetailUpdatedAt: detail?.updatedAt ?? null,
      }
    : null;

  const taskFlowItems = useMemo(
    () =>
      (detail?.tasks ?? []).map((t) => ({
        id: t.id,
        title: t.title,
        due: t.dueAt ? new Date(t.dueAt).toLocaleString() : "—",
        owner: t.assigneeName ?? "Unassigned",
        status: t.status,
      })),
    [detail?.tasks]
  );

  return (
    <div className="contents">
      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Social Queue</CardTitle>
              <CardDescription>Real CampaignOS work items — open one to edit, bind studio, and manage variants</CardDescription>
            </div>
            <a href="#social-create-form">
              <UiButton size="sm" className="rounded-xl" type="button">
                <PencilLine className="h-4 w-4" />
                New item
              </UiButton>
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, kind, status, id"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <UiScrollArea className="h-[min(760px,70vh)] pr-3">
            <div className="space-y-3">
              {displayedQueue.length === 0 ? (
                <p className="text-sm text-slate-500">No work items. Create one below the workbench, then refresh or select when it appears.</p>
              ) : null}
              {displayedQueue.map((item) => (
                <SocialQueueRow
                  key={item.id}
                  item={item}
                  active={item.id === selectedId}
                  onClick={() => setSelectedId(item.id)}
                />
              ))}
            </div>
          </UiScrollArea>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {!selectedId || !selectedListRow ? (
          <Card className="rounded-3xl border-slate-200 p-6 text-sm text-slate-600">Select a work item in the queue, or create a new one.</Card>
        ) : (
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <UiBadge className="border-slate-200 text-slate-600">{socialEnumLabel(selectedListRow.kind)}</UiBadge>
                    <UiBadge className={statusColorClass(selectedListRow.status)}>{socialEnumLabel(selectedListRow.status)}</UiBadge>
                  </div>
                  <CardTitle className="text-2xl">{selectedListRow.title?.trim() || "Untitled"}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="font-mono text-[10px] text-slate-500">ID: {selectedListRow.id}</span>
                    {detail?.workflowIntakeTitle || detail?.workflowIntakeId ? (
                      <span>
                        {" "}
                        · Intake: {detail?.workflowIntakeTitle ?? detail?.workflowIntakeId}
                      </span>
                    ) : null}
                    {detail?.campaignEventTitle || detail?.campaignEventId ? (
                      <span>
                        {" "}
                        · Event:{" "}
                        {detail?.campaignEventId ? (
                          <Link className="text-civic-slate underline" href={`/admin/events/${detail.campaignEventId}`}>
                            {detail?.campaignEventTitle ?? "View"}
                          </Link>
                        ) : (
                          (detail?.campaignEventTitle ?? "—")
                        )}
                      </span>
                    ) : null}
                    {detailLoading ? <span className="ml-1 text-amber-700">(loading detail…)</span> : null}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/admin/tasks"
                    className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
                  >
                    Open task board
                  </Link>
                  <Link
                    href={`/admin/workbench/comms/plans/new?socialItemId=${selectedListRow.id}`}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-civic-slate/30 bg-civic-slate/5 px-3 text-sm font-bold text-civic-slate hover:bg-civic-slate/10"
                  >
                    Create comms plan
                  </Link>
                  {detail?.workflowIntakeId ? (
                    <Link
                      href={`/admin/workbench/comms/plans/new?intakeId=${detail.workflowIntakeId}`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-civic-slate/30 bg-civic-slate/5 px-3 text-sm font-bold text-civic-slate hover:bg-civic-slate/10"
                      title="Source the new plan from the linked WorkflowIntake (not the social row)"
                    >
                      Comms from intake
                    </Link>
                  ) : null}
                  <UiButton
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setMediaLibraryOpen(true)}
                    title="Search indexed OwnedMedia; attach to this work item"
                  >
                    <Library className="h-4 w-4" />
                    Media library
                  </UiButton>
                  <UiButton variant="outline" className="rounded-xl" type="button" disabled title="Wire to Author Studio + export">
                    <Sparkles className="h-4 w-4" />
                    TODO: platform pack export
                  </UiButton>
                  <UiButton className="rounded-xl" type="button" disabled title="Use status + workflow, not a single click">
                    <CheckCircle2 className="h-4 w-4" />
                    Approve (workflow)
                  </UiButton>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {detailLoading ? (
                <p className="text-sm text-slate-500">Loading work item…</p>
              ) : detail ? (
                <ItemEditForm detail={detail} onSaved={onMutationDone} />
              ) : (
                <p className="text-sm text-amber-800">Could not load this work item. Try another in the queue.</p>
              )}

              {detail && !detailLoading ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Author Studio — saved alternate drafts</p>
                  <p className="mb-2 text-[10px] text-slate-500">
                    Structured <code className="rounded bg-slate-100 px-0.5">SocialContentDraft</code> rows; full actions live on the Studio tab.
                  </p>
                  {detail.drafts.length === 0 ? (
                    <p className="text-xs text-slate-600">No saved drafts for this work item. Use &quot;Save as alternate draft&quot; in the Studio → Compose tab.</p>
                  ) : (
                    <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
                      {detail.drafts.map((d) => (
                        <li key={d.id} className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-2">
                          <div className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
                            <span className="font-semibold text-slate-800">
                              {d.title?.trim() || d.sourceIntent || "Draft"}
                            </span>
                            <span className="shrink-0 text-[10px] text-slate-500">
                              {new Date(d.createdAt).toLocaleString()}
                              {d.isApplied ? " · applied" : ""}
                            </span>
                          </div>
                          {d.createdByName || d.createdByEmail ? (
                            <p className="mt-0.5 text-[10px] text-slate-500">By {d.createdByName ?? d.createdByEmail}</p>
                          ) : null}
                          <p className="mt-1 line-clamp-3 whitespace-pre-wrap font-mono text-[10px] text-slate-700">{d.bodyCopy}</p>
                          <p className="mt-1 text-[9px] text-slate-400">
                            {d.sourceRoute ?? "—"} · {d.sourceIntent ?? "—"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}

              {detail && !detailLoading ? (
                <SocialWorkbenchAttachedMediaSection
                  socialContentItemId={detail.id}
                  mediaRefs={detail.mediaRefs}
                  platformVariants={detail.platformVariants.map((v) => ({
                    id: v.id,
                    platform: v.platform,
                    label: v.accountLabel
                      ? `${socialEnumLabel(v.platform)} — ${v.accountLabel}`
                      : v.accountHandle
                        ? `${socialEnumLabel(v.platform)} — @${v.accountHandle}`
                        : socialEnumLabel(v.platform),
                  }))}
                  onChanged={onMutationDone}
                  onOpenMediaLibrary={() => setMediaLibraryOpen(true)}
                />
              ) : null}

              <UiTabs defaultValue="studio" className="mt-6 w-full">
                <UiTabsList className="grid w-full grid-cols-4 rounded-2xl bg-slate-100 p-1">
                  <UiTabsTrigger value="studio" className="rounded-xl">
                    Studio
                  </UiTabsTrigger>
                  <UiTabsTrigger value="variants" className="rounded-xl">
                    Variants
                  </UiTabsTrigger>
                  <UiTabsTrigger value="calendar" className="rounded-xl">
                    Calendar
                  </UiTabsTrigger>
                  <UiTabsTrigger value="analytics" className="rounded-xl">
                    Analytics
                  </UiTabsTrigger>
                </UiTabsList>

                <UiTabsContent value="studio" className="mt-6 space-y-4">
                  {workbenchContext ? (
                    <MasterAuthorStudio
                      key={workbenchContext.socialContentItemId}
                      workbenchContext={workbenchContext}
                      onOpenMediaLibrary={() => setMediaLibraryOpen(true)}
                      linkedMedia={detail?.mediaRefs ?? []}
                      platformVariantOptions={platformVariantsForLibrary}
                      onLinkedMediaRefresh={onMutationDone}
                      persistedContentDrafts={detail?.drafts ?? []}
                    />
                  ) : null}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase text-slate-500">Linked CampaignTask</p>
                    <TaskFlowCard statusColor={statusColorClass} tasks={taskFlowItems} />
                    {detail && !detailLoading ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
                        <p className="mb-2 text-[10px] font-bold uppercase text-slate-500">Create task sets (socialContentItemId set)</p>
                        <TaskPackButtons socialContentItemId={detail.id} onCreated={onMutationDone} />
                        <p className="mt-2 text-[10px] text-slate-500">TODO: Author Studio, video, and comms will attach outputs here as structured payloads.</p>
                      </div>
                    ) : detailLoading ? (
                      <p className="text-xs text-slate-500">Loading tasks…</p>
                    ) : null}
                  </div>
                </UiTabsContent>

                <UiTabsContent value="variants" className="mt-6 space-y-4">
                  {detailLoading ? (
                    <p className="text-sm text-slate-500">Loading…</p>
                  ) : detail ? (
                    <>
                      <p className="text-xs text-slate-500">
                        Each row is a <code className="text-[10px]">SocialPlatformVariant</code> for this work item. TODO: one-click sync from platform pack API.
                      </p>
                      <div className="grid gap-4 xl:grid-cols-2">
                        {detail.platformVariants.map((v) => (
                          <VariantCard
                            key={v.id}
                            v={v}
                            socialContentItemId={detail.id}
                            socialAccounts={socialAccounts}
                            onChanged={onMutationDone}
                          />
                        ))}
                      </div>
                      <Card className="rounded-3xl border-dashed border-slate-200">
                        <CardHeader>
                          <CardTitle className="text-base">Add platform variant</CardTitle>
                          <CardDescription>Another network slice or A/B for the same platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <VariantForm
                            mode="create"
                            socialContentItemId={detail.id}
                            socialAccounts={socialAccounts}
                            onDone={onMutationDone}
                          />
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <p className="text-sm text-amber-800">No detail loaded.</p>
                  )}
                </UiTabsContent>

                <UiTabsContent value="calendar" className="mt-6">
                  {detailLoading ? (
                    <p className="text-sm text-slate-500">Loading…</p>
                  ) : detail ? (
                    <Card className="rounded-3xl border-slate-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <CalendarDays className="h-5 w-5" />
                          Scheduled from variants
                        </CardTitle>
                        <CardDescription>Pulls <code className="text-[10px]">scheduledAt</code> on each variant. Full calendar + MCP scheduler — TODO.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {detail.platformVariants.filter((v) => v.scheduledAt).length === 0 ? (
                          <p className="text-sm text-slate-500">No scheduled slots yet. Set times on the Variants tab.</p>
                        ) : null}
                        {detail.platformVariants
                          .filter((v) => v.scheduledAt)
                          .map((v) => (
                            <div
                              key={v.id}
                              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                            >
                              <div>
                                <div className="text-sm font-semibold">{socialEnumLabel(v.platform)}</div>
                                <div className="text-xs text-slate-500">{new Date(v.scheduledAt!).toLocaleString()}</div>
                              </div>
                              <UiBadge className={statusColorClass(v.status)}>{socialEnumLabel(v.status)}</UiBadge>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  ) : (
                    <p className="text-sm text-slate-500">Nothing to show.</p>
                  )}
                </UiTabsContent>

                <UiTabsContent value="analytics" className="mt-6">
                  {detailLoading ? (
                    <p className="text-sm text-slate-500">Loading…</p>
                  ) : detail ? (
                    <SocialWorkbenchAnalyticsPanel detail={detail} onRefresh={onMutationDone} />
                  ) : (
                    <p className="text-sm text-amber-800">No detail loaded.</p>
                  )}
                </UiTabsContent>
              </UiTabs>
            </CardContent>
          </Card>
        )}
      </div>

      <MediaLibraryDrawer
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        socialContentItemId={selectedId}
        platformVariants={platformVariantsForLibrary}
        onAttachComplete={onMutationDone}
      />
    </div>
  );
}
