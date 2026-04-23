import type { DocChunk } from "../../lib/content/parse";

const MAX = 12_000;

function cap(text: string): string {
  const t = text.trim();
  if (t.length <= MAX) return t;
  return `${t.slice(0, MAX)}…`;
}

const BASE = "https://www.standuparkansas.com";

/**
 * Ingested background from standuparkansas.com (grassroots / civic education org associated with Kelly & Steve Grappe’s work).
 * Search + assistant: run `npm run ingest` after changes.
 */
export function loadStandUpArkansasSearchChunks(): DocChunk[] {
  const disclaimer =
    "Source: public pages at standuparkansas.com (GoDaddy site builder). Background for the campaign assistant—not hosted on the Kelly for SOS campaign site. Third-party training links may change.";

  const home = [
    "# Stand Up Arkansas — home",
    disclaimer,
    "",
    "## Positioning",
    "“Your Hub for Grassroots Empowerment.” Welcome: in the Natural State a movement is rising; Stand Up Arkansas is described as more than an organization—a call to action for Arkansans who want a stronger, more connected community.",
    "",
    "## Help our cause (donations — as published)",
    "Donations described as funding: podcast studio, video editing equipment, secure email and SMS, central computer hub, a year of high-speed internet to reach rural Arkansas—as backbone of outreach for Arkansans fighting for change.",
    `Donate link (third party): https://smartchange.app/donate/techn-sv`,
    "",
    "## Join / sign up",
    `Google Form (as linked on site): https://docs.google.com/forms/d/1visJop5RQzZ-JvmSjj_68sAqgJncTW_P6lC_Wgz0tuM/viewform?edit_requested=true`,
    "",
    "## Branding image (header graphic)",
    "https://img1.wsimg.com/isteam/ip/76f71e81-43d9-4491-bc9e-894f9105597d/amplify%20mobilize%20participate.png/:/rs=h:100,cg:true,m/qt=q:95",
    "",
    "## Substack (blog pointer)",
    "https://substack.com/@standuparkansas",
    "",
    "Copyright notice on pages: © 2023 standuparkansas.com.",
  ].join("\n");

  const about = [
    "# Stand Up Arkansas — about us",
    `${BASE}/about-us`,
    disclaimer,
    "",
    "## Mission",
    "Empower and unite Arkansas through political organization; cultivate volunteers and leadership at every level; amplify voices toward an engaged electorate and a brighter future.",
    "",
    "## Themes",
    "Not just politics—people, leadership, shared vision of a thriving Arkansas. Every Arkansan has a voice; leaders from communities; diverse populace propels the state forward.",
    "",
    "## Recruit · Train · Activate",
    "- Recruit: army of volunteers for ballot initiatives and candidates.",
    "- Train: Engage process—plug people in by skills.",
    "- Activate: match skills to responsibilities; passion to action.",
    "",
    "## Values (as labeled on site)",
    "Inclusivity; Empowerment; Integrity; Collaboration; Continuous Learning; Democratic Principles.",
    "",
    "## Photo on about page",
    "https://img1.wsimg.com/isteam/ip/76f71e81-43d9-4491-bc9e-894f9105597d/B5BFFD38-7661-466E-8021-E11DE77BF362.jpeg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:400,cg:true",
  ].join("\n");

  const whoWeAre = [
    "# Stand Up Arkansas — who we are",
    `${BASE}/who-we-are`,
    disclaimer,
    "",
    "## Foundation of change",
    "Building lasting change from the ground up: recruit and train leaders for sustained impact—from precinct organization to school boards.",
    "",
    "## Campaign for local candidates",
    "School boards, municipal offices, up to U.S. Congress: support candidates aligned with your values; training on campaign strategy (site copy truncated in source).",
    "",
    "## Ballot initiatives and referendums",
    "Direct democracy: navigate the process, mobilize communities, influence state decisions; advocate one initiative at a time.",
    "",
    "## Graphic",
    "https://img1.wsimg.com/isteam/ip/76f71e81-43d9-4491-bc9e-894f9105597d/PEOPLE%20POWERED-f612233.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25",
  ].join("\n");

  const civicHub = [
    "# Stand Up Arkansas — civic education hub (People Powered)",
    `${BASE}/civic-education-hub`,
    disclaimer,
    "",
    "Welcome to the civic education hub. Modules link out to external training sites (Netlify, Articulate, etc.). Summaries are from the standuparkansas.com page.",
    "",
    "## Power of 5 (relational organizing)",
    "https://powerof5.netlify.app/",
    "People Powered civic activation: relational organizing rooted in community—not campaigns; activate your Power of 5; grow volunteers into leaders.",
    "",
    "## Arkansas FOIA guide (Articulate course)",
    "https://rise.articulate.com/share/1Tycofg-4f_5WLijC63sTet1ZKkoJfu_",
    "Arkansas Freedom of Information Act: why it matters, what records to request, how to file, what if denied—described as one of the strongest transparency laws in the country.",
    "",
    "## Four phases for high-performance teams",
    "https://buildingateam.netlify.app/",
    "Leaders bringing teams to highest potential; teams don’t gel overnight; facilitate performance together.",
    "",
    "## Uncomfortable conversations (Zachary Wood / Uncensored)",
    "https://share.articulate.com/Ae68uDycbuYTw4Q-DWZzl",
    "Nine-step process for difficult conversations on controversial issues; strategies before, during, after dialogue.",
    "",
    "## City government in Arkansas",
    "https://aquamarine-paletas-580319.netlify.app/#/",
    "People Powered series: how city government shapes daily life; real Arkansas examples; who holds power; how decisions get made.",
    "",
    "## Running for office (NAACP — Seat at the Table)",
    "https://runforofficenaacp.netlify.app/#/",
    "Preparing NAACP members to run; ground-up training for everyday Arkansans entering public service.",
    "",
    "## Jacksonville at-large voting",
    "https://jaxatlarge.standuparkansas.com/",
    "Critique of at-large system diluting neighborhood power; equity and accountability; every neighborhood deserves a voice.",
    "",
    "## AMP’d — activate civic power (with Phat Lip Radio)",
    "https://yourcivicpower.netlify.app/#/",
    "Built for Arkansans; with Phat Lip Radio; first step to turn up voice, power, future—not a lecture.",
    "",
    "## Creating social change in Arkansas",
    "https://creatingsocialchange.netlify.app/",
    "Marginalized groups facing barriers; shared responsibility to fix what’s broken; how you can help.",
    "",
    "## Ozark Forward team — running for office guide",
    "https://ozarkforwardtraining.standuparkansas.com/",
    "Free self-paced course for Ozark Forward (north central Arkansas).",
    "",
    "## Hub tile images (examples)",
    "Various PEOPLE POWERED PNG assets on img1.wsimg.com under the same isteam id as other Stand Up Arkansas graphics.",
  ].join("\n");

  const blogRegnat = [
    "# Stand Up Arkansas blog — Regnat Populus letter (Steve and Kelly Grappe)",
    `${BASE}/blog`,
    disclaimer,
    "",
    "Signed Regnat Populus, Steve and Kelly Grappe, Stand Up Arkansas.",
    "",
    "## Educational Rights Amendment / For AR Kids (campaign retrospective)",
    "Gratitude to volunteers on the Educational Rights Amendment campaign—weather, protesters, obstruction; legal action for 1st and 14th amendment rights; shortened timeline; AG delay of ~four months.",
    "Organized 68 of 75 counties; minimum signatures met in 55 counties (exceeds 50-county rule); fell short of total signature count; strong statewide network of education and democracy leaders.",
    "",
    "## Forward plan (as stated on site)",
    "- For AR Kids Coalition to refile for 2026 ballot; submit petition in coming weeks; gather until July 2026; expect smoother AG path after prior approval.",
    "- Break amendment into segments for General Assembly legislation.",
    "- Use supporter database to pressure legislators; multi-directional approach to education.",
    "- Strengthen volunteer network.",
    "- Debriefs, town halls; Kelly and Steve to visit towns.",
    "",
    "## Policy themes mentioned",
    "Universal pre-K access; accountability for private schools taking public funds; equitable education system.",
    "",
    "## Social / community",
    "Biweekly Friday “meeting of the minds” — Kelly dubbed “Mind Meld(t) with Margaritas and Cheese Dip” at Casa Mañana, 6820 Cantrell Rd, Little Rock; first date cited July 19th.",
  ].join("\n");

  const blogDirectDemocracy = [
    "# Stand Up Arkansas blog — direct democracy in Arkansas (explainer)",
    `${BASE}/blog`,
    disclaimer,
    "",
    "## Referendum and initiatives",
    "Arkansas tradition of direct democracy; constitution integration early 1900s. Referendum: vote on measures from legislature. Initiatives: citizens propose laws; draft, gather signatures (% of last governor vote), submit to Secretary of State for verification.",
    "",
    "## Citizen actions",
    "Wide issue range; ForARKids cited; ForArKids.org for volunteer/sign (as written on site—verify current URLs independently).",
    "",
    "## Comparison",
    "~24 states + DC allow some form of ballot initiatives.",
    "",
    "## Educational Rights Amendment 2024",
    "Example cited: requiring 90,000+ signatures for November ballot (historical snapshot from page copy).",
  ].join("\n");

  const blogVoices = [
    "# Stand Up Arkansas blog — teacher appreciation & Kelly Grappe perspective",
    `${BASE}/blog`,
    disclaimer,
    "",
    "## Teacher appreciation",
    "Kelly reflects on public schools as community heartbeat; teachers as role models; gratitude to educators including Davis Hendricks, Betty Young, Jeanie Gray, Dr. Claudia Beach, Winifred Baker.",
    "",
    "## Waiting for the Pot to Boil — Kelly Grappe",
    "Arkansas movement metaphor (water about to boil); pandemic and divisiveness; reconnection; diversity of thought; new leaders stepping up; nontraditional candidates (teachers, therapists, etc.); turn up heat and music—be ready when change comes.",
  ].join("\n");

  const inTheMedia = [
    "# Stand Up Arkansas — in the media",
    `${BASE}/in-the-media`,
    disclaimer,
    "",
    "## January 18, 2024",
    "Public education advocates ForARKids submit revised measure — https://www.forarkids.org/for-ar-kids-in-the-news",
    "",
    "## December 21, 2023",
    "KUAR — Arkansas coalition submits measure to amend state Constitution’s education clause: https://www.ualrpublicradio.org/local-regional-news/2023-12-21/arkansas-coalition-submits-measure-to-amend-state-constitutions-education-clause",
    "",
    "Arkansas Times — universal pre-K and transparency for public education dollars: https://arktimes.com/arkansas-blog/2023/12/21/coalition-aims-to-guarantee-universal-pre-k-and-compel-transparency-for-public-education-dollars",
    "",
    "ForARKids press page: https://www.forarkids.org/for-ar-kids-in-the-news/public-education-advocates-for-ar-kids-submit-revised-ballot-measure-to-attorney-general",
  ].join("\n");

  return [
    { path: `external:${BASE}/`, title: "Stand Up Arkansas — home", chunkIndex: 0, content: cap(home) },
    { path: `external:${BASE}/about-us`, title: "Stand Up Arkansas — about", chunkIndex: 0, content: cap(about) },
    { path: `external:${BASE}/who-we-are`, title: "Stand Up Arkansas — who we are", chunkIndex: 0, content: cap(whoWeAre) },
    { path: `external:${BASE}/civic-education-hub`, title: "Stand Up Arkansas — civic education hub", chunkIndex: 0, content: cap(civicHub) },
    { path: `external:${BASE}/blog`, title: "Stand Up Arkansas — blog (Regnat Populus)", chunkIndex: 0, content: cap(blogRegnat) },
    { path: `external:${BASE}/blog`, title: "Stand Up Arkansas — blog (direct democracy)", chunkIndex: 1, content: cap(blogDirectDemocracy) },
    { path: `external:${BASE}/blog`, title: "Stand Up Arkansas — blog (teachers & perspective)", chunkIndex: 2, content: cap(blogVoices) },
    { path: `external:${BASE}/in-the-media`, title: "Stand Up Arkansas — in the media", chunkIndex: 0, content: cap(inTheMedia) },
  ];
}
