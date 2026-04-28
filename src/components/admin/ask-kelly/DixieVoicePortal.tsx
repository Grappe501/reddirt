"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const WAKE = /\bdixie\b/i;
const SUBMIT = /\bgo\b/i;

/** Minimal typings — `lib.dom` may omit Web Speech handler event types depending on TS config. */
interface DixieSpeechRecognitionAlternative {
  transcript?: string;
}
interface DixieSpeechRecognitionResult {
  readonly isFinal: boolean;
  [index: number]: DixieSpeechRecognitionAlternative | undefined;
}
interface DixieSpeechRecognitionResultList {
  length: number;
  [index: number]: DixieSpeechRecognitionResult | undefined;
}
interface DixieSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: DixieSpeechRecognitionResultList;
}
interface DixieSpeechRecognitionErrorEvent extends Event {
  error: string;
}

type DixiePhase = "off" | "awaiting_wake" | "capturing" | "unsupported";

type SpeechRecCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((ev: DixieSpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: DixieSpeechRecognitionErrorEvent) => void) | null;
};

function getSpeechRecognitionCtor(): SpeechRecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecCtor;
    webkitSpeechRecognition?: SpeechRecCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type ParsedTranscript =
  | { kind: "no_wake" }
  | { kind: "need_submit" }
  | { kind: "complete"; command: string };

function parseTranscript(full: string): ParsedTranscript {
  const dixieM = WAKE.exec(full);
  if (!dixieM) return { kind: "no_wake" };
  const tail = full.slice(dixieM.index + dixieM[0].length);
  const goM = SUBMIT.exec(tail);
  if (!goM) return { kind: "need_submit" };
  return { kind: "complete", command: tail.slice(0, goM.index).trim() };
}

const PRIVACY_LINES = [
  "Voice input starts only after you enable it.",
  "Dixie listens for the wake word in this browser session after you turn the portal on—nothing records until then.",
  "Nothing is published from voice alone.",
] as const;

/**
 * Opt-in speech-to-text: wake word (“Dixie”), spoken request, end with “go”.
 * Fills local review text only — never submits to editors, APIs, or live content.
 */
