import type { TranscriptSegment } from "./legislativeTranscriptionTypes";

export type SpeakerAttributionStatus =
  | "SPEAKER_CONFIRMED"
  | "LIKELY_SPEAKER"
  | "NEEDS_REVIEW"
  | "NOT_SPEAKER"
  | "UNKNOWN";

export type BillDiscussionWindow = {
  startTime: string;
  endTime: string;
  confidence: number;
  speakerAttributionStatus: SpeakerAttributionStatus;
  evidence: string[];
  warnings: string[];
};

const CHAIR_RECOGNITION = [
  /senator hammer[,.]? you are recognized/i,
  /representative hammer[,.]? you are recognized/i,
  /senator hammer presents/i,
  /representative hammer presents/i,
  /senator kim hammer/i,
  /representative kim hammer/i,
];

const BILL_PRESENT = [/i'?m here to present/i, /this is senate bill/i, /this is house bill/i, /presenting (?:senate|house) bill/i];

export function detectBillDiscussionWindows(
  segments: TranscriptSegment[],
  billNumber: string,
): BillDiscussionWindow[] {
  const windows: BillDiscussionWindow[] = [];
  const billRe = new RegExp(billNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  let start: TranscriptSegment | null = null;

  for (const seg of segments) {
    if (billRe.test(seg.text) || BILL_PRESENT.some((re) => re.test(seg.text))) {
      if (!start) start = seg;
    } else if (start && seg.text.length > 20) {
      windows.push({
        startTime: start.startTime,
        endTime: seg.endTime,
        confidence: 60,
        speakerAttributionStatus: "NEEDS_REVIEW",
        evidence: [`Bill number or presentation language near ${start.startTime}`],
        warnings: ["Window boundary heuristic — verify in video"],
      });
      start = null;
    }
  }
  return windows;
}

export function scoreSpeakerAttribution(
  segment: TranscriptSegment,
  sponsorName: string,
  context: { billNumber: string; isPresentationWindow: boolean },
): { score: number; status: SpeakerAttributionStatus; evidence: string[] } {
  const evidence: string[] = [];
  let score = segment.speakerConfidence ?? 0;

  if (CHAIR_RECOGNITION.some((re) => re.test(segment.text))) {
    score += 40;
    evidence.push("Chair recognition pattern in segment");
  }
  if (segment.speakerLabel.toLowerCase().includes(sponsorName.split(" ")[1]?.toLowerCase() ?? "hammer")) {
    score += 25;
    evidence.push("Speaker label matches sponsor surname");
  }
  if (context.isPresentationWindow) {
    score += 15;
    evidence.push("Within sponsor presentation window");
  }
  if (new RegExp(context.billNumber, "i").test(segment.text)) {
    score += 10;
    evidence.push("Bill number mentioned");
  }

  let status: SpeakerAttributionStatus = "UNKNOWN";
  if (score >= 80) status = "SPEAKER_CONFIRMED";
  else if (score >= 55) status = "LIKELY_SPEAKER";
  else if (score >= 30) status = "NEEDS_REVIEW";
  else status = "UNKNOWN";

  return { score: Math.min(100, score), status, evidence };
}

export function detectSponsorPresentationWindow(
  segments: TranscriptSegment[],
  billNumber: string,
  sponsorName: string,
): BillDiscussionWindow | null {
  if (!segments.length) return null;

  const presentationSeg = segments.find(
    (s) =>
      CHAIR_RECOGNITION.some((re) => re.test(s.text)) ||
      (BILL_PRESENT.some((re) => re.test(s.text)) && new RegExp(billNumber, "i").test(s.text)),
  );

  if (!presentationSeg) {
    const first = segments[0];
    return {
      startTime: first.startTime,
      endTime: segments[Math.min(4, segments.length - 1)]?.endTime ?? first.endTime,
      confidence: 35,
      speakerAttributionStatus: "NEEDS_REVIEW",
      evidence: ["Default opening window — no chair recognition detected"],
      warnings: ["Weak sponsor window detection — human review required"],
    };
  }

  const idx = segments.indexOf(presentationSeg);
  const endIdx = Math.min(segments.length - 1, idx + 8);
  const scored = scoreSpeakerAttribution(presentationSeg, sponsorName, {
    billNumber,
    isPresentationWindow: true,
  });

  return {
    startTime: presentationSeg.startTime,
    endTime: segments[endIdx].endTime,
    confidence: scored.score,
    speakerAttributionStatus: scored.status,
    evidence: scored.evidence,
    warnings: scored.status !== "SPEAKER_CONFIRMED" ? ["Not SPEAKER_CONFIRMED — do not use as verified quote"] : [],
  };
}

export function summarizeSponsorPresentationEvidence(windows: BillDiscussionWindow[]): string[] {
  return windows.map(
    (w) =>
      `${w.startTime}-${w.endTime}: ${w.speakerAttributionStatus} (confidence ${w.confidence}) — ${w.evidence.join("; ")}`,
  );
}
