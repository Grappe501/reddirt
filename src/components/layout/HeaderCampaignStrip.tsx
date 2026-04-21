"use client";

import Image from "next/image";
import { campaignHeaderStrip } from "@/config/campaign-brand";

function isExternalSrc(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

/**
 * Full-width triptych under the system chrome — same campaign world as the road band below.
 * Swap `campaignHeaderStrip` in `config/campaign-brand.ts` to point at `/media/campaign/*` when files land.
 */
export function HeaderCampaignStrip() {
  return (
    <div
      className="relative w-full border-b border-civic-gold/25 bg-civic-midnight"
      aria-hidden
    >
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-civic-midnight/20 via-transparent to-civic-midnight/50" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-civic-blue/40 via-transparent to-civic-midnight/30" />
      <div className="relative z-0 grid w-full min-h-[72px] grid-cols-3 sm:min-h-[88px] lg:min-h-[100px]">
        {campaignHeaderStrip.map((slot, i) => (
          <div key={slot.id} className="relative min-h-[72px] border-l border-civic-gold/10 first:border-l-0 sm:min-h-[88px] lg:min-h-[100px]">
            <Image
              src={slot.src}
              alt={slot.alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 34vw, 33vw"
              priority={i === 0}
              unoptimized={isExternalSrc(slot.src)}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-civic-midnight/60 via-civic-midnight/5 to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
}
