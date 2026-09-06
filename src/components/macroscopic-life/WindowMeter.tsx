"use client";

import { useEffect, useState } from "react";

export function WindowMeter({ chapter }: { chapter: number }) {
  const [width, setWidth] = useState(8);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? el.scrollTop / max : 0;
      setWidth(8 + p * 92);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapter]);

  return (
    <div className="ml-meter" aria-hidden>
      <span>ch {String(chapter).padStart(2, "0")}</span>
      <i style={{ width: `${width}%` }} />
    </div>
  );
}
