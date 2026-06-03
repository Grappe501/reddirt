/**
 * Sitewide Ask Kelly floating guide + admin AI command palette.
 * Off by default during debate week — set NEXT_PUBLIC_ASK_KELLY_UI_ENABLED=true to restore.
 */
export function isAskKellyUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ASK_KELLY_UI_ENABLED === "true";
}
