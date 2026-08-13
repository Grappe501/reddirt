"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function EventShareActions({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(`${title} — ${url}`);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        className="text-sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Link copied" : "Copy link"}
      </Button>
      <Button href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} variant="outline" className="text-sm">
        Facebook
      </Button>
      <a
        href={`sms:?&body=${text}`}
        className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/25 px-5 py-3 text-sm font-semibold text-kelly-text hover:border-kelly-navy/45 hover:bg-kelly-navy/[0.06]"
      >
        Text
      </a>
    </div>
  );
}