export function DixieVoicePortal() {
  const ctorRef = useRef<SpeechRecCtor | null>(null);
  const [hydrated, setHydrated] = useState(false);
  /** null until mounted — avoids false “unsupported” before ctor is detected */
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<DixiePhase>("off");
  const [reviewText, setReviewText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const recRef = useRef<InstanceType<SpeechRecCtor> | null>(null);
  const finalizedRef = useRef("");
  const shouldListenRef = useRef(false);

  useEffect(() => {
    ctorRef.current = getSpeechRecognitionCtor();
    setSpeechSupported(!!ctorRef.current);
    if (!ctorRef.current) setPhase("unsupported");
    setHydrated(true);
  }, []);

  const stopRecognitionSilently = useCallback(() => {
    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    finalizedRef.current = "";
  }, []);

  const teardownPortal = useCallback(() => {
    shouldListenRef.current = false;
    stopRecognitionSilently();
    setPhase(ctorRef.current ? "off" : "unsupported");
  }, [stopRecognitionSilently]);

  const runRecognitionCycle = useCallback(() => {
    const Ctor = ctorRef.current;
    if (!Ctor || !shouldListenRef.current) return;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onresult = (event: DixieSpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]!;
        const chunk = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalizedRef.current += chunk;
        } else {
          interim += chunk;
        }
      }
      const raw = `${finalizedRef.current}${interim}`.replace(/\s+/g, " ").trim();
      const parsed = parseTranscript(raw);

      if (parsed.kind === "need_submit") {
        setPhase("capturing");
        return;
      }

      if (parsed.kind === "no_wake") {
        setPhase("awaiting_wake");
        return;
      }

      /* complete */
      setReviewText(parsed.command);
      setToast(
        "Captured in the review box. Copy it into Ask Kelly on the public site when you are ready.",
      );
      setPhase("awaiting_wake");
      finalizedRef.current = "";
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    };

    rec.onerror = (ev: DixieSpeechRecognitionErrorEvent) => {
      if (ev.error === "not-allowed") {
        setToast("Microphone access was blocked. Voice input stays off until the browser allows it.");
      } else if (ev.error !== "aborted" && ev.error !== "no-speech") {
        setToast(`Voice input paused (${ev.error}). You can enable again or type instead.`);
      }
    };

    rec.onend = () => {
      recRef.current = null;
      if (!shouldListenRef.current || !ctorRef.current) return;
      queueMicrotask(() => runRecognitionCycle());
    };

    recRef.current = rec;
    try {
      rec.start();
      setPhase("awaiting_wake");
    } catch {
      setToast("Could not start voice input. Try again or type your question.");
      shouldListenRef.current = false;
      setPhase("off");
    }
  }, []);

  const enable = useCallback(() => {
    if (!ctorRef.current) {
      setPhase("unsupported");
      return;
    }
    setToast(null);
    shouldListenRef.current = true;
    finalizedRef.current = "";
    runRecognitionCycle();
  }, [runRecognitionCycle]);

  const disable = useCallback(() => {
    teardownPortal();
  }, [teardownPortal]);

  useEffect(() => () => teardownPortal(), [teardownPortal]);

  if (!hydrated || speechSupported === null) {
    return (
      <div className="mt-8 rounded-xl border border-kelly-text/12 bg-kelly-fog/30 p-5">
        <p className="font-body text-sm text-kelly-text/70">Loading voice options…</p>
      </div>
    );
  }

  if (phase === "unsupported" || !speechSupported) {
    return (
      <div className="mt-8 rounded-xl border border-kelly-text/15 bg-kelly-fog/40 p-5">
        <h3 className="font-heading text-base font-bold text-kelly-navy">Dixie voice portal</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          Voice input is not available in this browser. Typing still works—in the public site guide or here in admin.
        </p>
      </div>
    );
  }

  const capturing = phase === "capturing";

  return (
    <div className="mt-8 rounded-xl border border-kelly-navy/18 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <h3 className="font-heading text-base font-bold text-kelly-navy">Dixie voice portal</h3>
      <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">
        Optional speech capture for drafting a question. Say the wake word, speak your request, then say{" "}
        <span className="font-semibold text-kelly-ink">go</span> to place the text in the review box below. This does
        not send anything to the site guide or the page editor—it is for your review only.
      </p>

      <ul className="mt-4 list-disc space-y-1.5 pl-5 font-body text-xs leading-relaxed text-kelly-text/75">
        {PRIVACY_LINES.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {toast ? (
        <p
          className="mt-4 rounded-md border border-kelly-gold/40 bg-kelly-gold/10 px-3 py-2 font-body text-sm text-kelly-ink"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {phase === "off" ? (
          <button
            type="button"
            className="rounded-md border border-kelly-navy/30 bg-kelly-navy px-4 py-2.5 font-body text-sm font-bold text-white transition hover:bg-kelly-navy/90"
            onClick={enable}
          >
            Enable Dixie voice portal
          </button>
        ) : (
          <button
            type="button"
            className="rounded-md border border-kelly-text/25 bg-transparent px-4 py-2.5 font-body text-sm font-semibold text-kelly-navy transition hover:border-kelly-gold/40"
            onClick={disable}
          >
            Turn off voice portal
          </button>
        )}
        <span
          className={cn("font-body text-sm font-medium", capturing ? "text-kelly-navy" : "text-kelly-text/65")}
          aria-live="polite"
        >
          {phase === "off"
            ? "Voice portal is off."
            : capturing
              ? "Dixie is listening…"
              : "Listening for the wake word…"}
        </span>
      </div>

      <div className="mt-6">
        <label
          htmlFor="dixie-voice-review"
          className="font-body text-xs font-semibold uppercase tracking-wide text-kelly-text/60"
        >
          Review (copy into Ask Kelly)
        </label>
        <textarea
          id="dixie-voice-review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          className="mt-2 w-full resize-y rounded-md border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm text-kelly-ink shadow-inner outline-none ring-kelly-navy/25 focus:border-kelly-navy/40 focus:ring-2"
          placeholder="Spoken text appears here after you say the wake word and end with “go.” Edit before you copy."
        />
        <p className="mt-2 font-body text-xs text-kelly-text/60">
          Open the public site, use Ask Kelly in the corner, and paste this text if it matches what you want to ask.
        </p>
      </div>
    </div>
  );
}
