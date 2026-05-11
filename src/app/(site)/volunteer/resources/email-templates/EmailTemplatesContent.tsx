"use client";

import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { CopyTextButton } from "@/components/volunteer/CopyTextButton";
import {
  DOWNSTREAM_LEAD_EMAIL_SUBJECT,
  NEW_PERSON_EMAIL_SUBJECT,
  buildDownstreamTeamLeadEmail,
  buildNewPersonPlacementEmail,
} from "@/lib/volunteer-ops/p5-placement-emails";

function Block({
  id,
  title,
  subject,
  body,
}: {
  id: string;
  title: string;
  subject: string;
  body: string;
}) {
  const full = `Subject: ${subject}\n\n${body}`;
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">{title}</h2>
        <CopyTextButton text={full} label="Copy subject + body" />
      </div>
      <p className="mt-3 font-body text-xs font-bold uppercase text-kelly-text/50">Subject</p>
      <p className="mt-1 font-body text-sm text-kelly-deep">{subject}</p>
      <p className="mt-4 font-body text-xs font-bold uppercase text-kelly-text/50">Body</p>
      <pre className="mt-2 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-xl border border-kelly-text/10 bg-kelly-page/80 p-4 font-body text-sm text-kelly-text/85">
        {body}
      </pre>
    </section>
  );
}

const DOWNSTREAM_SAMPLE = buildDownstreamTeamLeadEmail({
  teamLeadName: "[Team Lead Name]",
  downstreamTeamName: "[Team Name]",
  personName: "[Person Name]",
  location: "[Location]",
  interestLine: "[Interest / role / issue]",
  connectionSource: "[Who knows them / how they came in]",
  senderName: "[Your Name]",
});

const AFTER_APPROVAL_SAMPLE = buildNewPersonPlacementEmail({
  firstName: "[First Name]",
  downstreamTeamName: "[Team Name]",
  inviteLinkOrQrNote: "[Invite Link / QR Code]",
  senderName: "[Your Name]",
});

const INVITE_VOLUNTEER = `Hi [First Name],

I’ve been volunteering with Kelly’s campaign because [one sentence — your reason]. If you’re curious what it looks like, the best place to start is the volunteer page — no pressure, and you can stop anytime.

Link: [https://your-domain.example/volunteer]

Thank you,
[Your Name]`;

const OUTREACH_SOCIAL = `Hi [First Name],

We’re hosting a relaxed community outreach night for neighbors who want to meet other volunteers — no speeches required. Would you like me to send you the details?

Thank you,
[Your Name]`;

const VR_EVENT = `Hi [First Name],

We’re doing a focused voter registration help session locally. If you want to check your status or bring someone who needs help registering, I’d love to save you a spot.

Thank you,
[Your Name]`;

const FOLLOW_UP = `Hi [First Name],

Good talking with you — I’m following up like I promised. If you want the next step, here’s the link: [link]. If now isn’t the time, totally okay — I’m grateful you listened.

[Your Name]`;

const THANK_YOU = `Hi [First Name],

Thank you for helping today — it mattered. If you ever want to pitch in again, just text me. 

With gratitude,
[Your Name]`;

const SHARE_VOLUNTEER = `Hi [First Name],

Would you mind sharing the volunteer signup page with one or two people who might care about showing up locally? Here’s the link: [https://your-domain.example/volunteer]

Thanks,
[Your Name]`;

const INVITE_P5 = `Hi [First Name],

A few of us are building small “Power of 5” circles — basically five people we truly know, and we stay in touch about elections and community stuff without spamming anyone. If you’re open to hearing more over coffee, I’d love to tell you how it works.

[Your Name]`;

const COUNTY_MEETING_INVITE = `Hi [First Name],

Our [County] Democratic Party meets monthly — [date] at [time] at [venue / address]. We’ll cover [short agenda teaser] and welcome new folks.

Please RSVP [RSVP link or reply to this email]. If you’d rather not receive invites, just let me know — no problem.

Thank you,
[Your Name]
[Role — optional]`;

const COUNTY_RSVP_REMINDER = `Hi [First Name],

Quick reminder: our county party meeting is [date] at [time] at [venue]. If you’re planning to come, could you RSVP by [deadline]? It helps us set chairs and print materials.

RSVP: [link or “reply yes”]

See you there,
[Your Name]`;

const COUNTY_FOLLOW_UP_MEETING = `Hi [First Name],

Thank you for coming to last night’s county meeting — it was good to see you. If you’re open to one small next step, we’re looking for help with [specific role or table]. Want a 15-minute call this week?

Either way, grateful you showed up.

[Your Name]`;

const COUNTY_VOLUNTEER_INVITE_PARTY = `Hi [First Name],

The county party runs on volunteers — from small one-hour asks to leadership tracks. If you’re curious, the easiest start is [specific shift or committee]. No pressure; I’m happy to answer questions.

Reply with “tell me more” or pass — both are fine.

[Your Name]`;

const COUNTY_P5_INVITE_MEETING = `Hi [First Name],

I’m part of the [County] Democrats’ organizing circle and we’re using “Power of 5” — staying in touch with a few people we really know about meetings, registration help, and turnout without spamming anyone.

Our next county meeting is [date] at [venue]. Would you like to come with me? I can save you a seat and introduce you around.

[Your Name]`;

const COUNTY_THANK_ATTEND = `Hi [First Name],

Thank you for being at the county meeting — new faces make a real difference. If something sparked your interest (events, precinct work, voter registration, youth outreach), reply with what sounded fun and I’ll connect you with the right person.

Gratefully,
[Your Name]`;

