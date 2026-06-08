type IntelPrepSearchOpenListener = () => void;

const listeners = new Set<IntelPrepSearchOpenListener>();

/** Subscribe to open requests from header buttons, Ctrl+K, etc. Returns unsubscribe. */
export function subscribeIntelPrepSearchOpen(listener: IntelPrepSearchOpenListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Open the primary intelligence prep search panel and focus the input. */
export function openIntelPrepSearch(): void {
  for (const listener of listeners) listener();
}
