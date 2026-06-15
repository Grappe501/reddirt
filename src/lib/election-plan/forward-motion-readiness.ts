import type {
  PromotionItem,
  StopReadinessBreakdown,
} from "@/lib/election-plan/forward-motion-stop-types";

const STATUS_SCORE: Record<string, number> = {
  not_started: 0,
  future: 0,
  draft_needed: 12,
  needed: 12,
  list_needed: 12,
  design_needed: 12,
  turf_needed: 12,
  requested: 25,
  script_ready: 35,
  drafted: 55,
  capture_plan_ready: 40,
  written: 60,
  scheduled: 70,
  printed: 65,
  approved: 85,
  hung: 80,
  completed: 100,
  published: 100,
  sent: 100,
  mailed: 100,
  posted: 100,
  verified: 100,
  tentative: 30,
  missing: 0,
};

export function statusToReadinessScore(status: string): number {
  return STATUS_SCORE[status] ?? 15;
}

export function formatPromotionStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export function buildPromotionItems(input: {
  mobilizeStatus: string;
  facebookStatus: string;
  newsReleaseStatus: string;
  graphicsStatus: string;
  postcardStatus: string;
  phoneBankStatus: string;
  storyWorkflowStatus: string;
}): PromotionItem[] {
  const rows: Array<{ id: string; label: string; status: string }> = [
    { id: "mobilize", label: "Mobilize", status: input.mobilizeStatus },
    { id: "facebook", label: "Facebook Event", status: input.facebookStatus },
    { id: "press", label: "Press Release", status: input.newsReleaseStatus },
    { id: "graphic", label: "Graphic", status: input.graphicsStatus },
    { id: "postcards", label: "Postcards", status: input.postcardStatus },
    { id: "phoneBank", label: "Phone Bank", status: input.phoneBankStatus },
    { id: "sms", label: "SMS", status: "not_started" },
    { id: "email", label: "Email", status: "not_started" },
    { id: "substack", label: "Substack Preview", status: input.storyWorkflowStatus === "published" ? "published" : "not_started" },
  ];
  return rows.map((r) => ({
    ...r,
    score: statusToReadinessScore(r.status),
  }));
}

export function averagePromotionScore(items: PromotionItem[]): number {
  if (!items.length) return 0;
  return items.reduce((s, i) => s + i.score, 0) / items.length;
}

export function computeStopReadiness(input: {
  promotionItems: PromotionItem[];
  storyStatus: string;
  coalitionPct?: number;
  volunteerPct?: number;
  housePartyPct?: number;
  endorsementPct?: number;
}): StopReadinessBreakdown {
  const promotion = averagePromotionScore(input.promotionItems);
  const story = statusToReadinessScore(input.storyStatus);
  const coalition = input.coalitionPct ?? 0;
  const volunteers = input.volunteerPct ?? 0;
  const houseParties = input.housePartyPct ?? 0;
  const endorsements = input.endorsementPct ?? 0;
  const composite = Math.round(
    ((promotion + story + coalition + volunteers + houseParties + endorsements) / 6) * 10,
  ) / 10;
  return {
    promotion: Math.round(promotion),
    coalition: Math.round(coalition),
    volunteers: Math.round(volunteers),
    story: Math.round(story),
    houseParties: Math.round(houseParties),
    endorsements: Math.round(endorsements),
    composite,
  };
}

function addDays(isoDate: string, delta: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function buildPromotionTimeline(eventDate: string, referenceDate: string) {
  const templates = [
    { daysBefore: 21, label: "21 Days Out", tasks: ["Create Mobilize", "Save-the-date graphic"] },
    { daysBefore: 14, label: "14 Days Out", tasks: ["Press release", "Facebook event"] },
    { daysBefore: 10, label: "10 Days Out", tasks: ["Postcards mailed"] },
    { daysBefore: 7, label: "7 Days Out", tasks: ["Phone bank invitations", "Coalition RSVP follow-up"] },
    { daysBefore: 3, label: "3 Days Out", tasks: ["Reminder posts", "Volunteer shift confirm"] },
    { daysBefore: 0, label: "Day Of", tasks: ["Live content plan", "Story capture checklist", "Po5 signup table"] },
    { daysBefore: -1, label: "24 Hours After", tasks: ["Story package", "Substack draft", "Upcoming stop post"] },
  ];
  return templates.map((t) => ({
    ...t,
    dueDate: addDays(eventDate, -t.daysBefore),
    isPast: addDays(eventDate, -t.daysBefore) < referenceDate,
  }));
}
