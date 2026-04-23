import { FramedTrailPhoto } from "@/components/media/FramedTrailPhoto";
import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { cn } from "@/lib/utils";

type TrailPhotosWovenGridProps = {
  photos: CampaignTrailPhoto[];
  /** First cells load with priority */
  priorityFirst?: number;
  className?: string;
};

/**
 * Asymmetric bento layout — breaks the uniform “wall of same-size cards” rhythm.
 */
export function TrailPhotosWovenGrid({ photos, priorityFirst = 2, className }: TrailPhotosWovenGridProps) {
  const [a, b, c, d, e, f, g, h] = photos.slice(0, 8);
  const tail = photos.slice(8);
  if (!a) return null;

  return (
    <>
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-4 lg:gap-5", className)}>
      {a ? (
        <div className="md:col-span-8 md:row-span-2">
          <FramedTrailPhoto photo={a} density="compact" priority={priorityFirst > 0} />
        </div>
      ) : null}
      {b ? (
        <div className="md:col-span-4">
          <FramedTrailPhoto photo={b} density="compact" priority={priorityFirst > 1} />
        </div>
      ) : null}
      {c ? (
        <div className="md:col-span-4">
          <FramedTrailPhoto photo={c} density="compact" />
        </div>
      ) : null}
      {d ? (
        <div className="md:col-span-4">
          <FramedTrailPhoto photo={d} density="compact" />
        </div>
      ) : null}
      {e ? (
        <div className="md:col-span-4">
          <FramedTrailPhoto photo={e} density="compact" />
        </div>
      ) : null}
      {f ? (
        <div className="md:col-span-4">
          <FramedTrailPhoto photo={f} density="compact" />
        </div>
      ) : null}
      {g ? (
        <div className="md:col-span-6">
          <FramedTrailPhoto photo={g} density="compact" />
        </div>
      ) : null}
      {h ? (
        <div className="md:col-span-6">
          <FramedTrailPhoto photo={h} density="compact" />
        </div>
      ) : null}
    </div>
    {tail.length > 0 ? (
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {tail.map((p) => (
          <FramedTrailPhoto key={p.id} photo={p} density="compact" />
        ))}
      </div>
    ) : null}
    </>
  );
}
