"use client";

import { useState } from "react";

import { CposCompanionYoutube } from "@/components/cpos/CposCompanionYoutube";
import { resolveCposKickoffYoutubeVideoId } from "@/config/cpos-kickoff-media";

type Props = {
  headline: string;
  subhead?: string;
  bullets: string[];
  zoomTips: string[];
  chatTemplate: string;
  youtubeVideoId?: string | null;
  videoStartAt?: string;
  timezone?: string;
  videoTitle?: string;
};

export function CposRollCallCompanion({
  headline,
  subhead,
  bullets,
  zoomTips,
  chatTemplate,
  youtubeVideoId,
  videoStartAt,
  timezone,
  videoTitle = "Kelly Grappe Campaign Kickoff",
}: Props) {
  const resolvedId = resolveCposKickoffYoutubeVideoId(youtubeVideoId);
  const [copied, setCopied] = useState(false);

  const copyChat = async () => {
    try {
      await navigator.clipboard.writeText(chatTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="cpos-roll-call">
      {resolvedId && (
        <CposCompanionYoutube
          videoId={resolvedId}
          title={videoTitle}
          videoStartAt={videoStartAt}
          timezone={timezone}
        />
      )}

      <div className="cpos-roll-call-stage">
        <p className="cpos-roll-call-badge">Networking hour · not a lecture</p>
        <h3 className="cpos-roll-call-headline">{headline}</h3>
        {subhead && <p className="cpos-roll-call-subhead">{subhead}</p>}

        <ul className="cpos-roll-call-list">
          {bullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <div className="cpos-roll-call-zoom">
          <p className="cpos-roll-call-zoom-title">Zoom layout (do this now)</p>
          <ul className="cpos-roll-call-zoom-list">
            {zoomTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="cpos-roll-call-chat">
          <p className="cpos-roll-call-chat-title">Your roll-call script — paste into Zoom chat</p>
          <pre className="cpos-roll-call-chat-pre">{chatTemplate}</pre>
          <button type="button" className="cpos-roll-call-copy" onClick={copyChat}>
            {copied ? "Copied!" : "Copy roll-call message"}
          </button>
        </div>

        {!resolvedId && (
          <p className="cpos-roll-call-missing-video">
            Opening video ID not configured — follow Kelly on Zoom; networking instructions above still apply.
          </p>
        )}
      </div>
    </div>
  );
}
