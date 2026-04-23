"use client";

import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CommsPlanAudienceSegmentStatus, CommsPlanAudienceSegmentType } from "@prisma/client";
import { createCommsPlanAudienceSegmentAction } from "@/app/admin/contact-engagement-segment-actions";
import { commsPlanSegmentPath } from "@/lib/comms-workbench/comms-nav";
import type { CommsPlanAudienceSegmentListItem } from "@/lib/contact-engagement/dto";

const label = "mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const input = "w-full rounded border border-deep-soil/15 bg-white px-2 py-1.5 text-sm text-deep-soil";
const empty = "rounded border border-dashed border-deep-soil/15 bg-cream-canvas/50 px-3 py-3 text-sm text-deep-soil/60";

const DEFAULT_DYNAMIC_RULE = `{
  "version": "1",
  "logic": "AND",
  "conditions": []
}`;

type Props = { planId: string; segments: CommsPlanAudienceSegmentListItem[] };

export function CommsPlanSegmentsPanel({ planId, segments }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"static" | "dynamic">("static");
  const [ruleJson, setRuleJson] = useState(DEFAULT_DYNAMIC_RULE);

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const isDynamic = mode === "dynamic";
    let rule: unknown;
    if (isDynamic) {
      try {
        rule = JSON.parse(ruleJson) as unknown;
      } catch {
        setError("Rule JSON is not valid JSON.");
        return;
      }
    } else {
      rule = undefined;
    }
    const r = await createCommsPlanAudienceSegmentAction({
      communicationPlanId: planId,
      name: name.trim(),
      description: description.trim() || null,
      segmentType: isDynamic ? CommsPlanAudienceSegmentType.DYNAMIC : CommsPlanAudienceSegmentType.STATIC,
      isDynamic,
      status: CommsPlanAudienceSegmentStatus.ACTIVE,
      ruleDefinitionJson: rule,
    });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setName("");
    setDescription("");
    setMode("static");
    setRuleJson(DEFAULT_DYNAMIC_RULE);
    setOpen(false);
    startTransition(() => {
      router.push(commsPlanSegmentPath(planId, r.comsPlanAudienceSegmentId));
    });
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-sm text-amber-900" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen((o) => !o);
          }}
          className="rounded border border-civic-slate/30 bg-civic-slate/10 px-2 py-1 text-xs font-semibold text-civic-slate"
        >
          {open ? "Close" : "Create segment"}
        </button>
      </div>
      {open ? (
        <form onSubmit={onCreate} className="max-w-xl space-y-2 rounded border border-deep-soil/10 bg-cream-canvas/20 p-3">
          <p className="text-[10px] text-deep-soil/55">
            Static = manual members. Dynamic = rules stored only (not evaluated yet).
          </p>
          <div>
            <label className={label} htmlFor="sg-name">
              Name
            </label>
            <input id="sg-name" className={input} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className={label} htmlFor="sg-desc">
              Description
            </label>
            <textarea id="sg-desc" className={input} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <fieldset className="space-y-1">
            <span className={label}>Type</span>
            <div className="flex flex-col gap-1 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="sg-mode" checked={mode === "static"} onChange={() => setMode("static")} />
                Static (manual membership)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sg-mode" checked={mode === "dynamic"} onChange={() => setMode("dynamic")} />
                Dynamic (rules only — membership unevaluated)
              </label>
            </div>
          </fieldset>
          {mode === "dynamic" ? (
            <div>
              <label className={label} htmlFor="sg-rule">
                Rule definition (JSON, validated, not executed)
              </label>
              <textarea id="sg-rule" className={input + " font-mono text-xs"} rows={8} value={ruleJson} onChange={(e) => setRuleJson(e.target.value)} />
            </div>
          ) : null}
          <button
            type="submit"
            disabled={isPending}
            className="rounded border border-deep-soil/20 bg-deep-soil px-3 py-1.5 text-xs font-semibold text-cream-canvas disabled:opacity-50"
          >
            {isPending ? "…" : "Create & open detail"}
          </button>
        </form>
      ) : null}
      {segments.length === 0 ? (
        <p className={empty}>No segments yet. Create one to group plan recipients and targeting.</p>
      ) : (
        <ul className="space-y-1.5">
          {segments.map((s) => (
            <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded border border-deep-soil/8 bg-white px-2 py-1.5 text-sm">
              <div>
                <Link
                  className="font-semibold text-civic-slate hover:underline"
                  href={commsPlanSegmentPath(planId, s.id)}
                  onClick={refresh}
                >
                  {s.name}
                </Link>
                <span className="ml-2 text-[10px] text-deep-soil/50">
                  {s.status} · {s.isDynamic ? "Dynamic" : "Not dynamic"} · {s.segmentType}
                </span>
                {s.isDynamic ? (
                  <span className="ml-1 text-[10px] font-semibold text-amber-800">Membership unevaluated</span>
                ) : (
                  <span className="ml-1 text-[10px] text-deep-soil/45">
                    Members: {s.memberCount != null ? s.memberCount : "—"} ({s.memberCountNote})
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
