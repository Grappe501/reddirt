import { TrailPhotosShowcase } from "@/components/campaign-trail/TrailPhotosShowcase";
import { campaignTrailPhotos } from "@/content/media/campaign-trail-photos";

const HOME_TRAIL_COUNT = 9;

export function HomeTrailPhotosBand() {
  const photos = campaignTrailPhotos.slice(0, HOME_TRAIL_COUNT);
  if (photos.length === 0) return null;

  return (
    <div className="border-b border-civic-ink/10 bg-gradient-to-b from-white via-civic-fog/40 to-civic-fog/20">
      <TrailPhotosShowcase
        variant="home"
        photos={photos}
        title="The movement, in real rooms"
        intro="Snapshots from counties and gatherings—proof the campaign shows up where Arkansas actually lives."
      />
    </div>
  );
}
