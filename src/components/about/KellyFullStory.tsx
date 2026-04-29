import type { ReactNode } from "react";
import { Fragment } from "react";
import Link from "next/link";
import { ReadMoreLink } from "@/components/about/ReadMoreLink";
import { EditorialCampaignPhoto } from "@/components/about/EditorialCampaignPhoto";
import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { campaignTrailPhotos } from "@/content/media/campaign-trail-photos";
import {
  forevermostFarmTrailPhotos,
  initiativesPetitionTrailPhotos,
} from "@/content/media/campaign-trail-photo-use";
import { cn } from "@/lib/utils";

const H_STORY = "/about/story";
const H_BUSINESS = "/about/business";
const H_FARM = "/about/forevermost";
const H_STAND = "/about/stand-up-arkansas";
const H_INIT = "/about/initiatives-petitions";
const H_SOS = "/about/why-secretary-of-state";
const H_ASK = "/about/your-part";

const linkOut =
  "font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 transition hover:decoration-kelly-navy";
const h2 = "font-heading text-2xl font-bold text-kelly-text md:text-3xl";
const lead = "font-body text-lg leading-relaxed text-kelly-text/88";
const body = "font-body text-base leading-relaxed text-kelly-text/82";
const callout = "font-body text-sm text-kelly-text/75";
const calloutGreen = "font-body text-sm text-kelly-text/80";

