import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  FileText,
  Handshake,
  Landmark,
  Monitor,
  Shield,
  Vote,
} from "lucide-react";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

const copy = trustFunnelHomeCopy.officeServes;

const iconMap = {
  vote: Vote,
  building: Building2,
  file: FileText,
  landmark: Landmark,
  shield: Shield,
  handshake: Handshake,
  monitor: Monitor,
  book: BookOpen,
} as const satisfies Record<(typeof copy.cards)[number]["icon"], LucideIcon>;

/** Eight-card strip — breadth of the SOS office with links to existing routes. */
export function TrustFunnelOfficeServesStrip() {
  return (
    <section
      className="border-t border-kelly-ink/10 bg-kelly-wash/50 py-section-y lg:py-section-y-lg"
      aria-labelledby="office-serves-heading"
    >
      <ContentContainer>
        <ScrollReveal yOffset={10} className="mx-auto max-w-3xl text-center">
          <h2 id="office-serves-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-lg text-kelly-slate">{copy.intro}</p>
        </ScrollReveal>

        <ul className="mt-12 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.cards.map((card, i) => {
            const Icon = iconMap[card.icon];
            return (
              <ScrollReveal key={card.id} delay={50 + i * 40} yOffset={12}>
                <li>
                  <Link
                    href={card.href}
                    className={cn(
                      "flex h-full min-h-[7.5rem] flex-col items-start gap-3 rounded-card border border-kelly-ink/10 bg-white p-5 shadow-sm",
                      "transition-[transform,box-shadow,border-color] duration-300 ease-out",
                      "hover:-translate-y-1 hover:border-kelly-gold/40 hover:shadow-[0_12px_36px_rgba(0,0,102,0.1)]",
                      "focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/45",
                    )}
                  >
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-kelly-gold/35 bg-kelly-gold/10 text-kelly-navy"
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="font-heading text-base font-bold leading-snug text-kelly-navy">
                      {card.label}
                    </span>
                  </Link>
                </li>
              </ScrollReveal>
            );
          })}
        </ul>
      </ContentContainer>
    </section>
  );
}
