import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { HostGatheringForm } from "@/components/forms/HostGatheringForm";
import {
  LISTENING_SESSIONS_FLOAT_SECTION_PAD,
  ListeningSessionsFloatingEventNav,
  PlannedListeningEventsSection,
} from "@/components/listening-sessions/PlannedListeningEventsSection";
import { cn } from "@/lib/utils";
import { events } from "@/content/events";
import { listListeningSessionSeriesEvents } from "@/content/events/listening-session-series";
import { queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import { mergeMovementAndCalendarEvents } from "@/lib/events/calendar-to-movement-event";
import { representLocalEventVolunteerHref } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Election & ballot access listening sessions",
  description:
    "Arkansas-wide listening sessions on elections, ballot access, and transparency—what to expect, how to bring one to your town, and how the campaign plans follow-up.",
};

const principles = [
  "Nonpartisan and process-focused",
  "No predetermined outcome—real listening",
  "Transparency at every step",
  "Respect for county officials and local control",
  "Data-driven, methodical improvement",
  "Clear communication with the public",
];

const notThis = [
  "Not an investigation into election fraud",
  "Not a platform to promote or oppose specific voting systems",
  "Not a political debate forum",
  "Not a top-down directive or a place to push a platform",
];

const flowSteps = [
  {
    t: "Welcome & purpose",
    d: "Why we’re in the room and how the time will be used.",
  },
  {
    t: "Brief introduction",
    d: "Kelly shares context for the office’s role: secure, transparent, understandable process.",
  },
  {
    t: "Moderated listening",
    d: "Roundtable time—neighbors, election workers, and leaders speak from experience.",
  },
  {
    t: "Close & next steps",
    d: "Reflections and any local follow-up the host or campaign can support.",
  },
];

