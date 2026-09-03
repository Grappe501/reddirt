"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function EventShareActions({
  title,
  url,
  graphicUrl,
}: {
  title: string;
  url: string;
  graphicUrl?: string | null;
}) {
  const [copied, setCopied] = useState<"link" | "caption" | null>(null);
  const encoded = encodeURIComponent(url);
  const caption = `${title} — ${url}`;
  const text = encodeURIComponent(caption);

  async function copy(value: string, kind: "link" | "caption") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" className="text-sm" onClick={() => void copy(url, "link")}>
        {copied === "link" ? "Link copied" : "Copy link"}
      </Button>
      <Button href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} variant="outline" className="text-sm">
        Facebook
      </Button>
      {graphicUrl ? (
        <a
          href={graphicUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/25 px-5 py-3 text-sm font-semibold text-kelly-text hover:border-kelly-navy/45 hover:bg-kelly-navy/[0.06]"
        >
          Save for Instagram
        </a>
      ) : null}
      {graphicUrl ? (
        <Button type="button" variant="outline" className="text-sm" onClick={() => void copy(caption, "caption")}>
          {copied === "caption" ? "Caption copied" : "Copy Instagram caption"}
        </Button>
      ) : null}
      <a
        href={`sms:?&body=${text}`}
        className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/25 px-5 py-3 text-sm font-semibold text-kelly-text hover:border-kelly-navy/45 hover:bg-kelly-navy/[0.06]"
      >
        Text
      </a>
    </div>
  );
}
