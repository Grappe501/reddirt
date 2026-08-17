"use client";

import { useEffect } from "react";
import type { AppLocale } from "@/i18n/types";

/** Keeps `<html lang>` aligned with the active public locale (English canonical; Spanish on `/es/*`). */
export function DocumentLang({ locale }: { locale: AppLocale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
