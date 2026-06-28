"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fromZonedTime } from "date-fns-tz";

type YtPlayer = {
  playVideo: () => void;
  setVolume: (n: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  destroy: () => void;
};

type Props = {
  videoId: string;
  title: string;
  /** ISO local time in meeting timezone e.g. 2026-06-28T18:00:00 */
  videoStartAt?: string;
  timezone?: string;
};

function parseWallClockStart(isoLocal: string, timeZone: string): Date {
  return fromZonedTime(isoLocal, timeZone);
}

function loadYoutubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as Window & {
    YT?: { Player: new (el: HTMLElement, opts: Record<string, unknown>) => YtPlayer };
    onYouTubeIframeAPIReady?: () => void;
  };
  if (w.YT?.Player) return Promise.resolve();

  return new Promise((resolve) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);
    }
  });
}

export function CposCompanionYoutube({ videoId, title, videoStartAt, timezone = "America/Chicago" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [volume, setVolume] = useState(35);
  const [muted, setMuted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [secondsUntil, setSecondsUntil] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  const startAt = videoStartAt ? parseWallClockStart(videoStartAt, timezone) : null;

  useEffect(() => {
    if (!startAt) {
      setStarted(true);
      return;
    }
    const tick = () => {
      const diff = Math.ceil((startAt.getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setWaiting(false);
        setSecondsUntil(null);
        setStarted(true);
      } else {
        setWaiting(true);
        setSecondsUntil(diff);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startAt]);

  useEffect(() => {
    if (!started || !hostRef.current) return;
    let destroyed = false;

    loadYoutubeIframeApi().then(() => {
      if (destroyed || !hostRef.current) return;
      const w = window as Window & {
        YT?: { Player: new (el: HTMLElement, opts: Record<string, unknown>) => YtPlayer };
      };
      if (!w.YT?.Player) return;

      new w.YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: { target: YtPlayer }) => {
            const p = event.target;
            playerRef.current = p;
            p.setVolume(volume);
            setReady(true);
            p.playVideo();
          },
        },
      });
    });

    return () => {
      destroyed = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount player once when started flips
  }, [started, videoId]);

  const onVolume = useCallback((v: number) => {
    setVolume(v);
    if (playerRef.current) {
      playerRef.current.unMute();
      playerRef.current.setVolume(v);
      setMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  }, []);

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  return (
    <div className="cpos-companion-pip" aria-label={title}>
      <div className="cpos-companion-pip-label">Opening reel</div>
      <div className="cpos-companion-pip-frame">
        {waiting && secondsUntil !== null ? (
          <div className="cpos-companion-pip-wait">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Starts 6:00 PM</p>
            <p className="text-lg font-black tabular-nums">{formatCountdown(secondsUntil)}</p>
          </div>
        ) : (
          <div ref={hostRef} className="cpos-companion-pip-player" title={title} />
        )}
      </div>
      <div className="cpos-companion-pip-controls">
        <button type="button" className="cpos-companion-pip-mute" onClick={toggleMute} aria-pressed={muted}>
          {muted ? "Unmute" : "Mute"}
        </button>
        <label className="cpos-companion-pip-volume">
          <span className="sr-only">Video volume</span>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            disabled={!ready && !waiting}
            onChange={(e) => onVolume(Number(e.target.value))}
          />
        </label>
      </div>
      <p className="cpos-companion-pip-hint">Lower volume while Kelly speaks — raise for the reel.</p>
    </div>
  );
}
