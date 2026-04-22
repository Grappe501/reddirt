import type { ReactNode } from "react";
import {
  CIRCULATING_DISCLAIMER,
  circulatingInitiatives2026,
} from "@/content/direct-democracy/circulating-initiatives";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function SubDetails({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details
      className={cn(
        "group/sub rounded-lg border border-deep-soil/10 bg-deep-soil/[0.02] open:bg-deep-soil/[0.04]",
        "open:border-deep-soil/18",
      )}
    >
      <summary className="cursor-pointer list-none px-3 py-2.5 font-heading text-sm font-bold text-deep-soil transition hover:text-red-dirt [&::-webkit-details-marker]:hidden">
        <span className="inline-flex w-full items-center justify-between gap-2">
          <span>{title}</span>
          <span className="text-[10px] font-normal text-deep-soil/45 group-open/sub:hidden">Open</span>
          <span className="hidden text-[10px] font-normal text-deep-soil/45 group-open/sub:inline">Close</span>
        </span>
      </summary>
      <div className="border-t border-deep-soil/8 px-3 pb-3 pt-0">
        <div className="pt-2 font-body text-sm leading-relaxed text-deep-soil/78">{children}</div>
      </div>
    </details>
  );
}

export function CirculatingInitiativesSection() {
  return (
    <FullBleedSection
      id="circulating-initiatives"
      variant="subtle"
      padY
      aria-labelledby="circulating-heading"
    >
      <ContentContainer>
        <SectionHeading
          id="circulating-heading"
          align="left"
          eyebrow="2026 field snapshot"
          title="Initiatives in the public conversation now"
          subtitle="Dense drill-downs: what each line of work would change, who tends to show up, and what a professional Secretary of State’s office would make easy to read—without this campaign replacing the state’s official filing system."
          className="max-w-4xl"
        />

        <p className="mt-6 max-w-4xl rounded-card border border-amber-700/20 bg-amber-50/80 p-4 font-body text-sm leading-relaxed text-deep-soil/85">
          {CIRCULATING_DISCLAIMER}
        </p>

        <div className="mt-10 space-y-3">
          {circulatingInitiatives2026.map((m) => (
            <details
              key={m.id}
              className="group overflow-hidden rounded-card border border-deep-soil/12 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)] open:ring-1 open:ring-red-dirt/15"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-2 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-lg font-bold leading-snug text-deep-soil sm:text-xl">{m.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-deep-soil/50">{m.format}</p>
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                  <span className="inline-flex w-fit items-center rounded-full border border-red-dirt/20 bg-red-dirt/8 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-dirt/95">
                    {m.category}
                  </span>
                  <span className="text-right text-xs font-medium leading-snug text-deep-soil/65 sm:max-w-[14rem]">
                    {m.statusLine}
                  </span>
                </div>
              </summary>

              <div className="space-y-3 border-t border-deep-soil/10 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                <p className="font-body text-sm leading-relaxed text-deep-soil/80 md:text-base">{m.summary}</p>

                <div className="grid gap-2">
                  <SubDetails title="Direct website (opens in a new tab)">
                    <p className="mb-3 text-deep-soil/70">
                      Public campaign, coalition, or tracking page—<strong>not</strong> a Secretary of State filing. Use
                      it to find events and statements; compare any claim to the Attorney General’s certified text.
                    </p>
                    <a
                      href={m.directWebsite.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block font-body text-sm font-semibold text-red-dirt underline decoration-red-dirt/25 underline-offset-2 transition hover:decoration-red-dirt"
                    >
                      {m.directWebsite.label}
                    </a>
                    <p className="mt-2 break-all font-mono text-[11px] leading-snug text-deep-soil/55">
                      {m.directWebsite.href}
                    </p>
                  </SubDetails>
                  <SubDetails title="What the measure is trying to do (plain language)">
                    {m.whatItWouldDo}
                  </SubDetails>
                  <SubDetails title="Coalition & field dynamics">{m.organizing}</SubDetails>
                  <SubDetails title="What a professional SOS office would make transparent">
                    {m.sosStewardship}
                  </SubDetails>
                  <SubDetails title="How to verify (AG, SOS, local clerks, press)">{m.verify}</SubDetails>
                </div>

                {m.externalLinks && m.externalLinks.length > 0 ? (
                  <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 border-t border-deep-soil/8 pt-3">
                    {m.externalLinks.map((l) => (
                      <li key={l.href}>
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-body text-sm font-semibold text-red-dirt underline decoration-red-dirt/25 underline-offset-2 transition hover:decoration-red-dirt"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </details>
          ))}
        </div>

        <div
          className="mt-12 max-w-2xl rounded-card border border-deep-soil/10 bg-cream-canvas/90 p-6 shadow-[var(--shadow-soft)] md:p-8"
          id="initiative-not-listed"
        >
          <h3 className="font-heading text-xl font-bold text-deep-soil">Working on a measure we don’t list yet?</h3>
          <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
            Ballot work moves fast. If you are a sponsor, treasurer, or volunteer lead on a petition that is not here—or
            if our snapshot is behind—send a short note. On the form, pick{" "}
            <strong>Ballot access &amp; initiatives</strong> and name your committee, county, and the best link to{" "}
            <strong>certified</strong> language or public events.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/get-involved#join" variant="primary">
              Get involved — message the team
            </Button>
            <Button href="/direct-democracy/ballot-initiative-process" variant="outline">
              Arkansas petition rules
            </Button>
          </div>
        </div>
      </ContentContainer>
    </FullBleedSection>
  );
}
