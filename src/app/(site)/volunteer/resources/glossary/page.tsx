import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";

export const metadata: Metadata = {
  title: "Volunteer glossary",
  description:
    "Plain-language definitions for people who are new to volunteering, teams, lanes, and field organizing.",
};

const ENTRIES: { term: string; definition: string }[] = [
  {
    term: "Volunteer",
    definition:
      "Someone who gives time to help the campaign without being paid. You choose how much you do and how public you want to be.",
  },
  {
    term: "Team",
    definition:
      "A small group of volunteers in the same area who divide work so nobody is overwhelmed. Think neighbors helping neighbors, with a rhythm.",
  },
  {
    term: "3-person team",
    definition:
      "The smallest full team shape we use: three people covering three lanes — events, social media, and Power of 5 / voter registration. It keeps work balanced.",
  },
  {
    term: "Lane",
    definition:
      "A themed area of work (like events or social posts). Each lane has simple habits so the team always knows what “good” looks like.",
  },
  {
    term: "Power of 5",
    definition:
      "A friendly way to grow outreach: each volunteer stays in touch with a few people they actually know, with care and follow-through — not blast messaging.",
  },
  {
    term: "Voter registration",
    definition:
      "Helping eligible neighbors check their status, register, or update their information so they can vote. We keep it helpful and non-pressuring.",
  },
  {
    term: "GOTV",
    definition:
      "Stands for “Get Out The Vote.” Near Election Day it means reminders, rides, and clarity so supporters actually cast their ballot.",
  },
  {
    term: "Downstream team",
    definition:
      "A newer team you helped start — often in a nearby neighborhood, campus, or group — so organizing spreads in a healthy, local way.",
  },
  {
    term: "Upstream contact",
    definition:
      "The person or team you report lightweight updates to. They are there for coaching and answers, not micromanagement.",
  },
  {
    term: "Team dashboard",
    definition:
      "Your online home base: tasks, numbers, resources, and messages in one place so you do not have to hunt through emails.",
  },
  {
    term: "Action queue",
    definition:
      "The short list of “do this next” items the system surfaces so you always have a sensible next step.",
  },
  {
    term: "House party",
    definition:
      "A small gathering at someone’s home to meet the candidate or a surrogate, ask questions, and invite friends. Intimate and conversational.",
  },
  {
    term: "Meet-and-greet",
    definition:
      "A casual event where voters can shake hands, take a photo, and hear a short message. Lower lift than a big rally.",
  },
  {
    term: "Fundraiser",
    definition:
      "An event (or small online push) where supporters chip in legally and transparently. The finance team sets the rules; you help host or invite.",
  },
  {
    term: "County party meeting",
    definition:
      "A regular local Democratic Party meeting. Good for meeting chairs, picking up materials, and coordinating county-wide plans.",
  },
  {
    term: "Precinct",
    definition:
      "The smallest geographic slice elections use for reporting results. Teams often align to a neighborhood or precinct for clarity.",
  },
  {
    term: "County Clerk",
    definition:
      "The county official who runs elections locally — ballots, early voting sites, and official information. We point voters to clerk sites for accuracy.",
  },
  {
    term: "RSVP",
    definition:
      "French shorthand for “please reply.” It tells hosts how many people to expect for food, seating, or materials.",
  },
  {
    term: "KPI",
    definition:
      "Key performance indicator — a plain number that shows momentum (like registrations helped or events hosted). It is a compass, not a report card.",
  },
  {
    term: "Weekly huddle",
    definition:
      "A short standing meeting (often 30 minutes) to share wins, pick priorities, and unblock each other before the next week.",
  },
  {
    term: "Field playbook",
    definition:
      "The campaign’s living manual for how we organize: roles, rhythms, templates, and examples. Read what you need, when you need it.",
  },
  {
    term: "Community region",
    definition:
      "A campaign-friendly way to group outreach for a community (faith, culture, campus, etc.) with respect and local leadership input.",
  },
];

export default function VolunteerGlossaryPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteers · Resources"
        title="Glossary"
        subtitle="Simple definitions if you’ve never volunteered on a campaign before. No jargon quizzes — just English."
      >
        <Button href="/volunteer/resources" variant="outline">
          Resource library
        </Button>
        <Button href="/volunteer/resources/faq" variant="outline">
          FAQ
        </Button>
        <Button href="/volunteer" variant="outline">
          Volunteer home
        </Button>
      </PageHero>

      <ContentContainer className="max-w-3xl py-10 md:py-14">
        <p className="font-body text-sm text-kelly-text/80">
          Looking for downloads and worksheets? Start at the{" "}
          <Link href="/volunteer/resources" className="font-semibold text-kelly-blue underline hover:text-kelly-navy">
            resource library
          </Link>
          — every printable shows its review status.
        </p>

        <dl className="mt-10 space-y-8">
          {ENTRIES.map((e) => (
            <div key={e.term} className="rounded-2xl border border-kelly-text/10 bg-white px-5 py-5 shadow-sm md:px-6">
              <dt className="font-heading text-lg font-bold text-kelly-navy">{e.term}</dt>
              <dd className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">{e.definition}</dd>
            </div>
          ))}
        </dl>
      </ContentContainer>
    </>
  );
}
