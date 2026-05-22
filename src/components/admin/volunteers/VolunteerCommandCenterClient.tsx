"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { VolunteerSystemBundle } from "@/lib/campaign-events/volunteers/load-volunteer-bundle";
import type { VolunteerProfile } from "@/lib/campaign-events/volunteers/volunteer-types";
import { VOLUNTEER_COPILOTS } from "@/lib/campaign-events/volunteers/volunteer-copilots";
import { VOLUNTEER_TRAINING_MODULES } from "@/lib/campaign-events/volunteers/volunteer-training-modules";
import { VOLUNTEER_COMMS_SAFETY_NOTE } from "@/lib/campaign-events/volunteers/volunteer-communications-planner";
import { createVolunteerProfileAction } from "@/app/admin/volunteer-actions";

export function VolunteerCommandCenterClient({
  bundle,
  profiles: initialProfiles,
}: {
  bundle: VolunteerSystemBundle;
  profiles: VolunteerProfile[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [countyFilter, setCountyFilter] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("");

  const filtered = useMemo(() => {
    const c = countyFilter.trim().toLowerCase();
    if (!c) return profiles;
    return profiles.filter((p) => p.county?.toLowerCase().includes(c));
  }, [profiles, countyFilter]);

  function addVolunteer() {
    if (!email.trim()) return;
    startTransition(async () => {
      const res = await createVolunteerProfileAction({
        firstName: firstName.trim() || "Volunteer",
        lastName: lastName.trim(),
        email: email.trim(),
        county: county.trim() || undefined,
        source: "manual:volunteer-command-center",
        consentStatus: "import_review",
      });
      if (res.ok) {
        router.refresh();
        setFirstName("");
        setLastName("");
        setEmail("");
        setCounty("");
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 pb-16 font-body">
      <header className="rounded-3xl border border-kelly-navy/20 bg-kelly-navy/[0.05] p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-kelly-slate">Kelly Campaign OS</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-navy">Volunteer command center</h1>
        <p className="mt-3 max-w-2xl text-sm text-kelly-text/75">
          Statewide volunteer lifecycle: recruit → intake → train → assign → thank → retain. AI recommends; humans approve. No
          automatic email or text sends.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/volunteers/intake" className="rounded-full border border-kelly-navy/25 px-4 py-2 text-xs font-bold text-kelly-navy">
            Signup sheet intake →
          </Link>
          <Link href="/admin/relational-contacts" className="rounded-full border px-4 py-2 text-xs font-bold">
            Relational CRM (REL-2)
          </Link>
          <Link href="/admin/communications" className="rounded-full border px-4 py-2 text-xs font-bold">
            Communications (drafts)
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950">
        <strong>Safety:</strong> {VOLUNTEER_COMMS_SAFETY_NOTE}
      </section>

      <section className="rounded-2xl border p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">1. Volunteer overview</h2>
        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
          <div><dt className="font-bold">Profiles (V1 JSON)</dt><dd>{bundle.volunteerCount}</dd></div>
          <div><dt className="font-bold">Training gaps</dt><dd>{bundle.trainingGaps}</dd></div>
          <div><dt className="font-bold">Retention risks</dt><dd>{bundle.retentionRisks}</dd></div>
          <div><dt className="font-bold">Leadership prospects</dt><dd>{bundle.leadershipProspects}</dd></div>
          <div><dt className="font-bold">Follow-up needed</dt><dd>{bundle.followUpNeeded}</dd></div>
          <div><dt className="font-bold">Training modules</dt><dd>{bundle.modulesAvailable}</dd></div>
        </dl>
        <p className="mt-2 text-[10px] text-kelly-text/55">Power of 5: {bundle.powerOfFiveSummary}</p>
      </section>

      <section className="rounded-2xl border p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">2–4. Pipeline · training · assignments</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-text/75">
          {bundle.recommendedActions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-bold">County coverage gaps: {bundle.countyCoverageGaps.join(", ") || "—"}</p>
        <p className="text-xs">Pending assignment recommendations: {bundle.eventStaffingGaps}</p>
      </section>

      <section className="rounded-2xl border p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">5–9. County · events · P5 · follow-up · leaders</h2>
        <p className="mt-2 text-xs text-kelly-text/70">
          County intelligence bridge feeds gaps. Event staffing wired on event drilldown. Prisma REL-2 and signup intake remain
          authoritative for production CRM when DB is up.
        </p>
        <Link href="/admin/county-intelligence" className="mt-2 inline-block text-xs font-bold text-kelly-navy underline">
          County intelligence →
        </Link>
      </section>

      <section className="rounded-2xl border p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">10. AI recommendations & copilots</h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {VOLUNTEER_COPILOTS.slice(0, 4).map((cp) => (
            <li key={cp.id} className="rounded-lg border border-kelly-text/10 p-3 text-xs">
              <p className="font-bold text-kelly-navy">{cp.title}</p>
              <p className="mt-1 text-kelly-text/65">{cp.mission}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Volunteer list</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="rounded border px-2 py-1 text-xs"
            placeholder="Filter county"
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
          />
        </div>
        <ul className="mt-3 divide-y text-xs">
          {filtered.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-2">
              <span>
                {p.firstName} {p.lastName} · {p.email} · {p.county ?? "—"}
              </span>
              <Link href={`/admin/volunteers/${p.id}`} className="font-bold text-kelly-navy underline">
                Profile →
              </Link>
            </li>
          ))}
          {filtered.length === 0 ? <li className="py-4 text-kelly-text/55">No volunteers yet — add below or use intake.</li> : null}
        </ul>
      </section>

      <section className="rounded-2xl border p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Add volunteer (manual)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input className="rounded border px-2 py-1 text-xs" placeholder="First" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input className="rounded border px-2 py-1 text-xs" placeholder="Last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <input className="rounded border px-2 py-1 text-xs" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="rounded border px-2 py-1 text-xs" placeholder="County slug" value={county} onChange={(e) => setCounty(e.target.value)} />
          <button
            type="button"
            disabled={pending}
            onClick={addVolunteer}
            className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Add volunteer"}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-kelly-text/55">Import CSV scaffold — use ECC import for bulk; consent review required.</p>
      </section>

      <section className="rounded-2xl border p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Training modules ({VOLUNTEER_TRAINING_MODULES.length})</h2>
        <ul className="mt-2 max-h-40 overflow-y-auto text-[10px] text-kelly-text/70">
          {VOLUNTEER_TRAINING_MODULES.map((m) => (
            <li key={m.id}>
              {m.title} · {m.estimatedMinutes}m · {m.difficulty}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
