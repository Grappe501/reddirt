"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  listPhotoIngestCandidatesAction,
  promotePhotoIngestAction,
} from "@/app/admin/evidence-workbench-actions";

type Candidate = {
  filename: string;
  src: string;
  id: string;
  alreadyInRegistry: boolean;
  alreadyInDrafts: boolean;
};

type Props = {
  initialCandidates: Candidate[];
};

export function EvidenceIngestPanel({ initialCandidates }: Props) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    setCandidates(initialCandidates);
  }, [initialCandidates]);

  const fresh = candidates.filter((c) => !c.alreadyInRegistry && !c.alreadyInDrafts);

  function refresh() {
    start(async () => {
      const res = await listPhotoIngestCandidatesAction();
      setMessage(res.message);
      if (res.candidates) setCandidates(res.candidates);
    });
  }

  function promote(filename: string) {
    start(async () => {
      const res = await promotePhotoIngestAction(filename);
      setMessage(res.message);
      if (res.ok && res.photoId) {
        const again = await listPhotoIngestCandidatesAction();
        if (again.candidates) setCandidates(again.candidates);
      }
    });
  }

  return (
    <div className="space-y-4 text-[#12124a]">
      <p className="max-w-3xl font-body text-sm text-[#364272]">
        Promote stills from <code className="rounded bg-[#f4f7fc] px-1">public/media/campaign-photos/</code> into
        local ingest drafts, then label them on the Photos tab. Drafts live in{" "}
        <code className="rounded bg-[#f4f7fc] px-1">data/campaign-media/photo-ingest-drafts.json</code> until
        promoted into the TypeScript registry. Commit that JSON to share across machines.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={refresh}
          className="rounded-md border-2 border-[#000066] bg-white px-4 py-2 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
        >
          Rescan folder
        </button>
        <Link
          href="/admin/owned-media"
          className="rounded-md border-2 border-[#8eb6dc] bg-white px-4 py-2 font-body text-sm font-semibold text-[#12124a]"
        >
          Owned Media library
        </Link>
        <Link
          href="/admin/media/youtube"
          className="rounded-md border-2 border-[#8eb6dc] bg-white px-4 py-2 font-body text-sm font-semibold text-[#12124a]"
        >
          YouTube transcripts
        </Link>
      </div>
      {message ? <p className="font-body text-sm text-[#364272]">{message}</p> : null}
      {fresh.length === 0 ? (
        <p className="font-body text-sm text-[#364272]">
          No new files to promote ({candidates.length} scanned). Drop images into the campaign-photos folder, then
          Rescan.
        </p>
      ) : (
        <ul className="divide-y divide-[#8eb6dc]/40 rounded-lg border-2 border-[#000066]/15 bg-white">
          {fresh.map((c) => (
            <li key={c.filename} className="flex flex-wrap items-center gap-4 px-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.src} alt="" className="h-16 w-20 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-[#364272]">{c.id}</p>
                <p className="font-body text-sm">{c.filename}</p>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => promote(c.filename)}
                className="rounded-md bg-[#000066] px-3 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
              >
                Promote to drafts
              </button>
              <Link
                href={`/admin/evidence-workbench?tab=photos&id=${encodeURIComponent(c.id)}`}
                className="font-body text-sm font-semibold text-[#000066] underline"
              >
                Open in Photos
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
