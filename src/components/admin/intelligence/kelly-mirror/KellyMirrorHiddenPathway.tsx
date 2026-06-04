import Link from "next/link";
import { KELLY_MIRROR_DEFAULT_TRIGGER_WORD } from "@/lib/intelligence/kellyAdversarialMirrorTypes";

/**
 * Invisible-style link: same color as body text, no underline, not in nav.
 * Candidate knows to look for the trigger word in hub copy.
 */
export function KellyMirrorHiddenPathway({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const word = KELLY_MIRROR_DEFAULT_TRIGGER_WORD;
  return (
    <Link
      href="/admin/intelligence/kelly-mirror"
      className={`text-inherit no-underline hover:text-inherit focus:outline-none ${className ?? ""}`}
      aria-label="County clerk reference"
    >
      {children ?? word}
    </Link>
  );
}
