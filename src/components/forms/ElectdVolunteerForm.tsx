"use client";

import { useEffect } from "react";

export const ELECTD_VOLUNTEER_FORM_ID = "electd-form-committee-to-elect-kelly-grappe-msq969g8-volunteer";
export const ELECTD_VOLUNTEER_EMBED_SRC =
  "https://app.electd.io/f/committee-to-elect-kelly-grappe-msq969g8/volunteer?embed=1";

/**
 * Official Electd volunteer intake. Resize messages come from their embed script.
 */
export function ElectdVolunteerForm() {
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: string; type?: string; height?: number } | null;
      if (!data || data.source !== "electd-leadform-embed") return;
      if (data.type !== "leadform.embed.resize" || !data.height) return;
      const frame = document.getElementById(ELECTD_VOLUNTEER_FORM_ID);
      if (frame) frame.style.height = `${data.height}px`;
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      id={ELECTD_VOLUNTEER_FORM_ID}
      src={ELECTD_VOLUNTEER_EMBED_SRC}
      title="Join our campaign"
      style={{ width: "100%", border: 0, minHeight: 520 }}
      loading="lazy"
    />
  );
}
