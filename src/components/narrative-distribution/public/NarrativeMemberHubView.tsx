import type { ReactNode } from "react";
import Link from "next/link";
import type { PublicMemberHubModel } from "@/lib/narrative-distribution/public-member-hub";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { cn, focusRing, tapMinSmCompact } from "@/lib/utils";
import { NarrativeMemberHubConversationLab } from "./NarrativeMemberHubConversationLab";

function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-amber-200/90 bg-amber-50/95 px-2 py-0.5 font-body text-[10px] font-extrabold uppercase tracking-wide text-amber-950",
        className,
      )}
    >
      Demo / seed
    </span>
  );
}

function CardShell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-card border border-kelly-text/10 bg-kelly-page/90 p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function QuickLinkPill({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        focusRing,
        tapMinSmCompact,
        "inline-flex rounded-full border border-kelly-navy/20 bg-white/90 px-3 font-body text-xs font-semibold text-kelly-navy shadow-sm transition hover:border-kelly-navy/35 hover:bg-kelly-gold/15 sm:py-1.5",
      )}
    >
      {children}
    </Link>
  );
}

type Props = { model: PublicMemberHubModel };

export function NarrativeMemberHubView({ model }: Props) {
  return (
    <>
      <FullBleedSection variant="subtle" padY aria-labelledby="member-hub-intro">
        <ContentContainer wide>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl space-y-3">
              <p id="member-hub-intro" className="text-sm leading-relaxed text-kelly-text/80">
                <strong className="text-kelly-navy">This week’s conversation shelf.</strong> Grab the line, the county packets, and language for your
                Power of 5. Long-form lives on{" "}
                <Link href="/stories" className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")}>
                  Stories
                </Link>{" "}
                and{" "}
                <Link href="/blog" className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")}>
                  Blog
                </Link>
                — this page is the fast field layer (still demo/seed until approvals connect).
              </p>
              <div className="flex flex-wrap gap-2" aria-label="Quick links">
                <QuickLinkPill href="/onboarding/power-of-5">Power of 5 onboarding</QuickLinkPill>
                <QuickLinkPill href="/stories">Stories</QuickLinkPill>
                <QuickLinkPill href="/blog">Blog</QuickLinkPill>
                <QuickLinkPill href="/listening-sessions">Listening sessions</QuickLinkPill>
                <QuickLinkPill href="/get-involved">Get involved</QuickLinkPill>
              </div>
            </div>
            <DemoBadge className="shrink-0 self-start" />
          </div>
          <p className="mt-3 rounded-lg border border-kelly-text/10 bg-kelly-navy/[0.03] p-3 text-xs leading-relaxed text-kelly-text/75">
            {model.demoNotice}
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="motw-heading">
        <ContentContainer wide>
          <SectionHeading
            id="motw-heading"
            align="left"
            eyebrow="This week"
            title="Message of the week"
            subtitle="One spine for conversations — personalize with local color you can stand behind."
          />
          <CardShell className="mt-6 border-l-4 border-l-kelly-gold/80">
            <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">{model.messageOfWeek.weekLabel}</p>
            <h3 className="font-heading mt-2 text-xl font-bold text-kelly-navy sm:text-2xl">{model.messageOfWeek.title}</h3>
            <p className="mt-2 text-sm font-medium text-kelly-text/85">{model.messageOfWeek.dek}</p>
            <p className="mt-4 text-sm leading-relaxed text-kelly-text/80">{model.messageOfWeek.body}</p>
          </CardShell>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="priorities-heading">
        <ContentContainer wide>
          <SectionHeading
            id="priorities-heading"
            align="left"
            eyebrow="Field narrative"
            title="Upcoming narrative priorities"
            subtitle="What we’re steering toward next — demo queue until editorial publishes live beats."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {model.narrativePriorities.map((p) => (
              <CardShell key={p.title} className="flex flex-col border-t-4 border-t-kelly-slate/25">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-kelly-text/45">{p.windowLabel}</p>
                <h3 className="font-heading mt-2 text-base font-bold text-kelly-navy">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-kelly-text/80">{p.summary}</p>
                {p.href && p.hrefLabel ? (
                  <Link
                    href={p.href}
                    className={cn(focusRing, "mt-4 inline-flex rounded-sm text-sm font-semibold text-kelly-navy underline")}
                  >
                    {p.hrefLabel} →
                  </Link>
                ) : null}
              </CardShell>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="say-five-heading">
        <ContentContainer wide>
          <SectionHeading
            id="say-five-heading"
            align="left"
            eyebrow="Power of 5"
            title="What to say to your five"
            subtitle="Five speak-aloud beats you can rotate through your circle this week."
          />
          <p className="mt-2 max-w-3xl text-sm text-kelly-text/75">{model.whatToSayToYourFive.intro}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {model.whatToSayToYourFive.lines.map((line) => (
              <CardShell key={line.setting} className="border-l-4 border-l-kelly-gold/50">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-kelly-text/45">{line.setting}</p>
                <p className="mt-2 text-sm leading-relaxed text-kelly-text/85">{line.script}</p>
              </CardShell>
            ))}
          </div>
          <p className="mt-6 text-sm text-kelly-text/70">
            Want registry-backed starters and a place name field? Use the{" "}
            <a href="#conversation-lab" className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")}>
              conversation lab
            </a>{" "}
            below — same message engine as onboarding, no background tracking on this page.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="conversation-lab-heading">
        <ContentContainer wide>
          <SectionHeading
            id="conversation-lab-heading"
            align="left"
            eyebrow="Interactive"
            title="Conversation lab"
            subtitle="Dial in mission, tone, and place — pull fresh openers from the message content engine."
          />
          <div id="conversation-lab" className="mt-6">
            <NarrativeMemberHubConversationLab />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="local-stories-heading">
        <ContentContainer wide>
          <SectionHeading
            id="local-stories-heading"
            align="left"
            eyebrow="Place-based"
            title="Local story prompts"
            subtitle="Questions that pull county-colored stories — replace “your area” with your turf out loud."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {model.localStoryPrompts.map((row) => (
              <CardShell key={row.id}>
                <h3 className="font-heading text-base font-bold text-kelly-navy">{row.title}</h3>
                <p className="mt-2 text-sm text-kelly-text/85">{row.prompt}</p>
                <p className="mt-3 text-xs text-kelly-text/60">{row.bridgeHint}</p>
              </CardShell>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="county-packets-heading">
        <ContentContainer wide>
          <SectionHeading
            id="county-packets-heading"
            align="left"
            eyebrow="Place-based"
            title="County message packets"
            subtitle="Demo packets from the narrative distribution registry — command + OIS stubs for each county."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {model.countyCards.map((c) => (
              <CardShell key={c.countySlug} className="flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading text-lg font-bold text-kelly-navy">{c.displayName}</h3>
                  <DemoBadge />
                </div>
                <p className="mt-2 text-sm text-kelly-text/80">{c.teaser}</p>
                <p className="mt-3 text-xs leading-snug text-kelly-text/60">{c.coreLine}</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link
                    href={c.countyCommandHref}
                    className={cn(
                      focusRing,
                      tapMinSmCompact,
                      "inline-flex rounded-lg bg-kelly-navy px-4 text-xs font-bold text-white hover:bg-kelly-navy/90 sm:px-3 sm:py-1.5",
                    )}
                  >
                    County command
                  </Link>
                  <Link
                    href={c.organizingIntelligenceHref}
                    className={cn(
                      focusRing,
                      tapMinSmCompact,
                      "inline-flex rounded-sm text-xs font-semibold text-kelly-navy underline decoration-kelly-navy/35 sm:min-h-0 sm:px-0",
                    )}
                  >
                    OIS county shell
                  </Link>
                </div>
              </CardShell>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="p5-prompts-heading">
        <ContentContainer wide>
          <SectionHeading
            id="p5-prompts-heading"
            align="left"
            eyebrow="Organizing ladder"
            title="Deeper conversation prompts"
            subtitle="Stage-aware openers tied to the organizing ladder — for when you want more structure after the five beats above."
          />
          <CardShell className="mt-6">
            <p className="text-sm font-medium text-kelly-navy">Launch packet — coaching snapshot</p>
            <p className="mt-2 text-sm text-kelly-text/80">{model.powerOf5Launch.coreMessage}</p>
            <dl className="mt-4 grid gap-3 text-sm text-kelly-text/75 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-kelly-text/50">Assignment idea</dt>
                <dd className="mt-1">{model.powerOf5Launch.assignmentSuggestion}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-kelly-text/50">Timing idea</dt>
                <dd className="mt-1">{model.powerOf5Launch.timingSuggestion}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-kelly-text/50">Aggregate goal</dt>
                <dd className="mt-1">{model.powerOf5Launch.kpiTarget}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-kelly-text/50">Debrief question</dt>
                <dd className="mt-1">{model.powerOf5Launch.feedbackQuestion}</dd>
              </div>
            </dl>
          </CardShell>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {model.powerOf5ConversationPrompts.map((row) => (
              <CardShell key={row.title}>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-kelly-text/45">{row.stage}</p>
                <h3 className="font-heading mt-1 text-base font-bold text-kelly-navy">{row.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-kelly-text/80">{row.prompt}</p>
              </CardShell>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="vol-packets-heading">
        <ContentContainer wide>
          <SectionHeading
            id="vol-packets-heading"
            align="left"
            eyebrow="Shareables"
            title="Volunteer share packets"
            subtitle="DM, gathering, and quick social sparks — personalize or discard what doesn’t fit."
          />
          <div className="mt-6 space-y-10">
            {model.volunteerSharePackets.map((packet) => (
              <div key={packet.title}>
                <h3 className="font-heading text-lg font-bold text-kelly-navy">{packet.title}</h3>
                <p className="mt-1 text-sm text-kelly-text/75">{packet.intro}</p>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <CardShell>
                    <p className="text-xs font-bold uppercase tracking-wide text-kelly-text/50">Checklist</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-kelly-text/80">
                      {packet.checklist.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </CardShell>
                  <CardShell>
                    <p className="text-xs font-bold uppercase tracking-wide text-kelly-text/50">Copy block</p>
                    <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-kelly-text/10 bg-white/80 p-3 font-body text-xs leading-relaxed text-kelly-text/85">
                      {packet.copyBlock}
                    </pre>
                  </CardShell>
                </div>
              </div>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="listening-heading">
        <ContentContainer wide>
          <SectionHeading
            id="listening-heading"
            align="left"
            eyebrow="Field practice"
            title="Listening prompts"
            subtitle="Two-way conversations — pair with election listening sessions when you host or table."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {model.listeningPrompts.map((row) => (
              <CardShell key={row.title}>
                <h3 className="font-heading text-base font-bold text-kelly-navy">{row.title}</h3>
                <p className="mt-2 text-sm text-kelly-text/85">{row.prompt}</p>
                <p className="mt-3 text-xs text-kelly-text/65">{row.reminder}</p>
              </CardShell>
            ))}
          </div>
          <p className="mt-6 text-sm text-kelly-text/70">
            Formal listening program:{" "}
            <Link href="/listening-sessions" className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")}>
              Election listening sessions
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="bring-five-heading">
        <ContentContainer wide>
          <CardShell className="border-kelly-gold/35 bg-gradient-to-br from-kelly-gold/10 to-transparent">
            <SectionHeading
              id="bring-five-heading"
              align="left"
              eyebrow="Next step"
              title={model.bringFiveCta.title}
              subtitle={model.bringFiveCta.body}
            />
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                href={model.bringFiveCta.primaryHref}
                className={cn(
                  focusRing,
                  tapMinSmCompact,
                  "inline-flex justify-center rounded-lg bg-kelly-navy px-4 text-sm font-bold text-white hover:bg-kelly-navy/90 sm:py-2.5",
                )}
              >
                {model.bringFiveCta.primaryLabel}
              </Link>
              <Link
                href={model.bringFiveCta.secondaryHref}
                className={cn(
                  focusRing,
                  tapMinSmCompact,
                  "inline-flex justify-center rounded-lg border-2 border-kelly-navy/25 bg-white px-4 text-sm font-bold text-kelly-navy hover:border-kelly-navy/40 sm:py-2.5",
                )}
              >
                {model.bringFiveCta.secondaryLabel}
              </Link>
              <Link
                href="/get-involved"
                className={cn(focusRing, "inline-flex items-center rounded-sm py-2 text-sm font-semibold text-kelly-navy underline sm:py-0")}
              >
                Get involved
              </Link>
              <Link
                href="/events"
                className={cn(focusRing, "inline-flex items-center rounded-sm py-2 text-sm font-semibold text-kelly-navy underline sm:py-0")}
              >
                Browse events
              </Link>
            </div>
          </CardShell>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
