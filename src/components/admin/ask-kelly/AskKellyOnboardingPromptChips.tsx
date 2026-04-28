"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_PROMPTS = [
  "Where do I edit website copy?",
  "Show me where beta feedback lives.",
  "Explain the double-confirm update process.",
  "What happens if my internet drops?",
  "Where should I start?",
  "Who has final say?",
  "What does Send to database do?",
  "Where do I recover a draft?",
  "Why can't staff publish changes?",
] as const;

export type AskKellyOnboardingPromptChipsProps = {
  className?: string;
  /** When set, replaces the default prompt list (e.g. portal onboarding). */
  prompts?: readonly string[];
  heading?: string;
  intro?: ReactNode;
};

/**
 * Suggested questions to paste into the public site guide (Ask Kelly dock) or ask staff.
 */
export function AskKellyOnboardingPromptChips({
  className,
  prompts = DEFAULT_PROMPTS,
  heading = "Try asking in the site guide",
  intro = (
    <>
      Open <strong className="text-kelly-text">Ask Kelly</strong> on the public site (bottom-right), then paste a line
      below—or use them in conversation with staff. The guide covers routing and process, not donor or voter files.
    </>
  ),
}: AskKellyOnboardingPromptChipsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <section aria-labelledby="ask-kelly-prompt-chips-heading" className={cn("space-y-3", className)}>
      <h2 id="ask-kelly-prompt-chips-heading" className="font-heading text-lg font-bold text-kelly-navy">
        {heading}
      </h2>
      <p className="font-body text-sm text-kelly-text/80">{intro}</p>
      <ul className="flex flex-wrap gap-2">
        {prompts.map((text, idx) => (
          <li key={`${idx}-${text.slice(0, 24)}`}>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(text);
                  setCopied(text);
                  window.setTimeout(() => setCopied((c) => (c === text ? null : c)), 2000);
                } catch {
                  setCopied(null);
                }
              }}
              className={cn(
                "rounded-full border border-kelly-navy/20 bg-kelly-fog/60 px-3 py-1.5 text-left font-body text-xs font-semibold text-kelly-navy transition",
                "hover:border-kelly-gold/50 hover:bg-kelly-fog",
                copied === text && "border-kelly-gold/60 bg-kelly-gold/15",
              )}
            >
              {copied === text ? "Copied — paste in Ask Kelly" : text}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
