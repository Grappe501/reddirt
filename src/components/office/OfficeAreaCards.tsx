import Link from "next/link";
import { OFFICE_AREA_SLUGS, officeUnderstandTeasers } from "@/content/office/office-three-layer";

/**
 * Layer 1 entry cards — used on /understand (no Layer 2/3 links here).
 */
export function OfficeAreaCards() {
  return (
    <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
      {OFFICE_AREA_SLUGS.map((slug) => {
        const card = officeUnderstandTeasers[slug];
        return (
          <Link
            key={slug}
            href={card.href}
            className="group relative flex flex-col rounded-2xl border border-kelly-navy/10 bg-white/80 p-5 shadow-[0_8px_30px_rgba(26,42,74,0.06)] transition duration-normal motion-reduce:transition-none hover:border-kelly-gold/35 hover:shadow-[0_12px_36px_rgba(26,42,74,0.1)] sm:p-6 md:p-7"
          >
            <h3 className="font-heading text-xl font-bold text-kelly-navy md:text-[1.35rem]">{card.headline}</h3>
            <p className="mt-3 flex-1 font-body text-base leading-relaxed text-kelly-text/85">{card.blurb}</p>
            <span className="mt-5 inline-flex min-h-[44px] items-center gap-1 font-body text-sm font-semibold text-kelly-navy underline-offset-4 group-hover:underline">
              Understand the basics
              <span
                aria-hidden
                className="transition motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 group-hover:translate-x-0.5"
              >
                →
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
