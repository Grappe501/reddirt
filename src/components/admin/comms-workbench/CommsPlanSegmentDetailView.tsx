"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CommsPlanAudienceSegmentStatus } from "@prisma/client";
import {
  addCommsPlanAudienceSegmentMemberAction,
  archiveCommsPlanAudienceSegmentAction,
  removeCommsPlanAudienceSegmentMemberAction,
  updateCommsPlanAudienceSegmentAction,
} from "@/app/admin/contact-engagement-segment-actions";
import { commsPlanPath, COMMS_PLAN_SECTION } from "@/lib/comms-workbench/comms-nav";
import type { CommsPlanAudienceSegmentDetail } from "@/lib/contact-engagement/dto";

const label = "mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-kelly-text/55";
const input = "w-full rounded border border-kelly-text/15 bg-white px-2 py-1.5 text-sm text-kelly-text";
const card = "rounded-md border border-kelly-text/10 bg-white p-3 shadow-sm";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55";

type Props = { communicationPlanId: string; planTitle: string; segment: CommsPlanAudienceSegmentDetail };

export function CommsPlanSegmentDetailView({ communicationPlanId, planTitle, segment: initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [ruleJson, setRuleJson] = useState(() =>
    JSON.stringify(initial.ruleDefinitionJson ?? {}, null, 2)
  );
  const [memberMode, setMemberMode] = useState<"userId" | "volunteerProfileId" | "crmContactKey">("userId");
  const [memberValue, setMemberValue] = useState("");

  useEffect(() => {
    setName(initial.name);
    setDescription(initial.description ?? "");
    setRuleJson(JSON.stringify(initial.ruleDefinitionJson ?? {}, null, 2));
  }, [initial.id, initial.updatedAt, initial.name, initial.description, initial.ruleDefinitionJson]);

  const canMembers = initial.isManualMembershipAllowed;
  const members = initial.members;

  const backHref = useMemo(
    () => commsPlanPath(communicationPlanId, COMMS_PLAN_SECTION.segments),
    [communicationPlanId]
  );

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  async function onSaveMeta(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(ruleJson) as unknown;
    } catch {
      setError("Rule / hint JSON is not valid JSON.");
      return;
    }
    const r = await updateCommsPlanAudienceSegmentAction({
      communicationPlanId,
      comsPlanAudienceSegmentId: initial.id,
      name: name.trim(),
      description: description.trim() || null,
      ruleDefinitionJson: parsed,
    });
    if (!r.ok) setError(r.error);
    else refresh();
  }

  async function onArchive() {
    if (!window.confirm("Archive this segment? Membership rows are kept; the segment is hidden from active use.")) return;
    setError(null);
    const r = await archiveCommsPlanAudienceSegmentAction({
      communicationPlanId,
      comsPlanAudienceSegmentId: initial.id,
    });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    startTransition(() => router.push(backHref));
  }

  async function onAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!canMembers) return;
    setError(null);
    const v = memberValue.trim();
    if (!v) {
      setError("Enter a value.");
      return;
    }
    const base = {
      communicationPlanId,
      comsPlanAudienceSegmentId: initial.id,
      sourceType: "MANUAL" as const,
    };
    const r = await addCommsPlanAudienceSegmentMemberAction(
      memberMode === "userId"
        ? { ...base, userId: v }
        : memberMode === "volunteerProfileId"
          ? { ...base, volunteerProfileId: v }
          : { ...base, crmContactKey: v }
    );
    if (!r.ok) setError(r.error);
    else {
      setMemberValue("");
      refresh();
    }
  }

  async function onRemoveMember(memberId: string) {
    if (!canMembers) return;
    if (!window.confirm("Remove this member from the segment?")) return;
    setError(null);
    const r = await removeCommsPlanAudienceSegmentMemberAction({
      communicationPlanId,
      comsPlanAudienceSegmentId: initial.id,
      memberId,
    });
    if (!r.ok) setError(r.error);
    else refresh();
  }

  return (
    <div className="min-w-0 space-y-5 p-1">
      <div className="text-[11px] text-kelly-text/60">
        <Link className="font-semibold text-kelly-slate" href={backHref}>
          ← {planTitle}
        </Link>
      </div>
      <header className="border-b border-kelly-text/10 pb-2">
        <p className={h2}>Audience segment</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-text">{initial.name}</h1>
        <p className="mt-1 text-sm text-kelly-text/70">
          {initial.isDynamic ? (
            <span className="font-semibold text-amber-800">Dynamic — membership is not hand-maintained (rules stored only; not evaluated yet).</span>
          ) : (
            <span>Static — manual members {initial.status === "ARCHIVED" ? "(archived)" : null}</span>
          )}{" "}
          · Type {initial.segmentType} · {initial.status}
        </p>
      </header>

      {error ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-sm text-amber-900" role="alert">
          {error}
        </p>
      ) : null}

      {initial.status === "ACTIVE" ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onArchive}
            disabled={isPending}
            className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-950"
          >
            Archive segment
          </button>
        </div>
      ) : (
        <p className="text-sm text-kelly-text/60">This segment is archived. Un-archive is not in this release — duplicate if needed.</p>
      )}

      <section className={card}>
        <h2 className={h2}>Edit</h2>
        <p className="mb-2 text-xs text-kelly-text/55">Rule JSON is validated for shape on save. Nothing is executed server-side in CE-4.</p>
        <form onSubmit={onSaveMeta} className="max-w-2xl space-y-2">
          <div>
            <label className={label} htmlFor="edit-name">
              Name
            </label>
            <input id="edit-name" className={input} value={name} onChange={(e) => setName(e.target.value)} required disabled={initial.status !== CommsPlanAudienceSegmentStatus.ACTIVE} />
          </div>
          <div>
            <label className={label} htmlFor="edit-desc">
              Description
            </label>
            <textarea
              id="edit-desc"
              className={input}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={initial.status !== CommsPlanAudienceSegmentStatus.ACTIVE}
            />
          </div>
          <div>
            <label className={label} htmlFor="edit-rule">
              ruleDefinitionJson
            </label>
            <textarea
              id="edit-rule"
              className={input + " font-mono text-xs"}
              rows={12}
              value={ruleJson}
              onChange={(e) => setRuleJson(e.target.value)}
              disabled={initial.status !== CommsPlanAudienceSegmentStatus.ACTIVE}
            />
          </div>
          {initial.status === "ACTIVE" ? (
            <button
              type="submit"
              disabled={isPending}
              className="rounded border border-kelly-text/20 bg-kelly-text px-3 py-1.5 text-xs font-semibold text-kelly-page disabled:opacity-50"
            >
              Save
            </button>
          ) : null}
        </form>
      </section>

      <section className={card}>
        <h2 className={h2}>Members</h2>
        {!canMembers ? (
          <p className="text-sm text-kelly-text/65">
            Manual membership is only for active static segments. For dynamic groups, use rule JSON above; evaluation comes in a
            later packet.
          </p>
        ) : members.length === 0 ? (
          <p className="text-sm text-kelly-text/60">No members yet.</p>
        ) : (
          <ul className="mt-1 space-y-1.5">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-start justify-between gap-2 border-b border-kelly-text/6 pb-1.5 text-sm last:border-0">
                <div>
                  <p className="font-medium text-kelly-text">{m.identity.displayLabel}</p>
                  <p className="text-[10px] text-kelly-text/50">
                    {m.identity.identityType} · {m.sourceType} · {new Date(m.createdAt).toLocaleString()}
                    {m.addedBy ? ` · added by ${m.addedBy.nameLabel ?? m.addedBy.email}` : null}
                  </p>
                </div>
                {initial.status === "ACTIVE" ? (
                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-amber-800 hover:underline"
                    onClick={() => onRemoveMember(m.id)}
                    disabled={isPending}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {canMembers && initial.status === "ACTIVE" ? (
          <form onSubmit={onAddMember} className="mt-3 max-w-md space-y-2 border-t border-kelly-text/8 pt-2">
            <p className="text-[10px] text-kelly-text/55">Add by internal id. Duplicates are rejected.</p>
            <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <span className={label}>Identity</span>
                <select className={input} value={memberMode} onChange={(e) => setMemberMode(e.target.value as typeof memberMode)}>
                  <option value="userId">userId</option>
                  <option value="volunteerProfileId">volunteerProfileId</option>
                  <option value="crmContactKey">crmContactKey</option>
                </select>
              </div>
              <div className="min-w-0 flex-[2]">
                <span className={label}>Value</span>
                <input className={input} value={memberValue} onChange={(e) => setMemberValue(e.target.value)} placeholder="cuid or key" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="rounded border border-kelly-slate/30 bg-kelly-slate/10 px-2 py-1 text-xs font-semibold text-kelly-slate"
            >
              Add member
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
