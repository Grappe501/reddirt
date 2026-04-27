import { TrailPhotosShowcase } from "@/components/campaign-trail/TrailPhotosShowcase";
import { trailPhotosForSlot } from "@/content/media/campaign-trail-assignments";

export function HomeTrailPhotosBand() {
  const photos = trailPhotosForSlot("home");
  if (photos.length === 0) return null;

  return (
    <div className="border-b border-kelly-ink/10 bg-gradient-to-b from-white via-kelly-fog/40 to-kelly-fog/20">
      <TrailPhotosShowcase
        variant="home"
        photos={photos}
        title="The movement, in real rooms"
        intro="Field photos from real counties and gatherings—not stock imagery."
      />
    </div>
  );
}
