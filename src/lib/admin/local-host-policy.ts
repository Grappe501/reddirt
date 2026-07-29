/**
 * Shared host helpers for local admin + evidence write gates.
 * Never trust client-controlled x-forwarded-host alone.
 */

export function parseRequestHostname(hostHeader: string | null): string {
  return (hostHeader ?? "").toLowerCase().split(":")[0].trim();
}

export function isLoopbackHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

/**
 * Local Campaign Manager bypass / local-write allow.
 * Requires Node development (or explicit ADMIN_LOCAL_WRITES outside production)
 * and the raw Host header on loopback — ignores spoofable x-forwarded-host.
 */
export function isTrustedLocalDevHost(opts: {
  hostHeader: string | null;
  nodeEnv?: string | undefined;
  requireAuthOnLocalhost?: boolean;
}): boolean {
  if (opts.requireAuthOnLocalhost) return false;
  const env = opts.nodeEnv ?? process.env.NODE_ENV;
  if (env === "production") return false;
  return isLoopbackHostname(parseRequestHostname(opts.hostHeader));
}
