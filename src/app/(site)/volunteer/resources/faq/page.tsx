import type { Metadata } from "next";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { getResourceRequestMailtoHref } from "@/lib/campaign-links";

export const metadata: Metadata = {
  title: "Volunteer FAQ",
  description:
    "Answers for first-time volunteers: time, social comfort, online help, teams, students, and where to get support.",
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "I’ve never volunteered before. Where do I start?",
    a: "Read the volunteer home page, pick a lane that fits your comfort (online, events, or one-on-one outreach), and sign up. Your team dashboard will suggest a simple next step — usually a 15-minute win.",
  },
  {
    q: "How much time does this take?",
    a: "You choose. Some people give an hour a week; some give a few focused hours before an event or Election Day. Say your real availability upfront so your team can plan kindly.",
  },
  {
    q: "What if I don’t know anyone?",
    a: "Start online or at public events where you are not cold-knocking alone. Pair with a buddy from your team; campaigns are easier with a partner.",
  },
  {
    q: "What if I don’t want to lead?",
    a: "Perfect — we need helpers and hosts, not only “leaders.” Say you prefer support roles; the triad model spreads responsibility so one person does not carry everything.",
  },
  {
    q: "What if I can only help online?",
    a: "There is real work there: social posts, graphic tweaks, training reminders, texting shifts where allowed, and helping friends register from their phones.",
  },
  {
    q: "What is a 3-person team?",
    a: "Three volunteers covering events, social, and Power of 5 / voter registration in the same geography. It is the standard “triad” that keeps the workload human-scale.",
  },
  {
    q: "What is Power of 5?",
    a: "A habit of steady, personal follow-up with a small circle — think quality relationships, not blasting strangers.",
  },
  {
    q: "Do I need political experience?",
    a: "No. You need curiosity and reliability. We will point you to scripts, FAQs, and messaging approved by the campaign.",
  },
  {
    q: "What happens after I sign up?",
    a: "You get onboarding steps, resource links, and usually a team assignment or a path to start one. Your dashboard becomes the home for tasks and updates.",
  },
  {
    q: "Who do I ask for help?",
    a: "Start with your triad or upstream contact. If you are stuck on legal, approvals, or serious conflict, use the Ask Campaign path on your dashboard or the contact link in the footer.",
  },
  {
    q: "What if I invite someone and they say no?",
    a: "Thank them and move on gracefully. A respectful “no” preserves the relationship; organizing is a marathon of small yeses.",
  },
  {
    q: "What if my team is missing a role?",
    a: "Document the gap on your dashboard, pair lanes temporarily, and recruit for the empty lane. HQ can help with placement ideas if you are spinning.",
  },
  {
    q: "Can students participate?",
    a: "Often yes — many roles fit students. Rules vary by school and election law; we steer you to compliant activities and honest schedules.",
  },
  {
    q: "Can I host something small?",
    a: "Yes. Coffee meetups, dorm tabling with permission, or a living-room huddle count. Small + well-hosted beats fancy + empty.",
  },
  {
    q: "What if I’m nervous about talking to people?",
    a: "Use scripts, bring a partner, and practice on friends first. Many great organizers started shy — structure and repetition help.",
  },
  {
    q: "How do I report progress?",
    a: "Use the numbers your team tracks (registrations, touches, events, downstream launches). If you are unsure, ask your upstream contact which weekly fields matter right now.",
  },
];

export default function VolunteerFaqPage() {
  const helpMail = getResourceRequestMailtoHref();

  return (
    <>
      <PageHero
        eyebrow="Volunteers · Resources"
        title="Frequently asked questions"
        subtitle="For people who are new to campaigns. Plain answers — no insider talk required."
      >
        <Button href="/volunteer/resources/glossary" variant="outline">
          Glossary
        </Button>
        <Button href="/volunteer/resources" variant="outline">
          Resource library
        </Button>
        <Button href="/volunteer" variant="outline">
          Volunteer home
        </Button>
      </PageHero>

      <ContentContainer className="max-w-3xl py-10 md:py-14">
        <p className="font-body text-sm text-kelly-text/80">
          Still stuck?{" "}
          <a href={helpMail} className="font-semibold text-kelly-blue underline hover:text-kelly-navy">
            Message the resource desk
          </a>{" "}
          or use the contact link in any dashboard footer. Campaign terms like “GOTV” and “upstream” are in the{" "}
          <a href="/volunteer/resources/glossary" className="font-semibold text-kelly-blue underline hover:text-kelly-navy">
            glossary
          </a>
          .
        </p>

        <div className="mt-10 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-kelly-text/10 bg-white shadow-sm open:shadow-md"
            >
              <summary className="cursor-pointer list-none px-5 py-4 font-body text-sm font-semibold text-kelly-navy md:px-6 md:text-base [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-3">
                  <span>{item.q}</span>
                  <span className="mt-0.5 shrink-0 font-mono text-xs text-kelly-text/45 transition group-open:rotate-180">
                    ▾
                  </span>
                </span>
              </summary>
              <div className="border-t border-kelly-text/10 px-5 pb-5 pt-2 font-body text-sm leading-relaxed text-kelly-text/85 md:px-6">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </ContentContainer>
    </>
  );
}
