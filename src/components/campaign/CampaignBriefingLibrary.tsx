import Link from "next/link";
import { OwnedMediaKind } from "@prisma/client";
import { listPublicCampaignBriefings } from "@/lib/campaign-briefings/briefing-queries";
import { SectionHeading } from "@/components/blocks/SectionHeading";

const card =
  "rounded-2xl border border-deep-soil/10 bg-cream-canvas p-5 shadow-sm transition hover:border-red-dirt/20";

/**
 * Public “record room” for approved campaign files (briefings, comms, logos) for Secretary of
 * State transparency. Nothing renders until at least one file is public + approved + tagged.
 */
export async function CampaignBriefingLibrary() {
  const docs = await listPublicCampaignBriefings();
  if (docs.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="briefing-records">
      <SectionHeading
        id="briefing-records"
        align="left"
        eyebrow="Secretary of State campaign"
        title="Record room: campaign file library"
        subtitle="Briefings, communications, and approved brand assets are filed here the same way we want state records treated—clear, dated, and available when we say they are public."
      />
      <ul className="mt-6 grid list-none gap-4 sm:grid-cols-1 lg:grid-cols-2" role="list">
        {docs.map((d) => {
          const isImage = d.kind === OwnedMediaKind.IMAGE;
          const isVideo = d.kind === OwnedMediaKind.VIDEO;
          return (
            <li key={d.id} className={card}>
              <p className="font-heading text-base font-bold text-deep-soil">{d.title}</p>
              {isImage ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-deep-soil/10 bg-washed-canvas">
                  <img
                    src={d.downloadHref}
                    alt=""
                    className="max-h-48 w-full object-contain"
                    width={800}
                    height={320}
                    loading="lazy"
                  />
                </div>
              ) : null}
              {isVideo ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-deep-soil/10 bg-washed-canvas p-2">
                  <video
                    src={d.downloadHref}
                    className="max-h-48 w-full"
                    controls
                    preload="metadata"
                  />
                </div>
              ) : null}
              {d.description ? (
                <p className="mt-2 text-sm text-deep-soil/80">{d.description}</p>
              ) : null}
              <p className="mt-1 text-xs text-deep-soil/55">
                {d.fileName} ·{" "}
                {isImage ? "image" : isVideo ? "video" : d.kind === OwnedMediaKind.AUDIO ? "audio" : "document"}{" "}
                · added {d.createdAt.toLocaleDateString()}
              </p>
              <a
                href={d.downloadHref}
                className="mt-3 inline-block text-sm font-semibold text-red-dirt underline-offset-2 hover:underline"
              >
                Download
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-deep-soil/55">
        The Secretary of State’s office is built on <strong>records and public trust</strong>—our site mirrors
        that habit: if we brief it, it belongs in the record where Arkansans can see it. More materials will appear
        as they’re reviewed. Nothing here replaces a government filing; this is the campaign’s working library.
      </p>
      <p className="mt-2 text-xs text-deep-soil/50">
        <Link href="/voter-registration" className="text-red-dirt/80 underline-offset-2 hover:underline">
          Voter registration center
        </Link>{" "}
        for rolls and help ·{" "}
        <Link href="/priorities" className="text-red-dirt/80 underline-offset-2 hover:underline">
          Office priorities
        </Link>{" "}
        for the platform.
      </p>
    </section>
  );
}
