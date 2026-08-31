import type { ReactNode } from "react";
import Link from "next/link";
import {
  AREA_ASSIGNMENTS,
  CONFIRMED_PATHWAYS,
  INTERN_DECISION_LABELS,
  INTERN_DECISIONS,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_STATUSES,
  PATHWAY_LABELS,
} from "@/lib/talent-foundry/constants";
import { extractTalentFoundryBlob, organizeEvidence } from "@/lib/talent-foundry/evidence-map";
import { loadTalentFoundryIntake } from "@/lib/talent-foundry/queries";
import { parseStaffState } from "@/lib/talent-foundry/staff-state";
import {
  addTalentFoundryNoteAction,
  assignTalentFoundryOwnerAction,
  clearTalentFoundryOwnerAction,
  updateTalentFoundryStaffAction,
} from "../actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-kelly-text/10 bg-kelly-page p-4">
      <h2 className="font-heading text-[11px] font-bold uppercase tracking-wider text-kelly-muted">{title}</h2>
      <div className="mt-3 space-y-2 font-body text-sm text-kelly-text">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{label}</div>
      <div className="text-kelly-ink">{value || "—"}</div>
    </div>
  );
}

function journeyBits(blob: Record<string, unknown>) {
  const evidence = Array.isArray(blob.evidence) ? blob.evidence : [];
  const find = (stateId: string) =>
    evidence.find((e) => isRecord(e) && e.stateId === stateId) as Record<string, unknown> | undefined;
  const format = (v: unknown): string => {
    if (typeof v === "string") return v;
    if (isRecord(v)) {
      const bits = [v.label, v.choiceLabel, v.answer, v.reasoning, v.explanation]
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .join(" — ");
      return bits || "—";
    }
    return "—";
  };
  return {
    opening: format(find("change_prompt")?.value),
    willingness: format(find("willingness")?.value),
    revision: format(find("scenario_revision")?.value),
    decisions: evidence
      .filter((e) => isRecord(e) && (e.stateId === "scenario_volunteers" || String(e.stateId).startsWith("door_")))
      .map((e) => (isRecord(e) ? { label: String(e.label ?? e.stateId), text: format(e.value) } : null))
      .filter(Boolean) as { label: string; text: string }[],
  };
}

