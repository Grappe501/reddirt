import type { ReactNode } from "react";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";

type EventDetailHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
};

/** Full-bleed Kelly campaign still behind every public event detail header. */
export async function EventDetailHero({ eyebrow, title, subtitle, children }: EventDetailHeroProps) {
  return (
    <MediaPageHero slotKey="events.detail.hero" layout="bleed" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      {children}
    </MediaPageHero>
  );
}
