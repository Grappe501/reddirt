"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  loadSiteCopyOverrides,
  setSiteCopyOverride,
} from "@/lib/site-edit/copy-overrides";
import { SITE_EDIT_COOKIE, canUseSiteEditMode } from "@/lib/site-edit/edit-mode";
import { PUBLIC_EDIT_PAGE_LINKS } from "@/lib/site-edit/public-edit-pages";

async function gate(): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!(await canUseSiteEditMode())) {
    return { ok: false, message: "Admin session required for site edit mode." };
  }
  const denied = await assertAdminApi();
  if (denied) return { ok: false, message: "Unauthorized" };
  return { ok: true };
}

export async function enableSiteEditModeAction(): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return g;
  const jar = await cookies();
  jar.set(SITE_EDIT_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return { ok: true, message: "Site edit mode on — browse the public site to edit copy and media." };
}

export async function disableSiteEditModeAction(): Promise<{ ok: boolean; message: string }> {
  const jar = await cookies();
  jar.set(SITE_EDIT_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return { ok: true, message: "Site edit mode off." };
}

export async function saveSiteCopyOverrideAction(input: {
  key: string;
  value: string;
}): Promise<{ ok: boolean; message: string }> {
  const g = await gate();
  if (!g.ok) return g;
  if (!(await canUseSiteEditMode())) {
    return { ok: false, message: "Edit mode not authorized." };
  }
  const key = String(input.key ?? "").trim();
  if (!key || key.length > 160) return { ok: false, message: "Invalid copy key." };
  const value = String(input.value ?? "");
  if (value.length > 8000) return { ok: false, message: "Copy too long (max 8000)." };
  setSiteCopyOverride(key, value);
  for (const page of PUBLIC_EDIT_PAGE_LINKS) {
    revalidatePath(page.href);
  }
  revalidatePath("/edit");
  return {
    ok: true,
    message: value.trim()
      ? `Saved override · ${key}`
      : `Cleared override · ${key} (static default restored)`,
  };
}

export async function listSiteCopyOverridesAction(): Promise<{
  ok: boolean;
  message: string;
  overrides?: Record<string, string>;
}> {
  const g = await gate();
  if (!g.ok) return g;
  const store = loadSiteCopyOverrides();
  return { ok: true, message: "ok", overrides: store.overrides };
}
