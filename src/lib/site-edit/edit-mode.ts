export const SITE_EDIT_COOKIE = "reddirt_site_edit";

/**
 * Public-site inline edit mode is off.
 * The live marketing site must not show an editor or accept public copy/media writes.
 * Page copy still goes through /admin after login.
 */
export async function canUseSiteEditMode(): Promise<boolean> {
  return false;
}

export async function isSiteEditMode(): Promise<boolean> {
  return false;
}
