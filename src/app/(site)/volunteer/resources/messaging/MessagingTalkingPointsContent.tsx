"use client";

import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { CopyTextButton } from "@/components/volunteer/CopyTextButton";

function TalkBlock({
  id,
  title,
  body,
}: {
  id: string;
  title: string;
  body: string;
}) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">{title}</h2>
        <CopyTextButton text={body} label="Copy talking points" />
      </div>
      <p className="mt-4 whitespace-pre-wrap font-body text-sm leading-relaxed text-kelly-text/85">{body}</p>
    </section>
  );
}

const KELLY_STANDS_FOR = `Kelly stands for trustworthy public service, practical help for Oklahoma families, and elections everyone can trust.
We lead with neighbor care — schools, health care access, and jobs — without tearing others down.`;

const WHY_RUNNING = `Kelly is running to bring honest leadership home — someone who listens, tells the truth, and shows up when it matters.
Use your own one-sentence story about why *you* said yes; pair it with HQ-approved policy links when people want depth.`;

const ELECTION_INTEGRITY = `Election integrity means every eligible voter can participate and every ballot is counted fairly.
We support clear rules, transparent processes, and zero tolerance for intimidation — and we don’t trade in rumors.`;

const VOTER_REGISTRATION = `Voter registration is neighbor care. Offer to help someone check their status or find a trusted site.
No lecturing — meet people where they are. Pair interested folks with monthly VR events when available.`;

const VOLUNTEER_INVITE = `“I’m volunteering because I want our community represented by someone who tells the truth. If you’re curious, start at /volunteer — zero pressure.”
Listen more than you pitch; invite, don’t debate.`;

const P5_INVITE = `“When you’re ready, pick five people you truly know — we’ll help you coach them toward registration and turnout without spamming anyone. If your list fills, we place new friends downstream so teams stay small and strong.”`;

const SECURE_ELECTIONS = `Secure elections mean ballots are cast in private, counted accurately, and protected from intimidation.
We support local officials doing their jobs; we don’t traffic in conspiracy shorthand.`;

const LOCAL_CONTROL = `Local control is about listening to counties and towns — practical leadership, not one-size-fits-all mandates from far away.
Volunteers connect neighbors to facts and help, not noise.`;

const SERVICE_ACCOUNTABILITY = `Service and accountability means showing up, telling the truth, and fixing what we can.
We credit community partners and public servants who do the work honestly.`;

const TRIAD_MODEL = `Our teams use three coordinators: Events (local calendar), Social Media (authentic local posts), and Power of 5 / VR (relational turnout).
It keeps work organized without burning out one hero volunteer.`;

const EXPLAIN_P5 = `Power of 5 is simple: name five people you truly know and stay in steady, respectful touch about voting and community.
When your list is full, we help place new relationships downstream so networks stay healthy.`;

const NO_PRESSURE = `“I’m not asking for a promise — just permission to share what I’m learning.”
Offer an easy out: “If now’s not the time, I’m still glad we talked.”`;

const FAQ = `Q: Is this paid?
A: Volunteer roles are neighbor-led; point compensation questions to HQ.

Q: Who is Kelly running against?
A: Stay factual — no unsourced opponent claims. Share Kelly’s story and values.

Q: Can I bring a friend?
A: Yes — especially to outreach socials or VR tables. Route formal volunteer interest to /volunteer.`;

const CAPTION_EXAMPLES = `Showed up for [local event] today — grateful for everyone working to make our community stronger. Learn about volunteering: [link]

Neighbor-led teams > endless feeds. If you’ve ever thought about helping out, start here: /volunteer`;

export function MessagingTalkingPointsContent() {
  return (
    <>
      <FullBleedSection padY variant="default" aria-labelledby="messaging-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="messaging-heading"
            align="left"
            eyebrow="Volunteers"
            title="Messaging & talking points"
            subtitle="Consistent, humane language for doors, texts, and social — expand only from campaign-approved sources."
          />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY variant="subtle">
        <ContentContainer className="flex max-w-3xl flex-col gap-8">
          <TalkBlock id="kelly-stands-for" title="What Kelly stands for" body={KELLY_STANDS_FOR} />
          <TalkBlock id="why-running" title="Why Kelly is running" body={WHY_RUNNING} />
          <TalkBlock id="election-integrity" title="Election integrity" body={ELECTION_INTEGRITY} />
          <TalkBlock id="secure-elections" title="Secure elections" body={SECURE_ELECTIONS} />
          <TalkBlock id="local-control" title="Local control" body={LOCAL_CONTROL} />
          <TalkBlock id="service-accountability" title="Service and accountability" body={SERVICE_ACCOUNTABILITY} />
          <TalkBlock id="voter-registration" title="Voter registration" body={VOTER_REGISTRATION} />
          <TalkBlock id="volunteer-invite" title="Volunteer invitation" body={VOLUNTEER_INVITE} />
          <TalkBlock id="p5-invite" title="Power of 5 invitation" body={P5_INVITE} />
          <TalkBlock id="triad-model" title="How to talk about the 3-person team model" body={TRIAD_MODEL} />
          <TalkBlock id="explain-p5" title="How to explain Power of 5" body={EXPLAIN_P5} />
          <TalkBlock id="no-pressure" title="How to invite someone without pressure" body={NO_PRESSURE} />
          <TalkBlock id="captions" title="Social media caption examples" body={CAPTION_EXAMPLES} />
          <TalkBlock id="faq" title="How to answer common questions" body={FAQ} />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