export default async function TalentFoundryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ intakeId: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { intakeId } = await params;
  const sp = await searchParams;
  const row = await loadTalentFoundryIntake(intakeId);
  if (!row) {
    return (
      <div className="p-6">
        <Link href="/admin/talent-foundry" className="text-sm font-semibold text-kelly-slate hover:underline">
          ← Talent Foundry
        </Link>
        <p className="mt-4 font-body text-sm text-kelly-slate">That participant is not a Talent Foundry record.</p>
      </div>
    );
  }

  const staff = parseStaffState(row.metadata);
  const blob = extractTalentFoundryBlob(row.metadata, row.submission?.structuredData);
  const flags = isRecord(blob.flags) ? blob.flags : {};
  const routing = isRecord(blob.routing) ? blob.routing : {};
  const user = row.submission?.user;
  const city = isRecord(row.metadata) && typeof row.metadata.city === "string" ? row.metadata.city : "";
  const buckets = organizeEvidence(blob);
  const journey = journeyBits(blob);
  const doors = Array.isArray(flags.optionalDoorsCompleted) ? flags.optionalDoorsCompleted : [];

  return (
    <div className="min-w-0 space-y-4 p-4 md:p-6">
      <div>
        <Link href="/admin/talent-foundry" className="text-sm font-semibold text-kelly-slate hover:underline">
          ← Talent Foundry command center
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold text-kelly-text">{user?.name || row.title || "Participant"}</h1>
        <p className="mt-1 font-body text-sm text-kelly-slate">
          Evidence record. Humans decide. Intern = No does not remove this person from the campaign.
        </p>
        {sp.notice ? <p className="mt-2 text-sm font-semibold text-kelly-navy">Saved.</p> : null}
        {sp.error === "owner-not-found" ? (
          <p className="mt-2 text-sm text-red-800">No User matches that email. Assign only an existing campaign person.</p>
        ) : null}
        {sp.error === "owner-email" ? <p className="mt-2 text-sm text-red-800">Enter an owner email.</p> : null}
        {sp.error === "note" ? <p className="mt-2 text-sm text-red-800">Write a note before saving.</p> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Identity">
          <Field label="Name" value={user?.name} />
          <Field label="Email" value={user?.email} />
          <Field label="Phone" value={user?.phone} />
          <Field label="Geography" value={[city, user?.county, user?.zip].filter(Boolean).join(" · ")} />
          <Field label="Start availability" value={typeof blob.startWhen === "string" ? blob.startWhen : ""} />
          <Field label="User id" value={user?.id} />
          <Field label="Submission id" value={row.submission?.id} />
          <Field label="Intake id" value={row.id} />
        </Section>

        <Section title="Participation">
          <Field label="Volunteer commitment" value={typeof flags.volunteerCommitment === "string" ? flags.volunteerCommitment : ""} />
          <Field label="Paid interest" value={typeof routing.paidInterest === "string" ? routing.paidInterest : ""} />
          <Field
            label="Practical availability"
            value={[
              typeof routing.weekly === "string" ? `Weekly: ${routing.weekly}` : "",
              Array.isArray(routing.times) ? `Times: ${routing.times.join(", ")}` : "",
              typeof routing.littleRock === "string" ? `HQ: ${routing.littleRock}` : "",
              typeof routing.remote === "string" ? `Remote: ${routing.remote}` : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          />
          <Field
            label="Selected contribution areas"
            value={Array.isArray(routing.areas) ? routing.areas.map(String).join(", ") : ""}
          />
          <Field label="Suggested pathway" value={typeof routing.pathwayId === "string" ? routing.pathwayId : ""} />
          <Field label="First mission" value={typeof routing.missionId === "string" ? routing.missionId : ""} />
        </Section>
      </div>

      <Section title="Journey">
        <Field label="Opening response" value={journey.opening} />
        <Field label="Willingness" value={journey.willingness} />
        <Field label="Required scenario / revision" value={journey.revision} />
        <Field label="Optional doors" value={doors.length ? doors.map(String).join(", ") : "None completed"} />
        <Field label="Key One" value={flags.keyOne === true ? "Acquired" : "Not acquired"} />
        <Field label="Required journey" value={flags.requiredScenarioComplete === true ? "Complete" : "Incomplete"} />
        {journey.decisions.length ? (
          <ul className="mt-2 space-y-2">
            {journey.decisions.map((d, i) => (
              <li key={`${d.label}-${i}`} className="rounded-md border border-kelly-text/10 bg-kelly-fog/40 px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{d.label}</div>
                <div>{d.text}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-kelly-subtle">Not enough evidence yet</p>
        )}
      </Section>

      <Section title="Evidence — not a verdict">
        <div className="grid gap-3 md:grid-cols-2">
          {buckets.map((bucket) => (
            <div key={bucket.id} className="rounded-md border border-kelly-text/10 bg-kelly-fog/30 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{bucket.label}</div>
              {bucket.items.length === 0 ? (
                <p className="mt-1 text-kelly-subtle">Not enough evidence yet</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {bucket.items.map((item, i) => (
                    <li key={`${bucket.id}-${i}`}>
                      <span className="font-semibold">{item.label}: </span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Human controls">
        <div className={`mb-3 rounded-md px-3 py-2 text-sm font-semibold ${row.assignedUser ? "bg-kelly-fog/60 text-kelly-ink" : "bg-amber-100 text-amber-950"}`}>
          {row.assignedUser
            ? `TEAM CONTACT — ${row.assignedUser.name || row.assignedUser.email}`
            : "NEEDS OWNER — assign a campaign relationship owner"}
        </div>

        <form action={assignTalentFoundryOwnerAction} className="mb-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="intakeId" value={row.id} />
          <label className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Assign team contact by existing User email
            <input
              name="ownerEmail"
              type="email"
              className="mt-1 block w-72 rounded-md border border-kelly-text/15 px-3 py-2 text-sm"
              placeholder="staff@…"
            />
          </label>
          <button type="submit" className="rounded-md bg-kelly-navy px-3 py-2 text-xs font-semibold text-white">
            Assign owner
          </button>
        </form>
        {row.assignedUser ? (
          <form action={clearTalentFoundryOwnerAction} className="mb-4">
            <input type="hidden" name="intakeId" value={row.id} />
            <button type="submit" className="text-xs font-semibold text-kelly-slate underline">
              Clear owner (returns to NEEDS OWNER)
            </button>
          </form>
        ) : null}

        <form action={updateTalentFoundryStaffAction} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="intakeId" value={row.id} />
          <label className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Human review rank
            <input
              name="humanRank"
              type="number"
              min={1}
              max={999}
              defaultValue={staff.humanRank ?? ""}
              className="mt-1 block w-full rounded-md border border-kelly-text/15 px-3 py-2 text-sm"
              placeholder="Blank = unranked"
            />
          </label>
          <label className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Interview status
            <select
              name="interviewStatus"
              defaultValue={staff.interviewStatus}
              className="mt-1 block w-full rounded-md border border-kelly-text/15 px-3 py-2 text-sm"
            >
              {INTERVIEW_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {INTERVIEW_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Interviewer / assigned staff
            <input
              name="interviewer"
              defaultValue={staff.interviewer}
              className="mt-1 block w-full rounded-md border border-kelly-text/15 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
            Intern decision
            <select
              name="internDecision"
              defaultValue={staff.internDecision}
              className="mt-1 block w-full rounded-md border border-kelly-text/15 px-3 py-2 text-sm"
            >
              {INTERN_DECISIONS.map((s) => (
                <option key={s} value={s}>
                  {INTERN_DECISION_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle md:col-span-2">
            Confirmed pathway
            <select
              name="pathway"
              defaultValue={staff.pathway ?? ""}
              className="mt-1 block w-full rounded-md border border-kelly-text/15 px-3 py-2 text-sm"
            >
              <option value="">Not confirmed</option>
              {CONFIRMED_PATHWAYS.map((s) => (
                <option key={s} value={s}>
                  {PATHWAY_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="md:col-span-2">
            <legend className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Area assignment</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
              {AREA_ASSIGNMENTS.map((area) => (
                <label key={area.id} className="flex items-center gap-2 text-sm font-normal normal-case tracking-normal text-kelly-ink">
                  <input
                    type="checkbox"
                    name="areaAssignment"
                    value={area.id}
                    defaultChecked={staff.areaAssignment.includes(area.id)}
                  />
                  {area.label}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="rounded-md bg-kelly-navy px-3 py-2 text-xs font-semibold text-white">
            Save human decisions
          </button>
        </form>
      </Section>

      <Section title="Staff notes">
        <form action={addTalentFoundryNoteAction} className="space-y-2">
          <input type="hidden" name="intakeId" value={row.id} />
          <textarea
            name="note"
            rows={3}
            className="w-full rounded-md border border-kelly-text/15 px-3 py-2 text-sm"
            placeholder="Operational note. This writes a WorkflowAction NOTE."
          />
          <button type="submit" className="rounded-md bg-kelly-navy px-3 py-2 text-xs font-semibold text-white">
            Add note
          </button>
        </form>
        <ul className="mt-3 space-y-2">
          {row.actions.length === 0 ? <li className="text-kelly-subtle">No staff actions yet.</li> : null}
          {row.actions.map((a) => (
            <li key={a.id} className="rounded-md border border-kelly-text/10 bg-kelly-fog/40 px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
                {a.kind} · {a.createdAt.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
              </div>
              <div>{a.summary}</div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