/** Standard youtube.com embed (matches YouTube’s share dialog; more reliable for some clients than youtube-nocookie). */
function youtubeEmbedSrc(videoId: string): string {
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0`;
}

/** Heifer / Forevermost Farms field video — above “The land & the work” (env or Admin inbound id from parent). */
function ForevermostHeiferVideo({ videoId, iframeTitle }: { videoId: string; iframeTitle: string }) {
  return (
    <div className="mb-6 overflow-hidden rounded-card border border-kelly-text/10 bg-kelly-navy shadow-[var(--shadow-soft)] md:mb-8">
      <div className="relative aspect-video w-full">
        <iframe
          title={iframeTitle}
          src={youtubeEmbedSrc(videoId)}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}

const sections: { id: string; moreHref: string; eyebrow: string; title: string; children: ReactNode }[] = [
  {
    id: "story",
    moreHref: H_STORY,
    eyebrow: "The story we share",
    title: "Rooted in Arkansas, built in the work",
    children: (
      <div className="space-y-5">
        <p className={lead}>
          Voters do not follow abstractions—they follow <strong>people</strong> they feel they know. The Secretary of
          State’s office is about systems and law, but <strong>trust</strong> is personal. You deserve to know who
          Kelly is: where she comes from, what she has already put on the line for this state, and why she is asking
          for your time—not just your vote.
        </p>
        <p className="font-body text-base leading-relaxed text-kelly-text/78">
          Below, the career that shaped how she thinks about systems, the land and market work that grounded her in
          small business, and the civics organization she helps lead. Read in order or jump ahead; the thread is the
          same: <em>public service in plain sight.</em> <ReadMoreLink href={H_STORY} />
        </p>
      </div>
    ),
  },
  {
    id: "business",
    moreHref: H_BUSINESS,
    eyebrow: "Career & operations",
    title: "Nearly 25 years with Alltel and Verizon — process, people, and scale",
    children: (
      <div className="space-y-5">
        <p className={lead}>
          Kelly’s strongest credential for running a <strong>constitutional office that serves businesses</strong> is not
          a slogan—it is <strong>decades inside large, complex operations</strong>. She spent{" "}
          <strong>almost 25 years</strong> with <strong>Alltel</strong> and then <strong>Verizon</strong>, in leadership
          roles that required her to <strong>manage large teams</strong>, understand how work actually flows, and keep
          customer-facing systems functioning when the stakes are high and the clock is always running.
        </p>
        <p className={body}>
          That experience maps directly onto what the Secretary of State’s office must do for Arkansas:{" "}
          <strong>see the process end to end</strong>, break it down, <strong>simplify what can be simplified</strong>,
          and <strong>improve what must be improved</strong>—without drama and without leaving filers guessing. When
          registrations, filings, and public-facing services work better,{" "}
          <strong>small businesses save time and money first</strong>—and over time, better systems can return real
          savings across the economy, <strong>dollars that stay in Arkansans’ pockets</strong>.
        </p>
        <p className={body}>
          Kelly and her husband also <strong>started a small market and built farm operations</strong>—so she knows the
          other side of the counter: the permits, the cash flow, the weather, the paperwork, and the daily hustle of
          <strong> starting and keeping a business going in today’s climate</strong>. Big-company discipline and
          small-business ground truth are not opposites; they are what you want in someone who will help the office
          <strong> serve employers and employees fairly</strong> in all 75 counties.
        </p>
        <p className={cn("rounded-xl border border-kelly-text/10 bg-kelly-text/[0.04] p-4", callout)}>
          <span className="font-bold text-kelly-text">Career background: </span>
          <a
            href="https://www.linkedin.com/in/kelly-grappe-48b6aa51/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkOut}
          >
            Kelly on LinkedIn
          </a>{" "}
          — for roles, dates, and recommendations in one place. (Third-party profiles may summarize the same record.){" "}
          <ReadMoreLink href={H_BUSINESS} />
        </p>
      </div>
    ),
  },
  {
    id: "forevermost",
    moreHref: H_FARM,
    eyebrow: "The land & the work",
    title: "Forevermost Farms — home, stewardship, resilience",
    children: (
      <div className="space-y-5">
        <p className={lead}>
          Kelly and her husband, Steve, built{" "}
          <a
            href="https://www.forevermostfarms.com"
            target="_blank"
            rel="noopener noreferrer"
            className={linkOut}
          >
            Forevermost Farms
          </a>{" "}
          between <strong>Romance and Joy</strong>—a farm they call home in the Rose Bud area, living out a belief that
          showing up for soil, animals, and neighbors is its own form of <strong>integrity</strong>.
        </p>
        <p className={body}>
          For years the operation was real and full-time: <strong>chickens, turkey, pork, and quail</strong>—shared with
          others as they learned and grew, not as a side hobby but as a commitment to do the work well. When post-COVID
          costs made running the farm the same way impossible, the operation <strong>paused from selling</strong>—a
          pain many small farmers know. What did not pause was the place itself: the rhythm of the land, the
          <strong> resilience</strong> to adapt, and the choice to <strong>stay present</strong> and keep telling the
          story, including through social media, so the community that cared about the farm could stay connected.
        </p>
        <p className={body}>
          That is not a campaign talking point. It is the <strong>same habit of mind</strong> the people’s Secretary of
          State must bring: <strong>steward what you are given</strong>, tell the truth when the math changes, and
          don’t walk away from obligations just because the road got hard.
        </p>
        <p className={cn("rounded-xl border border-kelly-text/10 bg-kelly-text/[0.04] p-4", callout)}>
          <span className="font-bold text-kelly-text">More of the day-to-day: </span>
          <a
            href="https://www.forevermostfarms.com"
            target="_blank"
            rel="noopener noreferrer"
            className={linkOut}
          >
            forevermostfarms.com
          </a>{" "}
          (Rose Bud, AR) <ReadMoreLink href={H_FARM} />
        </p>
      </div>
    ),
  },
  {
    id: "standup",
    moreHref: H_STAND,
    eyebrow: "Civic muscle",
    title: "Stand Up Arkansas — teaching power back to the people",
    children: (
      <div className="space-y-5">
        <p className={lead}>
          Democracy is not a spectator sport, and it is not only what happens in Washington.{" "}
          <a
            href="https://www.standuparkansas.com"
            target="_blank"
            rel="noopener noreferrer"
            className={linkOut}
          >
            Stand Up Arkansas
          </a>{" "}
          is a civics-oriented nonprofit Kelly helps lead: a <strong>grassroots hub</strong> for community
          conversations, <strong>leadership development</strong>, and tools that help ordinary Arkansans feel{" "}
          <strong>competent and equipped</strong> in their own public life—from precinct organization to school boards,{" "}
          <strong>ballot initiatives and referenda</strong>, to supporting leaders who align with their values.
        </p>
        <p className={body}>
          The through-line is <strong>recruit, train, activate</strong>: find people who care, build real skills, then put
          them to work in roles that match their gifts. The values on the page are the ones you want in someone who
          would hold a constitutional office: <strong>inclusivity, empowerment, integrity, collaboration, continuous
          learning</strong>, and a stubborn commitment to <strong>democratic principles</strong>—so that the
          electorate is <strong>informed and heard</strong>, not managed from above.
        </p>
        <p className={body}>
          That work is a preview of how Kelly thinks about the Secretary of State’s office: not as a prize for
          insiders, but as <strong>infrastructure the public can understand and use</strong>—with clarity, patience, and
          respect for every county’s clerks, voters, and business filers.
        </p>
        <p className={cn("rounded-xl border border-kelly-success/25 bg-kelly-success/[0.06] p-4", calloutGreen)}>
          <span className="font-bold text-kelly-text">Explore the org: </span>
          <a
            href="https://www.standuparkansas.com/civic-education-hub"
            target="_blank"
            rel="noopener noreferrer"
            className={linkOut}
          >
            Civic education hub
          </a>{" "}
          ·{" "}
          <a href="https://www.standuparkansas.com/about-us" target="_blank" rel="noopener noreferrer" className={linkOut}>
            About Us
          </a>{" "}
          ·{" "}
          <a href="https://www.standuparkansas.com" target="_blank" rel="noopener noreferrer" className={linkOut}>
            standuparkansas.com
          </a>{" "}
          <ReadMoreLink href={H_STAND} />
        </p>
      </div>
    ),
  },
  {
    id: "initiatives-petitions",
    moreHref: H_INIT,
    eyebrow: "After LEARNS, 2023",
    title: "Ballot petitions, Sherwood, and organizing Arkansas from the ground up",
    children: (
      <div className="space-y-5">
        <p className={lead}>
          In 2023, after the <strong>LEARNS Act</strong> passed, Kelly worked alongside her husband as he launched the
          referendum to <strong>put the law on the ballot</strong>—so citizens, not just the Capitol, could weigh how
          Arkansas spends <strong>education dollars</strong>. Whether you supported LEARNS or opposed it, she believed a
          decision that large for the state’s finances <strong>belonged in the ballot box</strong>.
        </p>
        <p className={body}>
          A second reason they leaned into the <strong>initiative process</strong> was to <strong>help Arkansans
          organize</strong>—so communities could build power where they live first, then work together across counties and
          the state. The next year Kelly helped <strong>coordinate support for petitioners</strong> statewide, and they{" "}
          <strong>rented a small duplex in Sherwood</strong> with <strong>notaries</strong> and space to pick up and drop
          off petitions so volunteers were not on their own.
        </p>
        <p className={body}>
          Work has since expanded to <strong>multiple statewide initiatives</strong> and to local efforts—such as{" "}
          <strong>Jacksonville’s</strong> push on <strong>at-large voting</strong> and patterns tied to a{" "}
          <strong>Jim Crow–era</strong> design. This year Kelly is <strong>not circulating petitions herself</strong> to
          keep any question of bias out of the Secretary of State’s race, but she supports the people’s right to vote
          when they want a measure on the ballot. She also believes in <strong>reducing corporate and dark money</strong>{" "}
          in the process and in keeping citizen-led work as <strong>volunteer-driven</strong> as possible—so that money
          and outside interests do not drown out <strong>public power</strong>. <ReadMoreLink href={H_INIT} />
        </p>
      </div>
    ),
  },
  {
    id: "sos-why",
    moreHref: H_SOS,
    eyebrow: "Why this office, now",
    title: "From soil and citizens to the people’s systems",
    children: (
      <div className="space-y-5">
        <p className={lead}>
          Kelly is running for Secretary of State because the work that has shaped her is the work this office
          demands: <strong>discipline</strong> when the rules and the resources don’t line up,{" "}
          <strong>patience</strong> with people who are new to a process, and <strong>fierce protectiveness</strong> of
          public trust when cynicism is the easy out.
        </p>
        <ul className="list-none space-y-3 font-body text-base leading-relaxed text-kelly-text/85">
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kelly-navy" aria-hidden />
            <span>
              <strong className="text-kelly-text">Telecom operations</strong> taught her how to <strong>run big
              teams</strong>, see <strong>process</strong> clearly, and improve systems so customers—and in this case,{" "}
              <strong>filers and businesses</strong>—are not left paying the price for avoidable confusion.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kelly-navy" aria-hidden />
            <span>
              <strong className="text-kelly-text">Farming and a small market</strong> taught her that{" "}
              <strong>neglect and favoritism</strong> both have consequences you cannot spin away—and that{" "}
              <strong>small operators feel every friction</strong> in fees, time, and paperwork.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kelly-navy" aria-hidden />
            <span>
              <strong className="text-kelly-text">Civic work</strong> taught her that <strong>democracy is a skill</strong>
              —and that Arkansans will step up if someone meets them with respect and training, not condescension.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kelly-navy" aria-hidden />
            <span>
              <strong className="text-kelly-text">Ballot initiatives and petition campaigns</strong> taught her that{" "}
              <strong>direct democracy is logistics</strong>—volunteers, notaries, deadlines, and a process that only works
              when it stays <strong>centered on citizens</strong>, not outside money.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kelly-navy" aria-hidden />
            <span>
              <strong className="text-kelly-text">The SoS role</strong> is where those threads meet: the{" "}
              <strong>systems</strong> that make elections, records, and commerce legible to real people, in all 75
              counties, day after day.
            </span>
          </li>
        </ul>
        <p className={body}>
          She is a Democrat who <strong>does not ask for a free pass on scrutiny</strong>—and who believes we earn
          statewide office by <strong>showing up for the whole state</strong>, including voters and clerks who will never
          agree on everything else. That is the “people over politics” promise in the only form that matters:{" "}
          <strong>actions you can see.</strong> <ReadMoreLink href={H_SOS} />
        </p>
      </div>
    ),
  },
  {
    id: "ask",
    moreHref: H_ASK,
    eyebrow: "What we’re asking",
    title: "Not a spectator campaign",
    children: (
      <div className="space-y-5">
        <p className={lead}>
          Movements do not run on hope alone. They run on <strong>relationships</strong>—and on your willingness to do
          one uncomfortable thing: <strong>bring someone with you</strong> into a conversation they would rather skip.
          Kelly is asking for your <strong>time</strong> and your <strong>voice</strong> in that order.
        </p>
        <ol className="list-decimal space-y-3 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
          <li>
            <strong>Know the story</strong>—her business and farm experience, Stand Up, ballot and initiative work, the
            office—enough to
            explain it in one minute to a neighbor who does not follow politics.
          </li>
          <li>
            <strong>Claim your county</strong>—rural, suburban, or urban: help the campaign show up where Arkansas
            actually lives, not just where it is easy to park a camera.
          </li>
          <li>
            <strong>Stack hands</strong>—host, door-knock, make calls, or run errands for someone who is already doing
            the work. Momentum is <strong>reciprocal</strong>: when you act, you give others permission to act.
          </li>
        </ol>
        <p className="font-body text-base text-kelly-text/78">
          Questions that need a person, not a page:{" "}
          <a href="mailto:kelly@kellygrappe.com" className={linkOut}>
            kelly@kellygrappe.com
          </a>
          . Or go straight to{" "}
          <Link href="/get-involved" className={linkOut}>
            Get involved
          </Link>{" "}
          and <Link href="/priorities" className={linkOut}>Office priorities</Link>. <ReadMoreLink href={H_ASK} />
        </p>
      </div>
    ),
  },
];

export type KellyFullStoryProps = {
  /** Two breakouts: after “The story we share” and after Stand Up (farm stills stay in the Forevermost block). */
  trailPeoplePhotos?: CampaignTrailPhoto[];
  /**
   * Forevermost / Heifer USA YouTube (above the “The land & the work” heading). From
   * `NEXT_PUBLIC_FOREVERMOST_HEIFER_INBOUND_ID` or `NEXT_PUBLIC_FOREVERMOST_HEIFER_YOUTUBE_VIDEO_ID` (see /about page).
   */
  forevermostHeiferYoutubeVideoId?: string | null;
  forevermostHeiferIframeTitle?: string;
};

/** One-page Meet Kelly narrative, trail breakouts, Forevermost and initiatives photo blocks. */
export function KellyFullStory({
  trailPeoplePhotos = [],
  forevermostHeiferYoutubeVideoId = null,
  forevermostHeiferIframeTitle = "Forevermost Farms — Heifer USA",
}: KellyFullStoryProps) {
  const forevermostPhotos = forevermostFarmTrailPhotos(campaignTrailPhotos);
  const initiativesPhotos = initiativesPetitionTrailPhotos(campaignTrailPhotos);
  const [afterStoryPhoto, afterStandupPhoto] = trailPeoplePhotos;

  return (
    <div id="kelly-full-story" className="scroll-mt-20 space-y-10 sm:space-y-14 md:space-y-20">
      <div className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)] md:p-6">
        <p className={lead}>
          Below is the <strong>Meet Kelly</strong> walk-through—business, farm, civics, and the case for this office. For
          the literary manuscript organized in four arcs with chapter links, start with{" "}
          <Link href="#kelly-biography-arcs" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
            Biography arcs
          </Link>{" "}
          above or open the{" "}
          <Link href="/biography" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
            full biography hub
          </Link>
          .
        </p>
      </div>
      {sections.map((s) => (
        <Fragment key={s.id}>
          <section id={s.id} className="scroll-mt-20">
            {s.id === "forevermost" && forevermostHeiferYoutubeVideoId ? (
              <ForevermostHeiferVideo
                videoId={forevermostHeiferYoutubeVideoId}
                iframeTitle={forevermostHeiferIframeTitle}
              />
            ) : null}
            <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/90">{s.eyebrow}</p>
            <h2 className={h2}>{s.title}</h2>
            <div className="mt-4 md:mt-5">
              {s.children}
              {s.id === "forevermost" && forevermostPhotos.length > 0 ? (
                <div
                  className="mt-10 w-full border-t border-kelly-text/10 pt-10"
                  aria-label="Forevermost Farms — field photography"
                >
                  <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-text/50">
                    At Forevermost
                  </p>
                  <div className="mt-6 flex w-full flex-col gap-8">
                    {forevermostPhotos.map((p) => (
                      <EditorialCampaignPhoto key={p.id} photo={p} variant="fluid" />
                    ))}
                  </div>
                </div>
              ) : null}
              {s.id === "initiatives-petitions" && initiativesPhotos.length > 0 ? (
                <div
                  className="mt-10 w-full border-t border-kelly-text/10 pt-10"
                  aria-label="Ballot and education organizing"
                >
                  {initiativesPhotos.map((p) => (
                    <EditorialCampaignPhoto key={p.id} photo={p} variant="fluid" kicker="On the ground" />
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {s.id === "story" && afterStoryPhoto ? (
            <EditorialCampaignPhoto variant="breakout" photo={afterStoryPhoto} kicker="With Arkansans" />
          ) : null}

          {s.id === "standup" && afterStandupPhoto ? (
            <EditorialCampaignPhoto variant="breakout" photo={afterStandupPhoto} kicker="Civic Arkansas" />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
