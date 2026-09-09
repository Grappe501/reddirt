import { normalizeRollCall, type VoteValue } from "./normalize-rollcall";

function textOf(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
}

function normalizeVote(value?: string): VoteValue | null {
  const v = value?.trim().toLowerCase();
  if (v === "yea" || v === "aye") return "Yea";
  if (v === "nay" || v === "no") return "Nay";
  if (v === "present") return "Present";
  if (v === "not voting") return "Not Voting";
  return null;
}

function parseMemberBlocks(xml: string) {
  const blocks = [...xml.matchAll(/<recorded-vote>([\s\S]*?)<\/recorded-vote>/gi)].map((m) => m[1]);
  return blocks.map((block) => {
    const legislatorTag = block.match(/<legislator([^>]*)>([\s\S]*?)<\/legislator>/i);
    const attrs = legislatorTag?.[1] ?? "";
    const name = legislatorTag?.[2]?.replace(/<[^>]+>/g, "").trim() ?? "";
    const party = attrs.match(/party="([^"]+)"/i)?.[1] ?? "";
    const state = attrs.match(/state="([^"]+)"/i)?.[1] ?? "";
    const memberId = attrs.match(/name-id="([^"]+)"/i)?.[1] ?? attrs.match(/bioguide-id="([^"]+)"/i)?.[1] ?? "";
    const vote = normalizeVote(textOf(block, "vote"));
    return { name, party, state, memberId, vote };
  });
}

function tally(members: ReturnType<typeof parseMemberBlocks>, partyPrefix: string) {
  let yea = 0;
  let nay = 0;
  for (const member of members) {
    if (!member.party.toLowerCase().startsWith(partyPrefix)) continue;
    if (member.vote === "Yea") yea += 1;
    if (member.vote === "Nay") nay += 1;
  }
  return { yea, nay };
}

export function parseAndNormalizeHouseXml(args: {
  xml: string;
  year: number;
  rollCall: number;
  sourceUrl: string;
  hillBioguideId?: string;
}) {
  const members = parseMemberBlocks(args.xml);
  const hill = members.find((m) => m.memberId === (args.hillBioguideId ?? "H001072"))
    ?? members.find((m) => /French Hill/i.test(m.name) && m.state === "AR");
  if (!hill?.vote) return null;

  const republican = tally(members, "r");
  const democrat = tally(members, "d");

  const congress = Number(textOf(args.xml, "congress") ?? Math.floor((args.year - 1789) / 2) + 1);
  const dateRaw = textOf(args.xml, "action-date") ?? textOf(args.xml, "vote-date") ?? "";
  const date = /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dateRaw)
    ? new Date(dateRaw).toISOString().slice(0, 10)
    : dateRaw;

  const measure = textOf(args.xml, "legis-num") ?? textOf(args.xml, "vote-desc") ?? `Roll Call ${args.rollCall}`;
  const question = textOf(args.xml, "vote-question") ?? textOf(args.xml, "vote-desc");

  return normalizeRollCall({
    congress,
    rollCall: args.rollCall,
    date,
    measure,
    question,
    hillVote: hill.vote,
    republicanYea: republican.yea,
    republicanNay: republican.nay,
    democratYea: democrat.yea,
    democratNay: democrat.nay,
    sources: [{ label: `House Clerk Roll Call ${args.rollCall}`, url: args.sourceUrl, sourceType: "house", primary: true }],
  });
}
