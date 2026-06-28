export function buildDemoUrl(
  demo: { path: string; presentationQuery?: Record<string, string> },
  meetingId: string,
  returnPath: string,
): string {
  const params = new URLSearchParams({
    presentation: "true",
    cpos: "1",
    meetingSession: meetingId,
    returnTo: returnPath,
    ...(demo.presentationQuery ?? {}),
  });
  return `${demo.path}?${params.toString()}`;
}
