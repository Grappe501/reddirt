/**
 * Volunteer intake routing — native RedDirt `/api/forms` vs legacy external Squarespace URL.
 *
 * Set `NEXT_PUBLIC_USE_NATIVE_VOLUNTEER_FORM=true` in Netlify / `.env` to keep signups on this site.
 * When false (default until launch env is set), CTAs use `NEXT_PUBLIC_VOLUNTEER_SIGNUP_EXTERNAL` or the
 * legacy campaign site URL from `campaign-links.ts`.
 */
export function isNativeVolunteerFormEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_NATIVE_VOLUNTEER_FORM === "true";
}
