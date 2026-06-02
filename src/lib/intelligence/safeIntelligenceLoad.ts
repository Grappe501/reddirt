/**
 * Render-safe loaders for emergency launch — missing JSON must not crash admin routes.
 */
export function tryIntelligenceLoad<T>(label: string, fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (error) {
    console.error(`[intelligence-launch] ${label} failed`, error);
    return fallback;
  }
}

export async function tryIntelligenceLoadAsync<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[intelligence-launch] ${label} failed`, error);
    return fallback;
  }
}
