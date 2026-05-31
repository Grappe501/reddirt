import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { buildArklegBillUrl, politeFetchHtml, type FetchPolicy } from "./legislativeFetch";
import { DEFAULT_SPONSOR_NAME } from "./legislativeGovernance";

export type LegislativeMeetingRow = {
  dateRaw: string;
  meetingLabel: string;
  videoUrl: string | null;
  mediaStartTime: string | null;
};

export type VideoCandidateRef = {
  videoUrl: string;
  sourcePageUrl: string;
  committeeName: string;
  meetingDate: string;
  mediaStartTime: string | null;
  discoveryConfidence: number;
  sourceType: "SLIQ_COMMITTEE" | "SLIQ_FLOOR" | "UNKNOWN";
};

export type LegislativeSourcePacket = {
  billNumber: string;
  session: string;
  billUrl: string;
  title: string;
  sponsor: string;
  committeeMeetings: LegislativeMeetingRow[];
  videoCandidates: VideoCandidateRef[];
  documentLinks: string[];
  confidence: number;
  retrievalWarnings: string[];
  retrievedAt: string;
};

const SOURCE_PACKETS_DIR = "data/legislature/source-packets";

export function parseBillMeetingsFromHtml(html: string): LegislativeMeetingRow[] {
  if (!html) return [];
  const $ = cheerio.load(html);
  const meetings: LegislativeMeetingRow[] = [];
  const h3 = $("h3")
    .filter((_, el) => $(el).text().trim() === "Meetings")
    .first();
  if (!h3.length) return meetings;

  const scope = h3.parent();
  scope.find(".row.tableRow, .row.tableRowAlt").each((_, row) => {
    const $r = $(row);
    const dateRaw = $r.find('[aria-colindex="1"]').first().text().replace(/\s+/g, " ").trim();
    const meetingHtml = $r.find('[aria-colindex="2"]').first().html() ?? "";
    const meetingLabel = cheerio.load(`<wrap>${meetingHtml}</wrap>`)("wrap").text().replace(/\s+/g, " ").trim();
    const vid = $r.find('a[href*="sliq.net"]').first();
    const videoUrl = vid.attr("href") ?? null;
    let mediaStartTime: string | null = null;
    if (videoUrl) {
      try {
        mediaStartTime = new URL(videoUrl).searchParams.get("mediaStartTime");
      } catch {
        mediaStartTime = null;
      }
    }
    if (dateRaw && meetingLabel) {
      meetings.push({ dateRaw, meetingLabel, videoUrl, mediaStartTime });
    }
  });
  return meetings;
}

export function pickCommitteePresentationMeeting(meetings: LegislativeMeetingRow[]): LegislativeMeetingRow | null {
  const withVideo = meetings.filter((m) => m.videoUrl);
  if (!withVideo.length) return null;
  const committeeFirst = withVideo.find((m) => {
    const L = m.meetingLabel.toLowerCase();
    if (/\bconvenes\b/.test(L) && !/committee/.test(L)) return false;
    return /committee|public health|efficiency|state agencies|city county|judiciary|education|revenue|state affairs/i.test(
      m.meetingLabel,
    );
  });
  return committeeFirst ?? withVideo[0] ?? null;
}

function classifyVideoSource(meetingLabel: string): VideoCandidateRef["sourceType"] {
  if (/committee/i.test(meetingLabel)) return "SLIQ_COMMITTEE";
  if (/floor|senate convenes|house convenes/i.test(meetingLabel)) return "SLIQ_FLOOR";
  return "UNKNOWN";
}

export function meetingsToVideoCandidates(
  meetings: LegislativeMeetingRow[],
  billUrl: string,
): VideoCandidateRef[] {
  return meetings
    .filter((m) => m.videoUrl)
    .map((m) => ({
      videoUrl: m.videoUrl!,
      sourcePageUrl: billUrl,
      committeeName: m.meetingLabel,
      meetingDate: m.dateRaw,
      mediaStartTime: m.mediaStartTime,
      discoveryConfidence: pickCommitteePresentationMeeting([m]) ? 85 : 70,
      sourceType: classifyVideoSource(m.meetingLabel),
    }));
}

export async function discoverBillSourcePacket(
  billNumber: string,
  session: string,
  repoRoot: string = process.cwd(),
  policy?: FetchPolicy,
): Promise<LegislativeSourcePacket> {
  const billUrl = buildArklegBillUrl(billNumber, session);
  const fetch = await politeFetchHtml(billUrl, repoRoot, policy);
  const warnings = [...fetch.warnings];
  const meetings = parseBillMeetingsFromHtml(fetch.html);
  const videoCandidates = meetingsToVideoCandidates(meetings, billUrl);

  if (!fetch.html) warnings.push("No bill page HTML — discovery incomplete (cache miss or live fetch disabled).");
  if (!videoCandidates.length) warnings.push("No Sliq Harmony video links found on bill Meetings section.");

  const packet: LegislativeSourcePacket = {
    billNumber,
    session,
    billUrl,
    title: "",
    sponsor: DEFAULT_SPONSOR_NAME,
    committeeMeetings: meetings,
    videoCandidates,
    documentLinks: [],
    confidence: videoCandidates.length ? 80 : fetch.html ? 50 : 20,
    retrievalWarnings: warnings,
    retrievedAt: new Date().toISOString(),
  };

  saveSourcePacket(packet, repoRoot);
  return packet;
}

export function discoverCommitteeMeetingsForBill(
  billNumber: string,
  session: string,
  repoRoot: string = process.cwd(),
): LegislativeMeetingRow[] {
  const cached = loadSourcePacket(billNumber, session, repoRoot);
  return cached?.committeeMeetings ?? [];
}

export function discoverVideoArchivesForBill(
  billNumber: string,
  session: string,
  repoRoot: string = process.cwd(),
): VideoCandidateRef[] {
  const cached = loadSourcePacket(billNumber, session, repoRoot);
  return cached?.videoCandidates ?? [];
}

export function discoverBillDocuments(billNumber: string, session: string, repoRoot: string = process.cwd()): string[] {
  const cached = loadSourcePacket(billNumber, session, repoRoot);
  return cached?.documentLinks ?? [];
}

export async function buildLegislativeSourcePacket(
  billNumber: string,
  session: string,
  repoRoot: string = process.cwd(),
  policy?: FetchPolicy,
): Promise<LegislativeSourcePacket> {
  const existing = loadSourcePacket(billNumber, session, repoRoot);
  if (existing && existing.videoCandidates.length) return existing;
  return discoverBillSourcePacket(billNumber, session, repoRoot, policy);
}

function packetPath(billNumber: string, session: string, repoRoot: string): string {
  const safeSession = session.replace(/\//g, "-");
  return path.join(repoRoot, SOURCE_PACKETS_DIR, `${billNumber}-${safeSession}.json`);
}

export function saveSourcePacket(packet: LegislativeSourcePacket, repoRoot: string = process.cwd()): void {
  const abs = packetPath(packet.billNumber, packet.session, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(packet, null, 2)}\n`, "utf8");
}

export function loadSourcePacket(
  billNumber: string,
  session: string,
  repoRoot: string = process.cwd(),
): LegislativeSourcePacket | null {
  const abs = packetPath(billNumber, session, repoRoot);
  if (!existsSync(abs)) return null;
  return JSON.parse(readFileSync(abs, "utf8")) as LegislativeSourcePacket;
}
