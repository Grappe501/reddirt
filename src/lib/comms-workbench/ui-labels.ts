/**
 * Human-friendly labels for **non-status** fields (objectives, channels, priorities, tactics, source kinds, etc.).
 * For plan, draft, variant, and send **status** chips, use `getPlanStatusDisplay` / `CommsStatusBadge` from
 * `@/lib/comms-workbench/status-display` so copy and color stay consistent.
 */
export function formatCommsFieldLabel(s: string): string {
  return s.replace(/_/g, " ");
}
