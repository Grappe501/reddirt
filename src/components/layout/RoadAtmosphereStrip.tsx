import Image from "next/image";
import Link from "next/link";
import { isThePlanPath } from "@/config/campaign-brand";
import { getRoadMosaicForPathname } from "@/lib/road-mosaic/pick-page-visuals";

function isExternalSrc(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

type Props = {
  pathname: string;
};

/**
 * Sitewide “moving across Arkansas” image band. Sources: approved public `OwnedMediaAsset`
 * images, Substack road posts with art, or brand placeholders. Selection uses OpenAI (captions
 * only) when `OPENAI_API_KEY` is set, else a stable hash of the path.
 */
export async function RoadAtmosphereStrip({ pathname }: Props) {
  const visuals = await getRoadMosaicForPathname(pathname);
  const plan = isThePlanPath(pathname);

  return (
    <section
      className={
        plan
          ? "relative z-0 border-b border-civic-gold/25 bg-gradient-to-r from-civic-midnight/15 via-civic-blue/10 to-civic-midnight/20"
          : "relative z-0 border-b border-red-dirt/20 bg-gradient-to-r from-cream-canvas via-cream-canvas to-washed-denim/15"
      }
      aria-label="Campaign photography for this page"
    >
      <div
        className={
          plan
            ? "absolute inset-0 pointer-events-none bg-gradient-to-b from-civic-blue/20 via-civic-midnight/5 to-civic-midnight/10"
            : "absolute inset-0 pointer-events-none bg-gradient-to-b from-red-dirt/10 via-transparent to-red-dirt/5"
        }
      />
      <div
        className={
          plan
            ? "relative mx-auto flex w-full max-w-content gap-0 overflow-hidden sm:grid sm:min-h-[140px] sm:grid-cols-3 sm:items-stretch"
            : "relative mx-auto flex w-full max-w-content gap-0 overflow-hidden sm:grid sm:min-h-[120px] sm:grid-cols-3 sm:items-stretch"
        }
      >
        {visuals.map((v, i) => (
          <div
            key={`${v.id}-${i}`}
            className={
              plan
                ? "relative aspect-[21/6] min-h-[80px] flex-1 border-l border-civic-gold/15 first:border-l-0 sm:aspect-auto sm:min-h-[140px]"
                : "relative aspect-[21/6] min-h-[72px] flex-1 border-l border-red-dirt/10 first:border-l-0 sm:aspect-auto sm:min-h-[120px]"
            }
          >
            <Image
              src={v.src}
              alt={v.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 34vw"
              unoptimized={isExternalSrc(v.src)}
            />
            <div
              className={
                plan
                  ? "absolute inset-0 bg-gradient-to-t from-civic-midnight/50 via-civic-blue/10 to-transparent"
                  : "absolute inset-0 bg-gradient-to-t from-deep-soil/40 via-red-dirt/10 to-transparent"
              }
            />
          </div>
        ))}
      </div>
      <div
        className={
          plan
            ? "relative border-t border-civic-gold/25 bg-civic-midnight px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-civic-mist/90"
            : "relative border-t border-red-dirt/15 bg-deep-soil/90 px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-canvas/80"
        }
      >
        <span className={plan ? "text-sunlight-gold" : "text-sunlight-gold/95"}>
          {plan ? "The plan · ideas that move Arkansas" : "On the road in Arkansas"}
        </span>
        <span className="mx-2 text-cream-canvas/30">·</span>
        <Link
          href={plan ? "/priorities" : "/from-the-road"}
          className={
            plan
              ? "text-civic-mist/85 underline-offset-2 hover:text-sunlight-gold hover:underline"
              : "text-cream-canvas/80 underline-offset-2 hover:text-cream-canvas hover:underline"
          }
        >
          {plan ? "See priorities" : "See the field journal"}
        </Link>
      </div>
    </section>
  );
}
