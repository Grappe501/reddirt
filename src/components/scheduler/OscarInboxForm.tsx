"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createDraftFromOscarAction, oscarInterpretAction, type OscarIngestState } from "@/app/scheduler/actions";

const initial: OscarIngestState = { drafts: [], ignored: [] };

export function OscarInboxForm() {
  const [state, action, pending] = useActionState(oscarInterpretAction, initial);
  const [imagesJson, setImagesJson] = useState("[]");

  function onFiles(files: FileList | null) {
    if (!files?.length) {
      setImagesJson("[]");
      return;
    }
    Promise.all(
      Array.from(files).slice(0, 6).map(
        (file) =>
          new Promise<{ mime: string; base64: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("read"));
            reader.onload = () => {
              const url = String(reader.result || "");
              const base64 = url.includes(",") ? url.split(",")[1] : url;
              resolve({ mime: file.type || "image/png", base64 });
            };
            reader.readAsDataURL(file);
          }),
      ),
    ).then((rows) => setImagesJson(JSON.stringify(rows)));
  }

  return (
    <div className="space-y-8">
      <form action={action} className="space-y-4 rounded-card border border-kelly-navy/15 bg-white p-5">
        <input type="hidden" name="imagesJson" value={imagesJson} />
        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">
            Paste email or notes
          </span>
          <textarea
            name="text"
            rows={8}
            className="mt-1 w-full rounded-md border border-kelly-navy/20 px-3 py-2 font-body text-sm"
            placeholder="Forward the host email or paste the flyer text."
          />
        </label>
        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Flyer photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="mt-1 block w-full font-body text-sm"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "OSCAR is reading…" : "Interpret with OSCAR"}
        </Button>
      </form>

      {state.warning ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 font-body text-sm">{state.warning}</p>
      ) : null}

      {state.drafts.map((draft, i) => (
        <form
          key={`${draft.proposal.title}-${draft.proposal.date}-${i}`}
          action={createDraftFromOscarAction}
          className="space-y-3 rounded-card border border-kelly-navy/15 bg-white p-5"
        >
          <h3 className="font-heading text-lg font-bold">{draft.proposal.publicTitle || draft.proposal.title}</h3>
          <p className="font-body text-sm text-kelly-text/75">
            {draft.proposal.date}
            {draft.proposal.startTime ? ` · ${draft.proposal.startTime}` : ""}
            {draft.proposal.city ? ` · ${draft.proposal.city}` : ""}
            {draft.proposal.counties[0] ? ` · ${draft.proposal.counties[0]} County` : ""}
          </p>
          {draft.weakFields.length ? (
            <ul className="list-disc pl-5 font-body text-sm text-amber-900">
              {draft.weakFields.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
          <input type="hidden" name="title" value={draft.proposal.publicTitle || draft.proposal.title} />
          <input type="hidden" name="date" value={draft.proposal.date} />
          <input type="hidden" name="startTime" value={draft.proposal.startTime ?? ""} />
          <input type="hidden" name="endTime" value={draft.proposal.endTime ?? ""} />
          <input type="hidden" name="city" value={draft.proposal.city ?? ""} />
          <input type="hidden" name="county" value={draft.proposal.counties[0] ?? ""} />
          <input type="hidden" name="publicSummary" value={draft.publicSummary} />
          <input type="hidden" name="fieldAttendance" value={draft.card.fieldAttendance ?? ""} />
          <input type="hidden" name="kellyRole" value={draft.card.kellyRole ?? ""} />
          <input type="hidden" name="tabling" value={draft.card.tabling ?? ""} />
          <input type="hidden" name="volunteers" value={draft.card.volunteers ?? ""} />
          <input type="hidden" name="mobilize" value={draft.card.mobilize ?? ""} />
          <input type="hidden" name="mobilizeHref" value={draft.card.mobilizeHref ?? ""} />
          <input type="hidden" name="volunteerHref" value={draft.card.volunteerHref ?? ""} />
          <input type="hidden" name="needsMoreInfo" value={draft.card.needsMoreInfo ? "1" : ""} />
          <Button type="submit" variant="primary">
            Open in editor
          </Button>
        </form>
      ))}

      {state.ignored.length ? (
        <div className="font-body text-sm text-kelly-text/70">
          <p className="font-semibold">Skipped</p>
          <ul className="mt-2 list-disc pl-5">
            {state.ignored.map((row) => (
              <li key={`${row.title}-${row.reason}`}>
                {row.title} — {row.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
