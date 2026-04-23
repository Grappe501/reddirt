/**
 * Public/admin-safe relative URLs to fetch bytes or preview — never return absolute disk paths to the client.
 */
export function ownedMediaFileUrl(ownedMediaId: string): string {
  return `/api/owned-campaign-media/${ownedMediaId}/file`;
}

export function ownedMediaPreviewUrl(ownedMediaId: string): string {
  return `/api/owned-campaign-media/${ownedMediaId}/preview`;
}
