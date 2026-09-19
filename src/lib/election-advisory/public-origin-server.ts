import "server-only";
import { headers } from "next/headers";

import { aeacBaseForHost, aeacHref, normalizeHost } from "./public-origin";

export async function getRequestHost(): Promise<string> {
  const headerList = await headers();
  return normalizeHost(headerList.get("x-forwarded-host") || headerList.get("host"));
}

export async function getAeacBase(): Promise<string> {
  return aeacBaseForHost(await getRequestHost());
}

export async function getAeacHref(path = ""): Promise<string> {
  return aeacHref(await getAeacBase(), path);
}
