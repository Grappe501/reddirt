"use client";

import { BookOpen, FileSearch, Image as ImageIcon, PenLine, Scissors, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, UiButton } from "../social-ui-primitives";
import type { MasterAuthorStateHook } from "./useMasterAuthorState";
import type { MasterAuthorApiKey } from "./masterAuthorApiMap";

type Hook = MasterAuthorStateHook;

const groups: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { label: string; key: MasterAuthorApiKey; hint: string }[];
}[] = [
  {
    label: "Drafting",
    icon: PenLine,
    items: [
      { label: "Draft from brief", key: "composeDraft", hint: "Returns draft_set" },
      { label: "Rewrite / tighten", key: "composeRewrite", hint: "Returns draft_set" },
    ],
  },
  {
    label: "Research",
    icon: FileSearch,
    items: [
      { label: "Internal (file / campaign corpus)", key: "researchInternal", hint: "file search → research_memo" },
      { label: "Web research", key: "researchWeb", hint: "web search → research_memo" },
    ],
  },
  {
    label: "Platform pack",
    icon: BookOpen,
    items: [{ label: "Build / refresh platform pack", key: "transformPlatformPack", hint: "Returns platform_pack" }],
  },
  {
    label: "Visuals",
    icon: ImageIcon,
    items: [
      { label: "Generate image prompts", key: "visualsGeneratePrompts", hint: "visual_prompt_set" },
      { label: "Generate images", key: "visualsGenerateImages", hint: "visual_request" },
    ],
  },
  {
    label: "Video",
    icon: Scissors,
    items: [
      { label: "Analyze transcript", key: "videoAnalyzeTranscript", hint: "video_repurpose_plan" },
      { label: "Build cut plan", key: "videoBuildCutPlan", hint: "video_cut_plan" },
      { label: "Generate captions", key: "videoGenerateCaptions", hint: "caption_package" },
    ],
  },
  {
    label: "Package & export",
    icon: Send,
    items: [
      { label: "Create task package", key: "packageCreateTasks", hint: "task_package" },
      { label: "Export / publish package", key: "packageExport", hint: "export_package" },
    ],
  },
];

export function ActionRail({ hook }: { hook: Hook }) {
  const { runBackendAction, actionPending, lastAction } = hook;
  return (
    <Card className="h-fit max-h-[min(80vh,900px)] overflow-hidden rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 py-3">
        <CardTitle className="text-sm font-bold text-slate-800">Actions</CardTitle>
        <p className="text-xs text-slate-500">POST `/api/author-studio/*` — server returns structured `produces` + `data` (no client OpenAI).</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[min(72vh,800px)] overflow-y-auto p-2">
          {groups.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.label} className="mb-3 last:mb-0">
                <div className="mb-1.5 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Icon className="h-3.5 w-3.5" />
                  {g.label}
                </div>
                <ul className="space-y-1">
                  {g.items.map((it) => (
                    <li key={it.key + it.label + g.label}>
                      <UiButton
                        variant="outline"
                        size="sm"
                        className="h-auto w-full justify-start rounded-xl py-1.5 text-left text-xs"
                        disabled={actionPending}
                        onClick={() => {
                          void runBackendAction(it.key, it.label);
                        }}
                        title={it.hint}
                      >
                        {it.label}
                      </UiButton>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        {lastAction ? (
          <p
            className={cn("border-t border-slate-100 p-2 font-mono text-[10px] leading-relaxed text-slate-500")}
            role="status"
          >
            {lastAction}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
