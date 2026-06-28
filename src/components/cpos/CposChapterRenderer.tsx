import { useState } from "react";

import type { MetricBeat, MeetingChapter, MeetingManifest, MeetingSegment } from "@/lib/cpos/schemas/meeting-manifest";
import { CposRollCallCompanion } from "@/components/cpos/CposRollCallCompanion";
import { buildDemoUrl } from "@/lib/cpos/demo-url";

type Props = {
  chapter: MeetingChapter;
  manifest: MeetingManifest;
  meetingId: string;
};

function metricByKey(manifest: MeetingManifest, keys: string[]): MetricBeat[] {
  const map = new Map(manifest.coreNumbers.map((m) => [m.key, m]));
  return keys.map((k) => map.get(k)).filter(Boolean) as MetricBeat[];
}

function SegmentBlock({
  segment,
  manifest,
  chapter,
  meetingId,
}: {
  segment: MeetingSegment;
  manifest: MeetingManifest;
  chapter: MeetingChapter;
  meetingId: string;
}) {
  const type = segment.type as string;

  if (type === "roll_call_companion") {
    const headline = typeof segment.headline === "string" ? segment.headline : "Roll call";
    const subhead = typeof segment.subhead === "string" ? segment.subhead : undefined;
    const bullets = Array.isArray(segment.bullets) ? (segment.bullets as string[]) : [];
    const zoomTips = Array.isArray(segment.zoomTips) ? (segment.zoomTips as string[]) : [];
    const chatTemplate = typeof segment.chatTemplate === "string" ? segment.chatTemplate : "";
    const youtubeVideoId =
      typeof segment.youtubeVideoId === "string"
        ? segment.youtubeVideoId
        : manifest.media?.openingVideo?.youtubeVideoId;
    const videoStartAt =
      typeof segment.videoStartAt === "string"
        ? segment.videoStartAt
        : chapter.scheduleStart;
    const timezone = manifest.schedule?.timezone ?? "America/Chicago";
    const videoTitle =
      typeof segment.videoTitle === "string" ? segment.videoTitle : manifest.title;

    return (
      <div className="cpos-segment">
        <CposRollCallCompanion
          headline={headline}
          subhead={subhead}
          bullets={bullets}
          zoomTips={zoomTips}
          chatTemplate={chatTemplate}
          youtubeVideoId={youtubeVideoId}
          videoStartAt={videoStartAt}
          timezone={timezone}
          videoTitle={videoTitle}
        />
      </div>
    );
  }

  if (type === "video") {
    const src = manifest.media?.openingVideo?.src;
    return (
      <div className="cpos-segment">
        {src ? (
          <video className="w-full rounded-lg" controls playsInline preload="metadata" src={src}>
            Opening video
          </video>
        ) : (
          <div className="cpos-video-placeholder">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Opening program</p>
            <p className="text-lg font-bold">Video plays on the main screen</p>
            <p className="text-sm text-white/60">Follow along here as chapters advance</p>
          </div>
        )}
      </div>
    );
  }

  if (type === "narrative" && typeof segment.body === "string") {
    return (
      <div className="cpos-segment cpos-narrative">
        <p>{segment.body}</p>
      </div>
    );
  }

  if (type === "login_reminder") {
    return (
      <div className="cpos-segment cpos-stay-flow">
        Signed in to Election Plan? If prompted, use the same login you used to join this page.
      </div>
    );
  }

  if (type === "countdown") {
    return (
      <div className="cpos-segment cpos-stay-flow">
        {typeof segment.label === "string" ? segment.label : "Program starting soon — stay with the meeting flow."}
      </div>
    );
  }

  if (type === "metric_animation" && Array.isArray(segment.metrics)) {
    const metrics = metricByKey(manifest, segment.metrics as string[]);
    return (
      <div className="cpos-segment">
        <div className="cpos-metrics-grid">
          {metrics.map((m) => (
            <div key={m.key} className="cpos-metric-card">
              <div className="cpos-metric-value">{m.value}</div>
              <div className="cpos-metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "metric_strip" && Array.isArray(segment.metrics)) {
    const metrics = metricByKey(manifest, segment.metrics as string[]);
    return (
      <div className="cpos-segment">
        <div className="cpos-metrics-grid">
          {metrics.map((m) => (
            <div key={m.key} className="cpos-metric-card">
              <div className="cpos-metric-value">{m.value}</div>
              <div className="cpos-metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "golden_circle") {
    return (
      <div className="cpos-segment cpos-golden-circle">
        {["why", "how", "what"].map((ring) => {
          const val = segment[ring];
          if (typeof val !== "string") return null;
          return (
            <div key={ring} className="cpos-golden-ring">
              <strong>{ring}</strong>
              <span>{val}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (type === "hashtag" && typeof segment.tag === "string") {
    return (
      <div className="cpos-segment">
        <span className="cpos-hashtag">{segment.tag}</span>
      </div>
    );
  }

  if (type === "demo_launcher" && typeof segment.demoRef === "string") {
    const demo = manifest.demos[segment.demoRef];
    if (!demo) return null;
    const href = buildDemoUrl(demo, meetingId, manifest.join.audiencePath);
    return (
      <div className="cpos-segment">
        <a className="cpos-demo-card is-primary" href={href} target="_blank" rel="noopener noreferrer">
          <strong>Open {demo.label}</strong>
          <span className="block text-sm opacity-75 mt-1">Guided demo — return here when done</span>
        </a>
      </div>
    );
  }

  if (type === "demo_cards") {
    const ids = chapter.secondaryDemoCards ?? [];
    return (
      <div className="cpos-segment">
        <div className="cpos-demo-grid">
          {ids.map((id) => {
            const demo = manifest.demos[id];
            if (!demo) return null;
            const href = buildDemoUrl(demo, meetingId, manifest.join.audiencePath);
            const isPlaceholder = demo.polishLevel === "placeholder";
            return (
              <a
                key={id}
                className="cpos-demo-card"
                href={isPlaceholder ? undefined : href}
                target={isPlaceholder ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-disabled={isPlaceholder}
                style={isPlaceholder ? { opacity: 0.6, pointerEvents: "none" } : undefined}
              >
                <strong>{demo.label}</strong>
                {isPlaceholder && <span className="block text-xs mt-1 opacity-70">Coming soon</span>}
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "closing_line" && chapter.closingLine) {
    return <div className="cpos-segment cpos-closing-line">{chapter.closingLine}</div>;
  }

  if (type === "interaction_stack") {
    return (
      <div className="cpos-segment">
        <CposPollStack chapter={chapter} manifest={manifest} />
      </div>
    );
  }

  return null;
}

function CposPollStack({ chapter, manifest }: { chapter: MeetingChapter; manifest: MeetingManifest }) {
  const interactionIds = chapter.interactions ?? [];
  const [selections, setSelections] = useState<Record<string, string>>({});

  return (
    <div>
      {interactionIds.map((id) => {
        const interaction = manifest.interactions[id];
        if (!interaction || interaction.type !== "poll") return null;
        return (
          <div key={id} className="mb-6">
            <p className="font-semibold text-white/90">{interaction.prompt}</p>
            {(interaction.options ?? []).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`cpos-poll-option ${selections[id] === opt.id ? "is-selected" : ""}`}
                onClick={() => setSelections((s) => ({ ...s, [id]: opt.id }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );
      })}
      <p className="text-xs text-white/50">Selections saved on this device for tonight — full intake wiring next.</p>
    </div>
  );
}


export function CposChapterRenderer({ chapter, manifest, meetingId }: Props) {
  return (
    <>
      {chapter.segments?.map((segment, i) => (
        <SegmentBlock
          key={`${chapter.id}-${i}`}
          segment={segment}
          manifest={manifest}
          chapter={chapter}
          meetingId={meetingId}
        />
      ))}
      {chapter.closingLine &&
        !chapter.segments?.some((s) => s.type === "closing_line") && (
          <div className="cpos-segment cpos-closing-line">{chapter.closingLine}</div>
        )}
    </>
  );
}