const COUNTY_PRECINCT_INVITE = `Hi [First Name],

We’re standing up a small precinct team for [Precinct / area] — three people sharing turnout, neighbors, and a monthly check-in with the county chair. You’d be great for [role: captain / outreach / data & reminders].

Want to grab coffee and walk through it?

[Your Name]`;

const EVENT_HOST_THANK = `Hi [Host Name],

Thank you for opening your home (and your evening) for [event title]. That kind of trust is how we actually meet neighbors — I don’t take it lightly.

A few quick notes:
- We had about [number] guests; [one honest win].
- I’ll follow up with [names] this week about [next step].

If you’re willing to host again later this season, I’d love to talk dates — zero pressure if you need a long break.

With gratitude,
[Your Name]`;

const EVENT_ATTENDEE_FU = `Hi [First Name],

It was really good to see you at [event / host’s name’s gathering]. If you’re open to staying in touch, here’s a small next step that might fit: [one concrete option — volunteer shift / next coffee / county meeting date].

If timing’s bad right now, totally understood — I’m still glad you came.

[Your Name]`;

const EVENT_FUNDRAISER_THANK = `Hi [First Name],

Thank you for being part of [event title]. Your support helps us keep showing up across Arkansas the right way — with organizers on the ground and respectful community programs.

[If applicable] Here’s the link or address for completing what we discussed: [compliance-approved link or reply path].

If you have questions about employer/occupation or receipts, reply and we’ll connect you with our treasurer team.

Gratefully,
[Your Name]`;

export function EmailTemplatesContent() {
  return (
    <>
      <FullBleedSection padY variant="default" aria-labelledby="email-templates-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="email-templates-heading"
            align="left"
            eyebrow="Volunteers"
            title="Email templates"
            subtitle="Bracketed fields are placeholders — personalize in your mail app. Keep claims factual and approved."
          />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY variant="subtle">
        <ContentContainer className="flex max-w-3xl flex-col gap-8">
          <Block id="downstream-fit" title="Ask a downstream team lead about fit" subject={DOWNSTREAM_LEAD_EMAIL_SUBJECT} body={DOWNSTREAM_SAMPLE} />
          <Block id="after-approval" title="Send invite link / QR after approval" subject={NEW_PERSON_EMAIL_SUBJECT} body={AFTER_APPROVAL_SAMPLE} />
          <Block
            id="invite-volunteer"
            title="Invite someone to volunteer"
            subject="A friendly next step if you’re curious"
            body={INVITE_VOLUNTEER}
          />
          <Block id="outreach-social-hour" title="Invite · community outreach social hour" subject="Community night — no pressure" body={OUTREACH_SOCIAL} />
          <Block id="vr-event" title="Invite · voter registration event" subject="Registration help nearby" body={VR_EVENT} />
          <Block id="follow-up" title="Follow up after a conversation" subject="Following up" body={FOLLOW_UP} />
          <Block id="thank-you" title="Thank someone after they help" subject="Thank you" body={THANK_YOU} />
          <Block id="share-volunteer" title="Ask someone to share the volunteer page" subject="Quick favor — share the volunteer page" body={SHARE_VOLUNTEER} />
          <Block
            id="invite-p5"
            title="Invite someone to build their own Power of 5"
            subject="Coffee? I’d love to explain something we’re trying"
            body={INVITE_P5}
          />

          <SectionHeading
            id="county-party-email-templates"
            align="left"
            eyebrow="County party"
            title="County Democratic Party templates"
            subtitle="Use with the County Party Launch Kit and dashboard monthly-meeting workflow; pair sends with Action Queue tasks."
          />
          <Block
            id="county-meeting-invite"
            title="Invite to monthly county meeting"
            subject="You’re invited · [County] Democrats · [Month] meeting"
            body={COUNTY_MEETING_INVITE}
          />
          <Block id="county-rsvp-reminder" title="Reminder to RSVP" subject="RSVP for [date] county meeting?" body={COUNTY_RSVP_REMINDER} />
          <Block
            id="county-follow-up-meeting"
            title="Follow-up after county meeting"
            subject="Great seeing you at the county meeting"
            body={COUNTY_FOLLOW_UP_MEETING}
          />
          <Block
            id="county-volunteer-invite-party"
            title="Invite to volunteer with the county party"
            subject="Quick thought — want to help locally?"
            body={COUNTY_VOLUNTEER_INVITE_PARTY}
          />
          <Block
            id="county-p5-invite-meeting"
            title="Invite Power of 5 to county meeting"
            subject="Want to join me at the county meeting?"
            body={COUNTY_P5_INVITE_MEETING}
          />
          <Block id="county-thank-attend" title="Thank-you for attending" subject="Thank you for coming tonight" body={COUNTY_THANK_ATTEND} />
          <Block
            id="county-precinct-invite"
            title="Invite to precinct team (3-person triad)"
            subject="We’re building a precinct team — interested?"
            body={COUNTY_PRECINCT_INVITE}
          />

          <SectionHeading
            id="events-follow-up-templates"
            align="left"
            eyebrow="Events lane"
            title="Event follow-up templates"
            subtitle="Pair with the Events operating manual and Action Queue tasks after house parties, receptions, and immersions."
          />
          <Block id="event-follow-up-host" title="Thank-you to event host" subject="Thank you for hosting us" body={EVENT_HOST_THANK} />
          <Block
            id="event-follow-up-attendee"
            title="Follow-up with attendee after small gathering"
            subject="Great seeing you at [host]’s gathering"
            body={EVENT_ATTENDEE_FU}
          />
          <Block
            id="event-fundraising-thanks"
            title="Thank-you after fundraising event"
            subject="Thank you for supporting [event title]"
            body={EVENT_FUNDRAISER_THANK}
          />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
