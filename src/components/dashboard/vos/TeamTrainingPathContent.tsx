"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CopyTextButton } from "@/components/volunteer/CopyTextButton";
import { KellyAccentCutout } from "@/components/dashboard/vos/KellyAccentCutout";
import { KELLY_ACCENT_TRAINING } from "@/lib/campaign-assets";

export type TrainingModule = {
  id: string;
  title: string;
  readMinutes: string;
  checklist: string[];
  links: { label: string; href: string }[];
};

const MODULES: TrainingModule[] = [
  {
    id: "start-here",
    title: "Start here",
    readMinutes: "5 min",
    checklist: ["You know your team code and geography", "You’ve opened the Overview tab once this week"],
    links: [
      { label: "Volunteer onboarding", href: "/volunteer" },
      { label: "Self-Building Team System (playbook)", href: "/field-playbook/overview/self-building-team-system" },
    ],
  },
  {
    id: "triad",
    title: "How to build a 3-person team",
    readMinutes: "8 min",
    checklist: ["You can name the three lanes", "You have a plan for the next invite"],
    links: [
      { label: "Field playbook · fractal model", href: "/field-playbook/structure/fractal-overview" },
      { label: "Build your team (site)", href: "/volunteer#build-three-person-team" },
    ],
  },
  {
    id: "invite-members",
    title: "How to invite team members",
    readMinutes: "6 min",
    checklist: ["Invites are private and specific to one lane", "Declines stay dignified"],
    links: [
      { label: "Recruitment pitch & FAQ", href: "/field-playbook/recruitment/pitch-and-faq" },
      { label: "Email templates", href: "/volunteer/resources/email-templates" },
    ],
  },
  {
    id: "graphic-design-canva",
    title: "Basic Graphic Design / Canva (Social lane)",
    readMinutes: "12 min",
    checklist: [
      "Canva basics: templates, text boxes, safe margins, and duplicate-to-iterate",
      "Brand colors and fonts — pull from the campaign brand kit; do not invent new colors",
      "Logo usage: approved marks only; do not stretch or recolor against guidelines",
      "Headshots: use Kelly headshot library paths; no filters that misrepresent",
      "Simple layout rules: one main headline, one focal photo or icon, generous whitespace",
      "Local event flyer: date, time, place, host, what to expect, neutral tone",
      "Square post (1:1): key text inside center safe zone",
      "Story graphic (9:16): keep critical text in the middle third",
      "Export: PNG for graphics with text; JPG for photos-only when appropriate; correct dimensions",
      "When in doubt, submit for approval before paid boost or major visibility",
    ],
    links: [
      { label: "Social media design hub (Canva + templates)", href: "/volunteer/resources/social-media-design" },
      { label: "Team · Social media tab", href: "" },
      { label: "Kelly headshot paths (campaign-assets)", href: "/volunteer/resources/social-media-design#headshots" },
      { label: "Advanced: local media & press graphics (playbook)", href: "/field-playbook/roles/social-advanced-local-press" },
    ],
  },
  {
    id: "p5",
    title: "How to use Power of 5",
    readMinutes: "10 min",
    checklist: ["Each coordinator knows their five relationships are relational, not a quota to spam", "Touches are logged"],
    links: [
      { label: "P5 / VR coordinator guide", href: "/field-playbook/roles/power-of-five-coordinator" },
      { label: "Relational touch playbook", href: "/field-playbook/roles/relational-touch-playbook" },
      { label: "P5 / VR · registration events & polling readiness", href: "/field-playbook/roles/p5-vr-event-operations" },
    ],
  },
  {
    id: "youth-outreach",
    title: "Youth Outreach (under P5/VR)",
    readMinutes: "10 min",
    checklist: [
      "You can explain the HS lead, college lead, and campus 3-person team model",
      "Social-led recruitment is part of your weekly rhythm, not an afterthought",
    ],
    links: [
      { label: "Youth (P5/VR) tab (your workspace)", href: "" },
      { label: "Youth Outreach resource hub", href: "/volunteer/resources/youth-outreach" },
      { label: "Youth · semester & campus challenges (execution)", href: "/field-playbook/roles/youth-semester-campus-execution" },
    ],
  },
  {
    id: "downstream",
    title: "How to place someone downstream",
    readMinutes: "8 min",
    checklist: ["Fit-check with downstream lead before sending a join link", "Overflow is placed — not hoarded"],
    links: [{ label: "Power of 5 / VR tab (your workspace)", href: "" }],
  },
  {
    id: "events-find",
    title: "How to find local events",
    readMinutes: "5 min",
    checklist: ["Three credible local dates on the pipeline", "One partner org identified where appropriate"],
    links: [
      { label: "Events coordinator guide", href: "/field-playbook/roles/events-coordinator" },
      { label: "Team · Events tab", href: "" },
    ],
  },
  {
    id: "gathering",
    title: "How to host a 10–15 person gathering",
    readMinutes: "10 min",
    checklist: ["Purpose, date, and host confirmed", "Simple agenda + follow-up plan"],
    links: [{ label: "Events hosting playbook", href: "/field-playbook/roles/events-hosting-playbook" }],
  },
  {
    id: "events-house-party",
    title: "Hosting a house party (full manual)",
    readMinutes: "18 min",
    checklist: [
      "Host brief completed; guest target and relational owners named",
      "Invitation + reminder schedule on paper",
      "Signup station tested; photo policy clear",
      "72-hour follow-up owners assigned for every new attendee",
    ],
    links: [
      { label: "House party playbook", href: "/field-playbook/roles/house-party-playbook" },
      { label: "Events lane hub", href: "/volunteer/resources/events-lane" },
    ],
  },
  {
    id: "events-fundraising",
    title: "Hosting a fundraising reception / county objective",
    readMinutes: "15 min",
    checklist: [
      "Treasurer signoff on ask language and mechanism",
      "County tracker row started (host, date, goal, RSVP)",
      "Host committee personal invite commitments documented",
      "Day-of volunteer briefing and pledge follow-up sweep scheduled",
    ],
    links: [{ label: "Fundraising Event Toolkit", href: "/field-playbook/roles/fundraising-receptions-county" }],
  },
  {
    id: "events-weekend-immersion",
    title: "Weekend Community Immersion",
    readMinutes: "14 min",
    checklist: [
      "Anchor event locked + 4–5 micro-gathers scheduled",
      "Parking and RSVP cap per home documented",
      "Surrogate brief includes five names per room",
      "Monday debrief and KPI capture assigned",
    ],
    links: [{ label: "Weekend Immersion planner", href: "/field-playbook/roles/weekend-community-immersion" }],
  },
  {
    id: "events-faith",
    title: "Coordinating faith community visits",
    readMinutes: "12 min",
    checklist: [
      "Leader contact path respects hierarchy and introductions",
      "Dress / photo / worship norms confirmed",
      "Thank-you and promises logged same day",
    ],
    links: [{ label: "Faith community visit guide", href: "/field-playbook/roles/faith-community-visits" }],
  },
  {
    id: "events-city-schedule",
    title: "Building a local visit schedule (two-day + travel)",
    readMinutes: "14 min",
    checklist: [
      "Two-day grid covers clerk, leaders, homes, and optional faith block",
      "Travel rhythm respects home nights where possible",
      "Local guide one-pager lists landmines and food timing",
    ],
    links: [
      { label: "Two-day city immersion", href: "/field-playbook/roles/two-day-city-immersion" },
      { label: "Travel rhythm model", href: "/field-playbook/roles/travel-rhythm-model" },
    ],
  },
  {
    id: "events-local-guide",
    title: "Being Kelly’s local guide",
    readMinutes: "10 min",
    checklist: [
      "Five people Kelly should know + why",
      "Three quiet landmines surfaced privately",
      "Exit cue and parking plan known",
    ],
    links: [{ label: "Festivals, fairs & local guide", href: "/field-playbook/roles/festivals-fairs-local-guide" }],
  },
  {
    id: "reporting",
    title: "How to report weekly numbers",
    readMinutes: "6 min",
    checklist: ["Three numbers go upstream on the same day each week", "Questions escalated separately"],
    links: [
      { label: "Key metrics", href: "/field-playbook/metrics/key-metrics" },
      { label: "Weekly huddle", href: "/field-playbook/rhythm/weekly-huddle" },
    ],
  },
  {
    id: "womens-outreach-exec",
    title: "Women’s Outreach — family-centered & listening sessions",
    readMinutes: "12 min",
    checklist: [
      "Caregiver logistics explicit on invites",
      "Listening session has ground rules and follow-up owner",
      "Social recap respects participant dignity",
    ],
    links: [{ label: "Women’s Outreach execution playbook", href: "/field-playbook/roles/womens-outreach-execution" }],
  },
  {
    id: "community-region-lead",
    title: "Community region leadership (partner dashboards)",
    readMinutes: "12 min",
    checklist: [
      "Self-Building doc + one tab-by-tab walk completed",
      "Partner review status understood before posting",
      "30-60-90 handoff sketched for a deputy",
    ],
    links: [
      { label: "Community region leadership training", href: "/field-playbook/coordination/community-region-leadership" },
      { label: "County Democrats hub", href: "/dashboard/community/county-democrats" },
    ],
  },
  {
    id: "gotv-prep",
    title: "How to prepare for GOTV",
    readMinutes: "8 min",
    checklist: ["Lanes covered", "Registration help flowing", "Downstream teams mentored"],
    links: [
      { label: "Messaging library", href: "/volunteer/resources/messaging" },
      { label: "Team Launch Kit", href: "/volunteer/resources/team-launch-kit" },
    ],
  },
];

