import { headers } from "next/headers";
import type { AppLocale } from "@/i18n/types";
import { localeFromPathname } from "@/i18n/path";

export async function getRequestLocale(): Promise<AppLocale> {
  const h = await headers();
  if (h.get("x-locale") === "es") return "es";
  const path = h.get("x-pathname") ?? "";
  return localeFromPathname(path);
}
