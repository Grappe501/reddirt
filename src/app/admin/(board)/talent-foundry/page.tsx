import Link from "next/link";
import { Suspense } from "react";
import {
  INTERVIEW_STATUS_LABELS,
  INTERN_DECISION_LABELS,
  PATHWAY_LABELS,
  type ConfirmedPathway,
} from "@/lib/talent-foundry/constants";
import { extractTalentFoundryBlob } from "@/lib/talent-foundry/evidence-map";
import {
  loadTalentFoundryIntakes,
  matchesListFilter,
  summarizeIntakes,
  type TalentFoundryListFilter,
} from "@/lib/talent-foundry/queries";
import { isUnreviewed, parseStaffState } from "@/lib/talent-foundry/staff-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function safeDate(d: Date | string | null | undefined): string {
  if (d == null) return "—";
  const t = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
}

function pill(href: string, label: string, active: boolean) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-kelly-text text-kelly-page" : "border border-kelly-text/10 bg-kelly-fog/60 text-kelly-slate"
      }`}
    >
      {label}
    </Link>
  );
}

function qs(f: TalentFoundryListFilter): string {
  const u = new URLSearchParams();
  if (f.q) u.set("q", f.q);
  if (f.view && f.view !== "all") u.set("view", f.view);
  if (f.filter) u.set("filter", f.filter);
  if (f.pathway) u.set("pathway", f.pathway);
  if (f.interview) u.set("interview", f.interview);
  if (f.intern) u.set("intern", f.intern);
  if (f.owner) u.set("owner", f.owner);
  const s = u.toString();
  return s ? `?${s}` : "";
}

function paidLabel(value: unknown): string {
  if (value === "yes") return "Paid interest";
  if (value === "both") return "Both";
  if (value === "volunteer") return "Volunteer";
  if (value === "unsure") return "Unsure";
  return "—";
}

function commitmentLabel(value: unknown): string {
  if (value === "yes") return "Will volunteer";
  if (value === "limited") return "Limited";
  if (value === "not_now") return "Not now";
  return "—";
}

async function CommandCenter({ searchParams }: { searchParams: TalentFoundryListFilter }) {
  let rows;
  try {
    rows = await loadTalentFoundryIntakes();
  } catch (e) {
    console.error("[talent-foundry command center]", e);
    return (
      <div className="rounded-lg border border-red-200/80 bg-red-50/95 px-4 py-3 text-sm text-red-900" role="alert">
        We couldn&apos;t load Talent Foundry records right now. Nothing was changed.
      </div>
    );
  }

  const filtered = rows.filter((r) => matchesListFilter(r, searchParams));
  const ranked =
    searchParams.view === "rank"
      ? [...filtered].sort((a, b) => {
          const ra = parseStaffState(a.metadata).humanRank;
          const rb = parseStaffState(b.metadata).humanRank;
          if (ra == null && rb == null) return 0;
          if (ra == null) return 1;
          if (rb == null) return -1;
          return ra - rb;
        })
      : filtered;
  const counts = summarizeIntakes(rows);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-kelly-text/10 bg-kelly-fog/40 px-4 py-5">
        <p className="font-body text-sm leading-relaxed text-kelly-slate">
          <span className="font-semibold text-kelly-ink">No Talent Foundry participants yet.</span> Records appear
          here only when someone completes identity through Foundry and writes into the canonical volunteer
          pipeline (<code className="text-xs">talent-foundry-kelly-beta</code>).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-kelly-navy/20 bg-white px-3 py-1 text-xs font-semibold text-kelly-navy">
          Total: {counts.total}
        </span>
        <span className="rounded-full border border-kelly-text/10 bg-kelly-fog/60 px-3 py-1 text-xs font-semibold text-kelly-slate">
          Unreviewed: {counts.unreviewed}
        </span>
        <span className="rounded-full border border-kelly-text/10 bg-kelly-fog/60 px-3 py-1 text-xs font-semibold text-kelly-slate">
          Paid-role interest: {counts.paid}
        </span>
        <span className="rounded-full border border-kelly-text/10 bg-kelly-fog/60 px-3 py-1 text-xs font-semibold text-kelly-slate">
          Interview queue: {counts.interview}
        </span>
        <span className="rounded-full border border-kelly-text/10 bg-kelly-fog/60 px-3 py-1 text-xs font-semibold text-kelly-slate">
          Volunteer pathway: {counts.volunteer}
        </span>
        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-950">
          Needs owner: {counts.needsOwner}
        </span>
      </div>

      <form className="flex flex-wrap items-end gap-2" method="get">
        {searchParams.view ? <input type="hidden" name="view" value={searchParams.view} /> : null}
        <label className="min-w-[12rem] flex-1 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
          Search
          <input
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Name, email, phone, ZIP, city"
            className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm text-kelly-ink"
          />
        </label>
        <button type="submit" className="rounded-md bg-kelly-navy px-3 py-2 text-xs font-semibold text-white">
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {pill(qs({ ...searchParams, filter: undefined }), "All", !searchParams.filter)}
        {pill(qs({ ...searchParams, filter: "unreviewed" }), "Unreviewed", searchParams.filter === "unreviewed")}
        {pill(qs({ ...searchParams, filter: "paid" }), "Paid-role interest", searchParams.filter === "paid")}
        {pill(qs({ ...searchParams, filter: "volunteer" }), "Willing to volunteer", searchParams.filter === "volunteer")}
        {pill(qs({ ...searchParams, filter: "headquarters" }), "Little Rock / HQ", searchParams.filter === "headquarters")}
        {pill(qs({ ...searchParams, filter: "remote" }), "Statewide / remote", searchParams.filter === "remote")}
        {pill(qs({ ...searchParams, filter: "leadership" }), "Leadership interest", searchParams.filter === "leadership")}
        {pill(qs({ ...searchParams, owner: searchParams.owner === "needs" ? undefined : "needs" }), "Needs owner", searchParams.owner === "needs")}
        {pill(qs({ ...searchParams, filter: "keyOne" }), "Key One", searchParams.filter === "keyOne")}
        {pill(qs({ ...searchParams, filter: "complete" }), "Journey complete", searchParams.filter === "complete")}
        {pill(qs({ ...searchParams, view: searchParams.view === "rank" ? "all" : "rank" }), "Human rank board", searchParams.view === "rank")}
      </div>

      <div className="overflow-x-auto rounded-lg border border-kelly-text/10 bg-kelly-page">
        <table className="w-full min-w-[1080px] border-collapse text-left font-body text-sm">
          <thead>
            <tr className="border-b border-kelly-text/10 bg-kelly-fog/60">
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Name</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Place</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Start</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Paid / volunteer</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Pathway</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Journey</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Team contact</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Interview / rank</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Intern</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Updated</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r) => {
              const staff = parseStaffState(r.metadata);
              const blob = extractTalentFoundryBlob(r.metadata, r.submission?.structuredData);
              const flags = isRecord(blob.flags) ? blob.flags : {};
              const routing = isRecord(blob.routing) ? blob.routing : {};
              const user = r.submission?.user;
              const city = isRecord(r.metadata) && typeof r.metadata.city === "string" ? r.metadata.city : "";
              const doors = Array.isArray(flags.optionalDoorsCompleted) ? flags.optionalDoorsCompleted.length : 0;
              const pathwayId = staff.pathway || (typeof routing.pathwayId === "string" ? routing.pathwayId : "");
              const areas = staff.areaAssignment.length
                ? staff.areaAssignment
                : Array.isArray(routing.areas)
                  ? routing.areas.map(String)
                  : [];
              return (
                <tr key={r.id} className="border-b border-kelly-text/5 align-top">
                  <td className="p-2.5">
                    <Link className="font-semibold text-kelly-navy underline" href={`/admin/talent-foundry/${r.id}`}>
                      {user?.name || r.title || "—"}
                    </Link>
                    <div className="text-xs text-kelly-slate">{user?.email || "—"}</div>
                  </td>
                  <td className="p-2.5 text-kelly-slate">
                    <div>{[city, user?.county, user?.zip].filter(Boolean).join(" · ") || "—"}</div>
                  </td>
                  <td className="p-2.5 text-kelly-slate text-xs">
                    {typeof blob.startWhen === "string" && blob.startWhen.trim() ? blob.startWhen : "—"}
                  </td>
                  <td className="p-2.5 text-kelly-slate">
                    <div>{paidLabel(routing.paidInterest)}</div>
                    <div className="text-xs text-kelly-subtle">{commitmentLabel(flags.volunteerCommitment)}</div>
                  </td>
                  <td className="p-2.5 text-kelly-slate">
                    <div>
                      {pathwayId && pathwayId in PATHWAY_LABELS
                        ? PATHWAY_LABELS[pathwayId as ConfirmedPathway]
                        : pathwayId || "—"}
                    </div>
                    <div className="text-xs text-kelly-subtle">{areas.slice(0, 3).join(", ") || "—"}</div>
                  </td>
                  <td className="p-2.5 text-xs text-kelly-slate">
                    <div>{flags.requiredScenarioComplete ? "Required done" : "In progress"}</div>
                    <div>Doors {doors}/4 {flags.keyOne ? "· Key One" : ""}</div>
                  </td>
                  <td className="p-2.5">
                    {r.assignedUser ? (
                      <div className="text-xs text-kelly-slate">
                        <div className="font-semibold text-kelly-ink">{r.assignedUser.name || r.assignedUser.email}</div>
                        <div>Team contact</div>
                      </div>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                        Needs owner
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-xs text-kelly-slate">
                    <div>{INTERVIEW_STATUS_LABELS[staff.interviewStatus]}</div>
                    <div>
                      {staff.humanRank != null ? `#${staff.humanRank}` : isUnreviewed(staff) ? "Unranked" : "—"}
                    </div>
                  </td>
                  <td className="p-2.5 text-xs text-kelly-slate">{INTERN_DECISION_LABELS[staff.internDecision]}</td>
                  <td className="p-2.5 whitespace-nowrap text-xs text-kelly-slate">{safeDate(r.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="font-body text-xs text-kelly-subtle">{ranked.length} shown. Human rank is staff-entered only — not an AI score.</p>
    </div>
  );
}

export default async function TalentFoundryCommandCenterPage({
  searchParams,
}: {
  searchParams: Promise<TalentFoundryListFilter>;
}) {
  const sp = await searchParams;
  return (
    <div className="min-w-0 p-4 md:p-6">
      <div className="mb-8 max-w-3xl">
        <Link href="/admin/workbench" className="text-sm font-semibold text-kelly-slate hover:underline">
          ← Campaign workbench
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold text-kelly-text">Talent Foundry — command center</h1>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">
          Campaign cockpit for Kelly Grappe Talent Foundry participants. The system organizes evidence. Humans
          review, rank, assign, interview, place, and decide. Intern = No does not mean the person is rejected
          from the campaign.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-lg border border-kelly-text/15 bg-kelly-fog/50 p-6" role="status">
            <p className="font-body text-sm text-kelly-slate">Loading Talent Foundry records…</p>
          </div>
        }
      >
        <CommandCenter searchParams={sp} />
      </Suspense>
    </div>
  );
}
