/**
 * Server wrapper — builds finder index at request time. Do not add "use client" here.
 * Client UI lives in V4DebatePrepFinderClient.tsx (no node:fs imports).
 */
import { buildDebatePrepFinderIndex } from "@/lib/intelligence/v4/debatePrepFinder";
import { V4DebatePrepFinderClient } from "@/components/admin/intelligence/v4/V4DebatePrepFinderClient";

export function V4DebatePrepFinder({
  compact = false,
  placeholder,
}: {
  compact?: boolean;
  placeholder?: string;
}) {
  const entries = buildDebatePrepFinderIndex();
  return <V4DebatePrepFinderClient entries={entries} compact={compact} placeholder={placeholder} />;
}
