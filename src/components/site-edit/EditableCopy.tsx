"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { saveSiteCopyOverrideAction } from "@/app/admin/site-edit-actions";
import { cn } from "@/lib/utils";

type Props = {
  copyKey: string;
  value: string;
  editing: boolean;
  as?: "p" | "h1" | "h2" | "h3" | "span";
  className?: string;
  children?: ReactNode;
  multiline?: boolean;
};

/**
 * Basic inline copy editor for public site edit mode.
 * Saves to data/site-edit/copy-overrides.json via admin action.
 */
export function EditableCopy({
  copyKey,
  value,
  editing,
  as = "p",
  className,
  children,
  multiline = false,
}: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const Tag = as;
  const display = children ?? value;

  if (!editing) {
    return <Tag className={className}>{display}</Tag>;
  }

  if (!open) {
    return (
      <Tag className={cn(className, "relative")}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded border-2 border-dashed border-[#ca913d]/80 bg-[#ca913d]/10 text-left outline-offset-2 hover:border-[#000066]"
          title={`Edit ${copyKey}`}
        >
          {display}
        </button>
      </Tag>
    );
  }

  return (
    <span className="block rounded-lg border-2 border-[#000066] bg-white p-2 text-[#12124a] shadow-md">
      <p className="font-mono text-[10px] text-[#364272]">{copyKey}</p>
      {multiline ? (
        <textarea
          className="mt-1 w-full rounded border border-[#8eb6dc] bg-[#f4f7fc] px-2 py-1 font-body text-sm text-[#12124a]"
          rows={4}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      ) : (
        <input
          className="mt-1 w-full rounded border border-[#8eb6dc] bg-[#f4f7fc] px-2 py-1 font-body text-sm text-[#12124a]"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const res = await saveSiteCopyOverrideAction({ key: copyKey, value: draft });
              setMessage(res.message);
              if (res.ok) {
                setOpen(false);
                router.refresh();
              }
            });
          }}
          className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-[11px] font-bold text-white disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const res = await saveSiteCopyOverrideAction({ key: copyKey, value: "" });
              setMessage(res.message);
              if (res.ok) {
                setOpen(false);
                router.refresh();
              }
            });
          }}
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-[11px] font-semibold disabled:opacity-50"
        >
          Reset default
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(value);
            setOpen(false);
            setMessage("");
          }}
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-[11px] font-semibold"
        >
          Cancel
        </button>
      </div>
      {message ? <p className="mt-1 font-body text-[10px] text-[#364272]">{message}</p> : null}
    </span>
  );
}
