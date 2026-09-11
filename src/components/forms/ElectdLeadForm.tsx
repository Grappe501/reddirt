"use client";

import { useEffect } from "react";

const ELECTD_FORMS = {
  volunteer: {
    id: "electd-form-committee-to-elect-kelly-grappe-msq969g8-volunteer",
    src: "https://app.electd.io/f/committee-to-elect-kelly-grappe-msq969g8/volunteer?embed=1",
    title: "Join our campaign",
  },
  connect: {
    id: "electd-form-committee-to-elect-kelly-grappe-msq969g8-connect",
    src: "https://app.electd.io/f/committee-to-elect-kelly-grappe-msq969g8/connect?embed=1",
    title: "Stay connected",
  },
  localTeam: {
    id: "electd-form-committee-to-elect-kelly-grappe-msq969g8-local-team",
    src: "https://app.electd.io/f/committee-to-elect-kelly-grappe-msq969g8/local-team?embed=1",
    title: "Start a local team",
  },
} as const;

export type ElectdLeadFormId = keyof typeof ELECTD_FORMS;

/**
 * Official Electd intake embeds. Resize messages are matched to this iframe's window
 * so Stay connected and Volunteer can live on the same page.
 */
export function ElectdLeadForm({ form }: { form: ElectdLeadFormId }) {
  const spec = ELECTD_FORMS[form];

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { source?: string; type?: string; height?: number } | null;
      if (!data || data.source !== "electd-leadform-embed") return;
      if (data.type !== "leadform.embed.resize" || !data.height) return;
      const iframe = document.getElementById(spec.id) as HTMLIFrameElement | null;
      if (!iframe) return;
      if (event.source && iframe.contentWindow && event.source !== iframe.contentWindow) return;
      iframe.style.height = `${data.height}px`;
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [spec.id]);

  return (
    <iframe
      id={spec.id}
      src={spec.src}
      title={spec.title}
      style={{ width: "100%", border: 0, minHeight: 520 }}
      loading="lazy"
    />
  );
}

export function ElectdVolunteerForm() {
  return <ElectdLeadForm form="volunteer" />;
}

export function ElectdStayConnectedForm() {
  return <ElectdLeadForm form="connect" />;
}

export function ElectdLocalTeamForm() {
  return <ElectdLeadForm form="localTeam" />;
}
