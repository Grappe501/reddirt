import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import {
  MUSLIM_COMMUNITY_DASHBOARD_TABS,
  MUSLIM_COMMUNITY_RESOURCE_STUBS,
  MUSLIM_CROSS_LANE_COORDINATION,
  MUSLIM_REGION_LEADERSHIP_MODEL,
  MUSLIM_WOMENS_OUTREACH_LANE,
  MUSLIM_YOUTH_OUTREACH_LANE,
} from "@/lib/campaign-ops/muslim-community-dashboard-plan";

export const metadata: Metadata = {
  title: "Muslim Community Civic Organizing",
  description:
    "Muslim Community Region organizing with Youth Outreach and Women’s Outreach as first-class lanes.",
};

export default function MuslimCommunityDashboardPlanPage() {
  return (
    <>
      <PageHero
        eyebrow="Community organizing"
        title="Muslim Community Civic Organizing"
        subtitle="Youth Outreach and Women’s Outreach are first-class lanes — they mirror real community structure and trusted relationship networks."
      >
        <Button href="/dashboard/community/muslim" variant="primary">
          Open community dashboard
        </Button>
        <Button href="/volunteer/resources" variant="outline">
          Volunteer resources
        </Button>
      </PageHero>

      <FullBleedSection padY variant="subtle">
        <ContentContainer className="max-w-4xl space-y-10">
          <div className="rounded-2xl border border-kelly-navy/15 bg-kelly-fog/60 p-5 md:p-6">
            <p className="font-heading text-sm font-bold text-kelly-navy">Built with community leaders</p>
            <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/90">
              Materials and priorities grow with trusted Muslim women leaders, youth leaders, family leaders, and
              mosque/community leadership.
            </p>
          </div>

          <nav
            aria-label="Dashboard sections"
            className="sticky top-2 z-10 flex flex-wrap gap-2 rounded-xl border border-kelly-text/10 bg-white/95 p-3 shadow-sm backdrop-blur-sm"
          >
            {MUSLIM_COMMUNITY_DASHBOARD_TABS.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="rounded-lg border border-kelly-navy/15 bg-kelly-page px-3 py-1.5 font-body text-[11px] font-semibold text-kelly-navy hover:bg-kelly-fog"
              >
                {t.label}
              </a>
            ))}
          </nav>

          <section id="overview" className="scroll-mt-32 space-y-4">
            <h2 className="font-heading text-xl font-bold text-kelly-navy">Overview</h2>
            <p className="font-body text-sm text-kelly-text/85">
              The Muslim Community Region uses a dedicated civic organizing dashboard. Tabs below match the intended
              product surface; narrative and KPIs stay aligned with{" "}
              <Link className="font-semibold text-kelly-blue underline" href="/field-playbook">
                field playbook
              </Link>{" "}
              discipline.
            </p>
            <div className="rounded-xl border border-kelly-text/10 bg-white p-4 font-mono text-xs leading-relaxed text-kelly-deep">
              <p className="mb-2 font-body text-[10px] font-bold uppercase text-kelly-text/50">
                {MUSLIM_REGION_LEADERSHIP_MODEL.title}
              </p>
              {MUSLIM_REGION_LEADERSHIP_MODEL.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div>
              <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Reporting / escalation</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                {MUSLIM_REGION_LEADERSHIP_MODEL.reporting.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </section>

          <section id="p5-vr" className="scroll-mt-32 space-y-2">
            <h2 className="font-heading text-xl font-bold text-kelly-navy">P5 / Voter Registration</h2>
            <p className="font-body text-sm text-kelly-text/80">
              Relational contacts, registration assistance, and turnout education — coordinated with the campaign P5 / VR lead.
              Youth and Women’s lanes feed registration goals; see Cross-Lane Coordination.
            </p>
          </section>

          <section id="events" className="scroll-mt-32 space-y-2">
            <h2 className="font-heading text-xl font-bold text-kelly-navy">Events</h2>
            <p className="font-body text-sm text-kelly-text/80">
              Community gatherings, registration drives, and family-friendly programming — coordinated with the campaign Events
              lead. Women’s Outreach prioritizes timing and settings that work for families.
            </p>
          </section>

          <section id="social" className="scroll-mt-32 space-y-2">
            <h2 className="font-heading text-xl font-bold text-kelly-navy">Social / Communications</h2>
            <p className="font-body text-sm text-kelly-text/80">
              Community-approved messaging — coordinated with the campaign Social Media lead. Supports Youth and Women’s lanes
              with appropriate tone, privacy, and guardian/family context where relevant.
            </p>
          </section>

          <section id="youth-outreach" className="scroll-mt-32 space-y-4 rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.04] p-6">
            <h2 className="font-heading text-xl font-bold text-kelly-navy">Youth Outreach</h2>
            <p className="rounded-lg bg-kelly-gold/15 px-3 py-2 font-body text-xs font-semibold text-kelly-deep">{MUSLIM_DASHBOARD_DRAFT_NOTICE}</p>
            <p className="font-body text-sm text-kelly-text/85">
              <span className="font-semibold text-kelly-deep">Purpose: </span>
              {MUSLIM_YOUTH_OUTREACH_LANE.purpose}
            </p>
            <div>
              <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Youth Outreach Lead — responsibilities</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                {MUSLIM_YOUTH_OUTREACH_LANE.responsibilities.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-body text-xs font-bold uppercase text-kelly-text/50">KPIs (lane scorecard)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                {MUSLIM_YOUTH_OUTREACH_LANE.kpis.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          </section>

          <section id="womens-outreach" className="scroll-mt-32 space-y-4 rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.04] p-6">
            <h2 className="font-heading text-xl font-bold text-kelly-navy">Women’s Outreach</h2>
            <p className="rounded-lg bg-kelly-gold/15 px-3 py-2 font-body text-xs font-semibold text-kelly-deep">{MUSLIM_DASHBOARD_DRAFT_NOTICE}</p>
            <p className="font-body text-sm text-kelly-text/85">
              <span className="font-semibold text-kelly-deep">Purpose: </span>
              {MUSLIM_WOMENS_OUTREACH_LANE.purpose}
            </p>
            <div>
              <p className="font-body text-xs font-bold uppercase text-kelly-text/50">Women’s Outreach Lead — responsibilities</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                {MUSLIM_WOMENS_OUTREACH_LANE.responsibilities.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-body text-xs font-bold uppercase text-kelly-text/50">KPIs (lane scorecard)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
                {MUSLIM_WOMENS_OUTREACH_LANE.kpis.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          </section>

          <section id="cross-lane" className="scroll-mt-32 space-y-4 rounded-2xl border border-kelly-blue/25 bg-kelly-blue/[0.06] p-6">
            <h2 className="font-heading text-xl font-bold text-kelly-navy">Cross-Lane Coordination</h2>
            <p className="font-body text-sm text-kelly-text/85">{MUSLIM_CROSS_LANE_COORDINATION.intro}</p>
            <ul className="space-y-3">
              {MUSLIM_CROSS_LANE_COORDINATION.rows.map((row) => (
                <li key={row.from + row.to} className="rounded-lg border border-kelly-text/10 bg-white px-4 py-3 font-body text-sm text-kelly-text/85">
                  <span className="font-bold text-kelly-navy">{row.from}</span>
                  <span className="text-kelly-text/50"> → </span>
                  <span className="font-bold text-kelly-navy">{row.to}</span>
                  <span className="mt-1 block text-kelly-text/75">{row.note}</span>
                </li>
              ))}
            </ul>
            <p className="font-body text-xs text-kelly-text/65">
              Surfaces on-dashboard as a panel; lanes connect into P5/VR, Events, Social, Resources, and mosque polling
              readiness — Youth and Women’s Outreach are not isolated.
            </p>
          </section>

          <section id="mosque-polling" className="scroll-mt-32 space-y-2">
            <h2 className="font-heading text-xl font-bold text-kelly-navy">Mosque Polling Location Readiness</h2>
            <p className="font-body text-sm text-kelly-text/80">
              Polling-site planning, stakeholder alignment, and neutral public language — use Calendar HQ workflow{" "}
              <code className="rounded bg-kelly-text/10 px-1 text-xs">s4_event_faith_venue_polling_v1</code> and counsel review.
              Coordinate with Youth and Women’s lanes for turnout education and family-friendly communication.
            </p>
          </section>

          <section id="resources" className="scroll-mt-32 space-y-6">
            <h2 className="font-heading text-xl font-bold text-kelly-navy">Resources</h2>
            <p className="font-body text-sm text-kelly-text/80">
              Draft outlines below; full PDFs/web modules ship after community review. Also listed in the main{" "}
              <Link href="/volunteer/resources" className="font-semibold text-kelly-blue underline">
                volunteer resource library
              </Link>
              .
            </p>
            <div className="space-y-8">
              <div>
                <h3 className="font-heading text-lg font-bold text-kelly-navy">Youth Outreach materials</h3>
                <ul className="mt-3 space-y-4">
                  {MUSLIM_COMMUNITY_RESOURCE_STUBS.filter((r) => r.lane === "youth").map((r) => (
                    <li key={r.anchor} id={r.anchor} className="scroll-mt-32 rounded-xl border border-kelly-text/10 bg-white p-4">
                      <p className="font-heading text-base font-bold text-kelly-navy">{r.title}</p>
                      <p className="mt-1 font-body text-xs font-semibold uppercase text-kelly-text/55">Draft · community review</p>
                      <p className="mt-2 font-body text-sm text-kelly-text/85">{r.blurb}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-kelly-navy">Women’s Outreach materials</h3>
                <ul className="mt-3 space-y-4">
                  {MUSLIM_COMMUNITY_RESOURCE_STUBS.filter((r) => r.lane === "womens").map((r) => (
                    <li key={r.anchor} id={r.anchor} className="scroll-mt-32 rounded-xl border border-kelly-text/10 bg-white p-4">
                      <p className="font-heading text-base font-bold text-kelly-navy">{r.title}</p>
                      <p className="mt-1 font-body text-xs font-semibold uppercase text-kelly-text/55">Draft · community review</p>
                      <p className="mt-2 font-body text-sm text-kelly-text/85">{r.blurb}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="messages" className="scroll-mt-32 space-y-2">
            <h2 className="font-heading text-xl font-bold text-kelly-navy">Messages</h2>
            <p className="font-body text-sm text-kelly-text/80">
              In-product message threads and upstream questions — escalation from Youth/Women’s leads to the Overall Lead and
              Field Director when policy, legal, or sensitive community dynamics require staff support.
            </p>
          </section>

          <section id="rollup" className="scroll-mt-32 space-y-2">
            <h2 className="font-heading text-xl font-bold text-kelly-navy">Rollup</h2>
            <p className="font-body text-sm text-kelly-text/80">
              Aggregate KPIs for the Muslim Community Region: P5/VR, Events, Social, Youth Outreach, Women’s Outreach, and mosque
              polling readiness — reported to Field Director and campaign column leads without double-counting.
            </p>
          </section>

          <p className="font-body text-xs text-kelly-text/55">
            Docs in repo:{" "}
            <code className="rounded bg-kelly-text/10 px-1">docs/campaign-ops/MUSLIM_COMMUNITY_CIVIC_ORGANIZING_DASHBOARD_PLAN.md</code>{" "}
            ·{" "}
            <code className="rounded bg-kelly-text/10 px-1">docs/campaign-ops/MUSLIM_COMMUNITY_DASHBOARD_ARCHITECTURE.md</code>{" "}
            ·{" "}
            <code className="rounded bg-kelly-text/10 px-1">docs/campaign-ops/COMMUNITY_REGIONS_PRODUCT_PRIORITIES.md</code>
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