export function TeamTrainingPathContent({ teamSlug }: { teamSlug: string }) {
  const key = useMemo(() => `vos-training-modules-${teamSlug}`, [teamSlug]);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      setDone({});
    }
  }, [key]);

  const toggle = useCallback(
    (id: string) => {
      setDone((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/55">Self-service training</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">Training path</h1>
        <p className="mt-3 font-body text-sm text-kelly-text/85">
          Each module is a short read plus a practical checklist. Mark complete on this device as you finish — train as you
          grow, then teach the next triad the same rhythm.
        </p>
        <p className="mt-2 font-body text-xs text-kelly-text/60">
          Progress saves locally in your browser (key <span className="font-mono">{key}</span>).
        </p>
      </section>

      <section className="rounded-2xl border border-kelly-success/30 bg-kelly-success/[0.07] p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm text-kelly-text/85">
            Train as you grow — finish one short module, then show the next coordinator the same path.
          </p>
          <KellyAccentCutout src={KELLY_ACCENT_TRAINING} />
        </div>
      </section>

      <ol className="space-y-6">
        {MODULES.map((mod, index) => {
          const base = `/dashboard/team/${teamSlug}`;
          const resolvedLinks = mod.links.map((l) => ({
            ...l,
            href:
              l.href === "" && l.label.includes("Events tab")
                ? `${base}/events`
                : l.href === "" && l.label.includes("Social media tab")
                  ? `${base}/social-media`
                  : l.href === "" && l.label.includes("Youth (P5/VR) tab")
                    ? `${base}/youth-outreach`
                    : l.href === "" && l.label.includes("Power of 5")
                      ? `${base}/power-of-5`
                      : l.href,
          }));
          return (
            <li
              key={mod.id}
              id={`training-module-${mod.id}`}
              className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] font-bold text-kelly-text/50">
                    Module {index + 1} · ~{mod.readMinutes} read
                  </p>
                  <h2 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{mod.title}</h2>
                </div>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-kelly-navy/20 bg-kelly-page px-3 py-2 font-body text-xs font-semibold text-kelly-navy">
                  <input type="checkbox" checked={Boolean(done[mod.id])} onChange={() => toggle(mod.id)} />
                  Mark complete
                </label>
              </div>
              <p className="mt-3 font-body text-[10px] font-bold uppercase text-kelly-text/50">Checklist</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                {mod.checklist.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="mt-4 font-body text-[10px] font-bold uppercase text-kelly-text/50">Resources</p>
              <ul className="mt-2 space-y-2">
                {resolvedLinks.map((l) => (
                  <li key={`${mod.id}-${l.label}`}>
                    <Link href={l.href} className="font-body text-sm font-semibold text-kelly-blue underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-fog/50 p-6">
        <p className="font-body text-xs font-semibold text-kelly-navy">Quick copy · training reminder</p>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          “We keep teams small on purpose — three lanes, real geography. When you’re ready, I’ll walk you through dashboard
          access and your first weekly huddle. No pressure.”
        </p>
        <div className="mt-3">
          <CopyTextButton
            label="Copy reminder"
            text='We keep teams small on purpose — three lanes, real geography. When you are ready, I will walk you through dashboard access and your first weekly huddle. No pressure.'
          />
        </div>
      </section>
    </div>
  );
}
