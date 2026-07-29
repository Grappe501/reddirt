"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  listPhotoIngestCandidatesAction,
  promoteAllPhotoIngestAction,
  promotePhotoIngestAction,
} from "@/app/admin/evidence-workbench-actions";

type Candidate = {
  filename: string;
  relativePath?: string;
  src: string;
  id: string;
  alreadyInRegistry: boolean;
  alreadyInDrafts: boolean;
  nested?: boolean;
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
  const nestedFresh = fresh.filter((c) => c.nested);
  const flatFresh = fresh.filter((c) => !c.nested);

  function refresh() {
    start(async () => {
      const res = await listPhotoIngestCandidatesAction();
      setMessage(res.message);
      if (res.candidates) setCandidates(res.candidates);
    });
  }

  function promote(pathOrName: string) {
    start(async () => {
      const res = await promotePhotoIngestAction(pathOrName);
      setMessage(res.message);
      if (res.ok) {
        const again = await listPhotoIngestCandidatesAction();
        if (again.candidates) setCandidates(again.candidates);
      }
    });
  }

  function promoteAll() {
    start(async () => {
      const res = await promoteAllPhotoIngestAction();
      setMessage(res.message);
      const again = await listPhotoIngestCandidatesAction();
      if (again.candidates) setCandidates(again.candidates);
    });
  }

  return (
    <div className="space-y-4 text-[#12124a]">
      <p className="max-w-3xl font-body text-sm text-[#364272]">
        Promote stills from <code className="rounded bg-[#f4f7fc] px-1">public/media/campaign-photos/</code>{" "}
        (including nested folders) into local ingest drafts, then label them on the Photos tab. Nested dumps
        should be flattened first with{" "}
        <code className="rounded bg-[#f4f7fc] px-1">scripts/batch-ingest-campaign-photos.ts</code>. Drafts live
        in <code className="rounded bg-[#f4f7fc] px-1">data/campaign-media/photo-ingest-drafts.json</code>.
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
        <button
          type="button"
          disabled={pending || flatFresh.length === 0}
          onClick={promoteAll}
          className="rounded-md bg-[#000066] px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
        >
          Promote all new flat files ({flatFresh.length})
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
      {nestedFresh.length > 0 ? (
        <p className="rounded border-2 border-[#ca913d] bg-[#fff8ef] px-3 py-2 font-body text-sm text-[#12124a]">
          {nestedFresh.length} nested file(s) still under a subfolder. Run the batch ingest script to copy them
          flat into <code className="rounded bg-white px-1">campaign-photos/</code>, then Rescan / Promote all.
        </p>
      ) : null}
      {fresh.length === 0 ? (
        <p className="font-body text-sm text-[#364272]">
          No new files to promote ({candidates.length} scanned). Drop images into the campaign-photos folder, then
          Rescan.
        </p>
      ) : (
        <ul className="divide-y divide-[#8eb6dc]/40 rounded-lg border-2 border-[#000066]/15 bg-white">
          {fresh.map((c) => (
            <li key={c.relativePath ?? c.filename} className="flex flex-wrap items-center gap-4 px-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.src} alt="" className="h-16 w-20 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-[#364272]">{c.id}</p>
                <p className="font-body text-sm">{c.relativePath ?? c.filename}</p>
                {c.nested ? (
                  <p className="font-body text-xs text-[#ca913d]">Nested — flatten via batch script first</p>
                ) : null}
              </div>
              <button
                type="button"
                disabled={pending || Boolean(c.nested)}
                onClick={() => promote(c.relativePath ?? c.filename)}
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
