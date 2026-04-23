"use client";

import { useState, useTransition } from "react";
import { Image as ImageIcon, Library, Link2, Trash2 } from "lucide-react";
import { OwnedMediaKind, SocialContentMediaRefPurpose, type SocialPlatform } from "@prisma/client";
import {
  detachSocialMediaRefAction,
  updateSocialContentMediaRefAction,
} from "@/app/admin/media-library-actions";
import type { MediaRefListItem } from "@/lib/media-library/dto";
import { socialEnumLabel } from "@/lib/social/enum-labels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, NativeSelect, UiButton, UiInput, UiTextarea } from "./social-ui-primitives";
import { cn } from "@/lib/utils";

function purposeOptions() {
  return [
    { value: SocialContentMediaRefPurpose.SOCIAL_PLAN, label: "Social plan" },
    { value: SocialContentMediaRefPurpose.VIDEO_REPURPOSE, label: "Video / repurpose" },
    { value: SocialContentMediaRefPurpose.VISUAL, label: "Visual / graphic" },
    { value: SocialContentMediaRefPurpose.PLATFORM_VARIANT, label: "Platform variant" },
  ] as const;
}

type Props = {
  socialContentItemId: string;
  mediaRefs: MediaRefListItem[];
  platformVariants: { id: string; platform: SocialPlatform; label: string }[];
  onChanged: () => void;
  onOpenMediaLibrary: () => void;
};

export function SocialWorkbenchAttachedMediaSection({
  socialContentItemId,
  mediaRefs,
  platformVariants,
  onChanged,
  onOpenMediaLibrary,
}: Props) {
  const [pending, start] = useTransition();
  const [noteByRef, setNoteByRef] = useState<Record<string, string>>({});

  const runRefUpdate = async (refId: string, input: Parameters<typeof updateSocialContentMediaRefAction>[1]) => {
    let u = await updateSocialContentMediaRefAction(refId, input);
    if (!u.ok && u.error === "UNAPPROVED_NEEDS_CONFIRM") {
      if (typeof window !== "undefined" && !window.confirm("This asset is not approved for social. Assign it to a platform variant anyway?")) {
        return;
      }
      u = await updateSocialContentMediaRefAction(refId, { ...input, confirmUnapproved: true });
    }
    if (u.ok) onChanged();
    else alert(u.error);
  };

  return (
    <Card className="mt-4 rounded-3xl border-slate-200/90 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Linked campaign media</CardTitle>
            <CardDescription>
              <code className="text-[10px]">OwnedMediaAsset</code> via <code className="text-[10px]">SocialContentMediaRef</code> — preview routes only, no raw paths.
            </CardDescription>
          </div>
          <UiButton type="button" size="sm" variant="outline" className="rounded-xl" onClick={onOpenMediaLibrary}>
            <Library className="h-4 w-4" />
            Open media library
          </UiButton>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mediaRefs.length === 0 ? (
          <p className="text-sm text-slate-500">No media attached. Use Media library to add indexed assets to this work item.</p>
        ) : (
          <ul className="space-y-3">
            {mediaRefs.map((r) => {
              const m = r.media;
              const note = noteByRef[r.refId] !== undefined ? noteByRef[r.refId]! : (r.note ?? "");
              const unapproved = !m.approvedForSocial;
              return (
                <li
                  key={r.refId}
                  className={cn(
                    "flex flex-col gap-2 rounded-2xl border p-3 sm:flex-row sm:items-start",
                    unapproved ? "border-amber-300 bg-amber-50/40" : "border-slate-200 bg-white"
                  )}
                >
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {m.kind === OwnedMediaKind.IMAGE ? (
                      <img
                        src={m.previewUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5 text-sm">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{m.title}</span>
                      {unapproved ? (
                        <span className="rounded-md border border-amber-500 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                          Not approved for social
                        </span>
                      ) : (
                        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                          Approved
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {m.fileName} · {socialEnumLabel(m.kind)} · {socialEnumLabel(m.sourceType)}
                    </p>
                    {m.countyLabel || m.linkedCampaignEventTitle ? (
                      <p className="text-[10px] text-slate-600">
                        {m.countyLabel ? <span>County: {m.countyLabel} </span> : null}
                        {m.linkedCampaignEventTitle ? <span>· Event: {m.linkedCampaignEventTitle}</span> : null}
                      </p>
                    ) : null}
                    <p className="text-[10px] text-slate-500">
                      Transcript: {m.hasTranscript ? (m.transcriptExcerpt ? `“${m.transcriptExcerpt.slice(0, 120)}…”` : "on file") : "none"}
                    </p>
                    <div className="grid gap-2 pt-1 sm:grid-cols-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500">Purpose</span>
                        <NativeSelect
                          className="mt-0.5 rounded-lg"
                          value={r.purpose}
                          options={[...purposeOptions()]}
                          onValueChange={(v) => {
                            const purpose = v as SocialContentMediaRefPurpose;
                            const defaultVariant = platformVariants[0]?.id;
                            start(async () => {
                              await runRefUpdate(r.refId, {
                                purpose,
                                socialPlatformVariantId:
                                  purpose === SocialContentMediaRefPurpose.PLATFORM_VARIANT
                                    ? (r.socialPlatformVariantId ?? defaultVariant ?? null)
                                    : null,
                              });
                            });
                          }}
                          aria-label="Ref purpose"
                        />
                      </div>
                      {r.purpose === SocialContentMediaRefPurpose.PLATFORM_VARIANT ? (
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500">Platform variant</span>
                          <NativeSelect
                            className="mt-0.5 rounded-lg"
                            value={r.socialPlatformVariantId ?? ""}
                            options={[
                              { value: "", label: "— Select —" },
                              ...platformVariants.map((p) => ({ value: p.id, label: p.label })),
                            ]}
                            onValueChange={(variantId) => {
                              if (!variantId) return;
                              start(async () => {
                                await runRefUpdate(r.refId, { socialPlatformVariantId: variantId });
                              });
                            }}
                            aria-label="Target variant"
                          />
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500">Note</span>
                      <UiTextarea
                        className="mt-0.5 min-h-[48px] rounded-lg text-xs"
                        value={note}
                        onChange={(e) => setNoteByRef((prev) => ({ ...prev, [r.refId]: e.target.value }))}
                        onBlur={() => {
                          if ((r.note ?? "") === note) return;
                          start(async () => {
                            const u = await updateSocialContentMediaRefAction(r.refId, { note: note.trim() || null });
                            if (u.ok) onChanged();
                            else alert(u.error);
                          });
                        }}
                      />
                    </div>
                    {r.purpose === SocialContentMediaRefPurpose.PLATFORM_VARIANT && r.variantPlatformLabel ? (
                      <p className="text-[10px] text-slate-500">
                        <Link2 className="mr-0.5 inline h-3 w-3" />
                        {r.variantPlatformLabel}
                      </p>
                    ) : null}
                    <div className="pt-1">
                      <UiButton
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 text-red-700"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm("Remove this link from the work item? (Does not delete the file from the library.)")) return;
                          start(async () => {
                            const d = await detachSocialMediaRefAction(r.refId);
                            if (d.ok) onChanged();
                            else alert(d.error);
                          });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove link
                      </UiButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-[10px] text-slate-400" aria-hidden>
          Work item: {socialContentItemId}
        </p>
      </CardContent>
    </Card>
  );
}
