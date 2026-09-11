/**
 * Public volunteer intake is the Electd embed on `/get-involved#volunteer`.
 * This flag only remains for older `/volunteer` deep links that used the native Prisma form.
 */
export function isNativeVolunteerFormEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_NATIVE_VOLUNTEER_FORM === "true";
}
