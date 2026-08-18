import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { KELLY_HEADSHOT_LIBRARY, KELLY_VOLUNTEER_GRAPHICS_CUTOUTS } from "@/lib/campaign-assets";

export const metadata: Metadata = {
  title: "Social media & design · Volunteer resources",
  description: "Canva basics, local graphics, brand kit, and templates for geographic teams.",
};

function Stub({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-kelly-navy">{title}</h2>
      <p className="mt-2 font-body text-sm text-kelly-text/80">{body}</p>
      <p className="mt-3 rounded-lg bg-kelly-gold/15 px-3 py-2 font-body text-xs font-semibold text-kelly-deep">
        Template files marked coming soon in the resource library until HQ uploads final Canva links.
      </p>
    </section>
  );
}

export default function SocialMediaDesignResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteers · Social"
        title="Social media & design"
        subtitle="Local graphics, Canva workflows, and brand-safe visuals — so your triad ships posts and flyers without waiting on staff."
      >
        <Button href="/volunteer/resources" variant="outline">
          Resource library
        </Button>
        <Button href="/volunteer/resources/messaging#captions" variant="outline">
          Social caption examples
        </Button>
      </PageHero>
      <FullBleedSection padY variant="subtle">
        <ContentContainer className="max-w-3xl space-y-8">
          <section id="local-media" className="scroll-mt-28 rounded-2xl border border-kelly-blue/20 bg-kelly-blue/[0.05] p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Local media graphics</h2>
            <p className="mt-2 font-body text-sm text-kelly-text/85">
              Use simple graphics for Facebook groups, local newsletters, community calendars, event pages, school or campus
              posts, chamber pages, and light-touch local media outreach.
            </p>
            <p className="mt-3 font-body text-sm font-semibold text-kelly-deep">Keep it local, clear, and easy to share.</p>
          </section>

          <Stub
            id="canva-quick-start"
            title="Canva Quick Start Guide"
            body="Sign in, pick an approved template, swap photo and headline, stay inside brand colors, export PNG for text-heavy, JPG for photo-first."
          />
          <Stub
            id="brand-kit"
            title="Campaign Brand Kit"
            body="Official colors, type, logo placement, and what not to change — counsel-reviewed pack incoming."
          />

          <section id="headshots" className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Kelly Headshot Library</h2>
            <p className="mt-2 font-body text-sm text-kelly-text/80">
              Approved cutouts ship as{" "}
              <span className="font-mono text-xs">{KELLY_VOLUNTEER_GRAPHICS_CUTOUTS.map((p) => p.split("/").pop()).join(", ")}</span>{" "}
              — each a single pose on a transparent background. Do <span className="font-semibold">not</span> crop from a multi-portrait
              composite canvas; HQ provides isolated files only. The team dashboard hero uses{" "}
              <span className="font-mono text-xs">kelly-hero.png</span> and falls back to a warm placeholder SVG if it is missing.
            </p>
            <ul className="mt-4 space-y-2 font-body text-sm text-kelly-text/85">
              {KELLY_HEADSHOT_LIBRARY.map((h) => (
                <li key={h.id} className="rounded-lg border border-kelly-text/10 bg-kelly-page/80 px-3 py-2">
                  <span className="font-semibold text-kelly-deep">{h.label}</span>
                  {h.comingSoon ? (
                    <span className="ml-2 rounded bg-kelly-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-kelly-deep">
                      Coming soon
                    </span>
                  ) : null}
                  <p className="mt-1 text-xs text-kelly-text/70">{h.description}</p>
                  <p className="mt-1 font-mono text-[11px] text-kelly-navy">{h.path}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="cutouts-in-canva" className="scroll-mt-28 rounded-2xl border border-kelly-gold/30 bg-kelly-gold/[0.06] p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Using approved Kelly cutouts in Canva</h2>
            <p className="mt-2 font-body text-sm text-kelly-text/85">
              Team accents and local graphics should use <span className="font-semibold">transparent PNG cutouts</span> from{" "}
              <span className="font-mono text-xs">public/images/kelly/headshots/</span> — the volunteer-approved set is{" "}
              <span className="font-mono text-xs">
                {KELLY_VOLUNTEER_GRAPHICS_CUTOUTS.map((p) => p.split("/").pop()).join(", ")}
              </span>
              . Never screenshots from the web or uncropped JPEGs with busy backgrounds.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-sm text-kelly-text/85">
              <li>
                <span className="font-semibold text-kelly-deep">Upload once, reuse.</span> Add each approved file to your Canva{" "}
                <span className="font-semibold">Brand kit → Uploads</span> (or a shared team folder) so coordinators pull the same
                assets.
              </li>
              <li>
                <span className="font-semibold text-kelly-deep">One Kelly focal per graphic.</span> Avoid stacking multiple
                full-body cutouts or duplicating the same shot — pair Kelly with simple shapes, local photos, or typography.
              </li>
              <li>
                <span className="font-semibold text-kelly-deep">Respect the silhouette.</span> Do not crop into hands, hair, or
                clothing in a way that looks like a mistake; do not add outlines, stickers, or heavy filters that change skin tone
                or misrepresent Kelly.
              </li>
              <li>
                <span className="font-semibold text-kelly-deep">Keep disclosure zones clear.</span> Leave margin for “Paid for by”
                or platform-required disclaimers on boosted or political content — when in doubt, ask HQ before spending.
              </li>
              <li>
                <span className="font-semibold text-kelly-deep">Match the dashboard workflow.</span> HQ stores raw sources
                separately; volunteers and field teams work from the dashboard-ready PNGs in{" "}
                <span className="font-mono text-xs">headshots/</span>. Request new cutouts through your coordinator rather than
                tracing from unofficial photos.
              </li>
            </ul>
          </section>

          <Stub
            id="templates"
            title="Social Media Graphic Templates"
            body="Square, story, and quote shells — links to shared Canva folders when published."
          />
          <Stub id="flyer" title="Event Flyer Template" body="One-side flyer: who, what, when, where, RSVP, /volunteer QR optional." />
          <Stub id="story" title="Story Graphic Template" body="9:16; keep headlines inside vertical safe zones." />
          <Stub id="square" title="Square Post Template" body="1080×1080; one focal message, large type, high contrast." />
          <section id="volunteer-recruitment" className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Volunteer recruitment graphic</h2>
            <p className="mt-2 font-body text-sm text-kelly-text/85">
              Friendly peer tone, one sentence why you said yes, clear call to visit /volunteer. Avoid cluttered stacks of text.
            </p>
          </section>
          <section id="voter-registration" className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">Voter registration graphic</h2>
            <p className="mt-2 font-body text-sm text-kelly-text/85">
              Neutral, helpful reminders; pair with Events + P5/VR for tables and follow-up. Escalate legal wording to HQ.
            </p>
          </section>
          <p className="font-body text-sm text-kelly-text/70">
            Field playbook social role:{" "}
            <Link href="/field-playbook" className="font-semibold text-kelly-blue underline">
              Social coordinator
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
