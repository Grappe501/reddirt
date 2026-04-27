"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
};

/** Fixed copy only — never surface raw API bodies or env names. */
const MSG_UNCONFIGURED =
  "Voice assist isn’t set up for this environment yet. The rest of this page works normally—you can read everything on screen.";
const MSG_UNAVAILABLE = "Voice assist is unavailable right now. Nothing else changed.";
const MSG_AUTH = "Your session may have expired. Refresh the page and try again if you still want audio.";

export function AskKellyReadAloudButton({ text, className }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const lastUrl = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const revoke = useCallback(() => {
    if (lastUrl.current) {
      try {
        URL.revokeObjectURL(lastUrl.current);
      } catch {
        /* ignore */
      }
      lastUrl.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current = null;
      } catch {
        /* ignore */
      }
    }
  }, []);

  const onClick = useCallback(async () => {
    if (!text.trim()) return;
    revoke();
    setErrorText(null);
    setState("loading");
    try {
      const res = await fetch("/api/ask-kelly/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 1200) }),
        credentials: "same-origin",
      });

      if (res.status === 401) {
        setErrorText(MSG_AUTH);
        setState("error");
        return;
      }

      if (res.status === 503) {
        setErrorText(MSG_UNCONFIGURED);
        setState("error");
        return;
      }

      const ct = (res.headers.get("Content-Type") ?? "").toLowerCase();
      if (res.ok && ct.includes("audio")) {
        let blob: Blob;
        try {
          blob = await res.blob();
        } catch {
          setErrorText(MSG_UNAVAILABLE);
          setState("error");
          return;
        }
        if (!blob.size) {
          setErrorText(MSG_UNAVAILABLE);
          setState("error");
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        lastUrl.current = objectUrl;
        const audio = new Audio(objectUrl);
        audioRef.current = audio;
        const onEnded = () => {
          setState("idle");
          setErrorText(null);
          revoke();
        };
        const onAudioErr = () => {
          setErrorText(MSG_UNAVAILABLE);
          setState("error");
          revoke();
        };
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onAudioErr);
        try {
          await audio.play();
        } catch {
          setErrorText(MSG_UNAVAILABLE);
          setState("error");
          revoke();
          return;
        }
        setState("idle");
        return;
      }

      setErrorText(MSG_UNAVAILABLE);
      setState("error");
    } catch {
      setErrorText(MSG_UNAVAILABLE);
      setState("error");
    }
  }, [revoke, text]);

  const preparing = state === "loading";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <button
        type="button"
        onClick={() => {
          void onClick();
        }}
        disabled={preparing || !text.trim()}
        className="inline-flex w-fit items-center justify-center rounded-md border border-kelly-navy/30 bg-kelly-navy px-3.5 py-2 font-body text-sm font-bold text-kelly-page transition hover:bg-kelly-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {preparing ? "Preparing voice…" : "Read this aloud"}
      </button>
      {state === "error" && errorText ? (
        <p className="max-w-prose font-body text-xs text-kelly-text/80" role="status">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
