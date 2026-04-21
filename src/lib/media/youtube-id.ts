/**
 * `InboundContentItem.externalId` for YouTube connector rows is `youtube:video:<id>`.
 */
export function youtubeVideoIdFromExternalId(externalId: string): string | null {
  const prefix = "youtube:video:";
  if (!externalId.startsWith(prefix)) return null;
  const id = externalId.slice(prefix.length).trim();
  return id.length >= 6 ? id : null;
}
