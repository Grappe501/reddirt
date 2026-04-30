"use client";

import Link from "next/link";
import { useState } from "react";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { voterRegistrationHref } from "@/config/navigation";
import { isExternalHref } from "@/lib/href";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

const roles = trustFunnelHomeCopy.roles;

type RoleKey = "vote" | "volunteer" | "stayConnected" | "donate";

const ORDER: RoleKey[] = ["vote", "volunteer", "stayConnected", "donate"];

export function TrustFunnelRolesSection({
  volunteerHref,
  donateHref,
  stayHref,
  blogUrl,
}: {
  volunteerHref: string;
  donateHref: string;
  stayHref: string;
  blogUrl: string;
}) {
  const volunteerExt = isExternalHref(volunteerHref);
  const donateExt = isExternalHref(donateHref);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      className="border-t border-kelly-ink/10 bg-kelly-fog/60 py-section-y lg:py-section-y-lg"
      aria-labelledby="roles-heading"
      onMouseLeave={() => setHovered(null)}
    >
      <ContentContainer>
        <ScrollReveal className="text-center">
          <h2 id="roles-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {roles.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-kelly-slate">{roles.intro}</p>
        </ScrollReveal>
        <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ORDER.map((key, i) => {
            const dim = hovered !== null && hovered !== i;
            const isDonate = key === "donate";

            return (
              <ScrollReveal key={key} delay={60 + i * 55} yOffset={12}>
                <li
                  className={cn(
                    "flex min-h-[13rem] flex-col rounded-card p-6 shadow-sm outline-none transition-[transform,opacity,box-shadow,border-color] duration-300 ease-out",
                    isDonate
                      ? "border border-kelly-ink/12 bg-white/90 ring-1 ring-kelly-ink/5"
                      : "border-2 border-kelly-ink/12 bg-white",
                    "hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,102,0.09)] focus-within:-translate-y-1 focus-within:shadow-[0_14px_40px_rgba(0,0,102,0.09)]",
                    dim && "opacity-[0.88] sm:opacity-90",
                    !dim && "opacity-100",
                    isDonate && "hover:border-kelly-ink/18",
                  )}
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                >
                  {key === "vote" ? (
                    <>
                      <h3 className="font-heading text-lg font-bold text-kelly-navy">{roles.cards.vote.title}</h3>
                      <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">{roles.cards.vote.body}</p>
                      <Link
                        href={voterRegistrationHref}
                        className="mt-4 min-h-11 text-sm font-bold uppercase tracking-wide text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 transition hover:decoration-kelly-blue"
                      >
                        {roles.cards.vote.linkLabel} →
                      </Link>
                    </>
                  ) : null}
                  {key === "volunteer" ? (
                    <>
                      <h3 className="font-heading text-lg font-bold text-kelly-navy">{roles.cards.volunteer.title}</h3>
                      <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">{roles.cards.volunteer.body}</p>
                      <Link
                        href={volunteerHref}
                        target={volunteerExt ? "_blank" : undefined}
                        rel={volunteerExt ? "noopener noreferrer" : undefined}
                        className="mt-4 min-h-11 text-sm font-bold uppercase tracking-wide text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 transition hover:decoration-kelly-blue"
                      >
                        {roles.cards.volunteer.linkLabel} →
                      </Link>
                    </>
                  ) : null}
                  {key === "stayConnected" ? (
                    <>
                      <h3 className="font-heading text-lg font-bold text-kelly-navy">{roles.cards.stayConnected.title}</h3>
                      <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">{roles.cards.stayConnected.body}</p>
                      <div className="mt-4 flex min-h-11 flex-col gap-2">
                        <Link
                          href={stayHref}
                          className="text-sm font-bold uppercase tracking-wide text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 transition hover:decoration-kelly-blue"
                        >
                          {roles.cards.stayConnected.linkLabelUpdates} →
                        </Link>
                        <a
                          href={blogUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-kelly-slate underline decoration-kelly-ink/15 underline-offset-4 transition hover:text-kelly-navy hover:decoration-kelly-navy/40"
                        >
                          {roles.cards.stayConnected.linkLabelBlog}
                        </a>
                      </div>
                    </>
                  ) : null}
                  {key === "donate" ? (
                    <>
                      <h3 className="font-heading text-lg font-bold text-kelly-navy">{roles.cards.donate.title}</h3>
                      <p className="mt-2 flex-1 font-body text-sm text-kelly-slate">{roles.cards.donate.body}</p>
                      <Link
                        href={donateHref}
                        target={donateExt ? "_blank" : undefined}
                        rel={donateExt ? "noopener noreferrer" : undefined}
                        className="mt-4 min-h-11 text-sm font-bold uppercase tracking-wide text-kelly-slate underline decoration-kelly-ink/20 underline-offset-4 transition hover:text-kelly-navy hover:decoration-kelly-navy/35"
                      >
                        {roles.cards.donate.linkLabel} →
                      </Link>
                    </>
                  ) : null}
                </li>
              </ScrollReveal>
            );
          })}
        </ul>
      </ContentContainer>
    </section>
  );
}