export default async function ListeningSessionsPage() {
  const calendarRows = await queryPublicCampaignEvents(
    { range: "all_upcoming" },
    { take: 200 },
  );
  const mergedEvents = mergeMovementAndCalendarEvents(events, calendarRows);
  const plannedListeningEvents = listListeningSessionSeriesEvents(mergedEvents);
  const hasFloatingStops = plannedListeningEvents.length > 0;

  return (
    <>
      {hasFloatingStops ? (
        <ListeningSessionsFloatingEventNav events={plannedListeningEvents} />
      ) : null}

      <div
        className={cn(
          hasFloatingStops && LISTENING_SESSIONS_FLOAT_SECTION_PAD,
        )}
      >
        <PageHero
          eyebrow="Statewide series"
          title="Arkansas election &amp; ballot access listening sessions"
          subtitle="A structured, nonpartisan space to hear Arkansans—on voting, registration, and how process looks from the ground up. Not a platform rollout. A commitment to listen."
        >
          <Button href="#your-town" variant="primary">
            Bring a session to your town
          </Button>
          <Button href="#what-to-expect" variant="outline">
            What to expect
          </Button>
        </PageHero>

        <FullBleedSection padY aria-labelledby="overview-heading">
          <ContentContainer wide>
            <SectionHeading
              id="overview-heading"
              align="left"
              eyebrow="Overview"
              title="Why we’re doing this"
              subtitle="There’s a lot of noise about elections. Many Arkansans still have good questions. The Secretary of State’s job includes helping people understand secure, transparent process—not dismissing concern or playing politics with it. These sessions start with listening."
            />
            <div className="mt-8 max-w-3xl space-y-4 font-body text-base leading-relaxed text-kelly-text/85">
              <p>
                Kelly Grappe is convening a statewide series of{" "}
                <strong>
                  Arkansas Election &amp; Ballot Access Listening Sessions
                </strong>{" "}
                so voters, poll workers, petition organizers, and community
                leaders can share what they see, worry about, and want
                clarified—
                <em>without</em> an agenda, assumptions, or national talking
                points in the way.
              </p>
              <p className="mt-4">
                Input from these sessions is meant to inform a future,
                transparent <strong>process review</strong> (mapping how ballot
                access and election administration actually work in practice—and
                where the public need better visibility). It starts with hearing
                people where they are.
              </p>
            </div>
          </ContentContainer>
        </FullBleedSection>

        <PlannedListeningEventsSection events={plannedListeningEvents} />

        <FullBleedSection
          variant="subtle"
          padY
          aria-labelledby="purpose-heading"
          id="purpose"
        >
          <ContentContainer>
            <SectionHeading
              id="purpose-heading"
              eyebrow="Purpose"
              title="What we hope to learn"
              subtitle="The session is the product—good notes, clear themes, and respect for every chair at the table."
            />
            <ul className="mt-6 list-inside list-disc space-y-2 font-body text-kelly-text/85">
              <li>Listen to voters, election workers, and community members</li>
              <li>
                Understand concerns on voting, elections, and ballot access
              </li>
              <li>Spot where process may be unclear or misunderstood</li>
              <li>Gather input that can inform later review and improvement</li>
            </ul>
          </ContentContainer>
        </FullBleedSection>

        <FullBleedSection
          padY
          aria-labelledby="expect-heading"
          id="what-to-expect"
        >
          <ContentContainer>
            <SectionHeading
              id="expect-heading"
              eyebrow="Format"
              title="What to expect (about 1.5–2 hours)"
              subtitle="Open to the public, structured to keep airtime for people who don’t usually get the mic in politics."
            />
            <ResponsiveGrid cols="2" className="mt-8">
              {flowSteps.map((s) => (
                <div
                  key={s.t}
                  className="rounded-card border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)]"
                >
                  <h3 className="font-heading text-lg font-bold text-kelly-text">
                    {s.t}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-kelly-text/75">
                    {s.d}
                  </p>
                </div>
              ))}
            </ResponsiveGrid>
            <p className="mt-8 max-w-3xl font-body text-sm text-kelly-text/70">
              Participants might include county clerks, election commissioners,
              poll workers, petition circulators, and local leaders. Officials
              are welcome to <strong>attend and listen</strong>—the goal is
              shared understanding, not putting anyone on the spot in real time.
            </p>
          </ContentContainer>
        </FullBleedSection>

        <FullBleedSection variant="subtle" padY aria-labelledby="kelly-heading">
          <ContentContainer wide>
            <SectionHeading
              id="kelly-heading"
              eyebrow="Framing"
              title="A few words you’ll hear in the room"
              subtitle="Process and transparency—not picking a side in every national fight."
            />
            <blockquote className="mt-6 border-l-4 border-kelly-navy/40 pl-5 font-body italic text-kelly-text/85">
              “If people have questions about our elections, we should not
              ignore them—and we should not politicize them. We should listen,
              understand, and do the work to provide clear, transparent
              information.”
            </blockquote>
            <p className="mt-4 max-w-3xl font-body text-sm text-kelly-text/75">
              The office doesn’t by itself set voting systems—that sits with law
              and local practice—but the Secretary of State can help make sure
              the public can <strong>see and understand</strong> how the system
              works.
            </p>
          </ContentContainer>
        </FullBleedSection>

        <FullBleedSection padY aria-labelledby="next-heading">
          <ContentContainer>
            <SectionHeading
              id="next-heading"
              eyebrow="After listening"
              title="From listening to review"
              subtitle="When elected, this feeds a disciplined public process: Listen → Map → Verify → Improve → Report."
            />
            <p className="mt-4 max-w-3xl font-body text-kelly-text/80">
              The campaign’s commitment is to use what we hear in these rooms to
              shape a future{" "}
              <strong>
                transparent election and ballot access process review
              </strong>
              : map the system end to end, stress-test safeguards, and recommend
              practical improvements—with findings shared in public, not in a
              back room.
            </p>
          </ContentContainer>
        </FullBleedSection>

        <FullBleedSection
          variant="subtle"
          padY
          aria-labelledby="principles-heading"
        >
          <ContentContainer>
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <h2
                  id="principles-heading"
                  className="font-heading text-2xl font-bold text-kelly-text"
                >
                  Key principles
                </h2>
                <ul className="mt-4 list-inside list-disc space-y-2 font-body text-sm text-kelly-text/80">
                  {principles.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-kelly-text">
                  What this is not
                </h2>
                <ul className="mt-4 list-inside list-disc space-y-2 font-body text-sm text-kelly-text/80">
                  {notThis.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </ContentContainer>
        </FullBleedSection>

        <FullBleedSection padY aria-labelledby="town-heading" id="your-town">
          <ContentContainer>
            <SectionHeading
              id="town-heading"
              eyebrow="Your community"
              title="Bring a session to your town"
              subtitle="We’ll build a calendar region by region. Tell us who you are, where you’re rooted, and what help you need to host a dignified, well-prepared room."
            />
            <p className="mt-3 max-w-3xl font-body text-sm text-kelly-text/75">
              Use the form below (the same host pipeline as our other local
              gatherings, pre-set to <strong>listening session</strong>). You
              can still adjust the type if you’re also planning something
              broader.
            </p>
            <div
              id="host-form"
              className="mt-10 max-w-2xl rounded-card border border-kelly-text/10 bg-kelly-page p-6 sm:p-8 shadow-[var(--shadow-soft)]"
            >
              <HostGatheringForm
                id="listening-session-host-form"
                initialGatheringType="listening_session"
              />
            </div>
          </ContentContainer>
        </FullBleedSection>

        <FullBleedSection
          variant="subtle"
          padY
          aria-labelledby="workflow-heading"
          id="planning"
        >
          <ContentContainer>
            <SectionHeading
              id="workflow-heading"
              eyebrow="After you raise your hand"
              title="What happens next"
              subtitle="Hosting interest isn’t a one-line note—it’s the start of a plan: timing, partners, accessibility, materials, and respectful follow-up with everyone who shows up."
            />
            <div className="mt-6 max-w-3xl space-y-4 font-body text-sm leading-relaxed text-kelly-text/80">
              <p>
                When you submit the form, the campaign team uses it to line up
                dates, confirm venues, coordinate volunteers, and make sure
                hosts have what they need—without losing the human details that
                make a listening room feel safe and serious.
              </p>
              <p className="mt-4">
                If you already volunteer with the campaign, use the tools and
                contacts your organizer shared with you for scheduling and
                follow-up. New hosts can expect a real person to reach out—not an
                impersonal auto-reply.
              </p>
            </div>
          </ContentContainer>
        </FullBleedSection>

        <CTASection
          title="Not ready to host? Stay in the loop"
          description="Get updates from the road, trainings, and opportunities that match your county—without filling another long form first."
        >
          <Button href="/get-involved" variant="primary">
            Get involved
          </Button>
          <Button href="/events" variant="outline">
            Movement events
          </Button>
          <Button href={representLocalEventVolunteerHref} variant="outline">
            Represent at local events
          </Button>
        </CTASection>
      </div>
    </>
  );
}
