import type { DocChunk } from "../../lib/content/parse";

const MAX = 12_000;

function cap(text: string): string {
  const t = text.trim();
  if (t.length <= MAX) return t;
  return `${t.slice(0, MAX)}…`;
}

const BASE = "https://www.forevermostfarms.com";

/**
 * Ingested background from forevermostfarms.com (Kelly & Steve Grappe’s farm site).
 * Wires into site search / campaign assistant via `loadFullSiteSearchChunks` → embeddings on `npm run ingest`.
 */
export function loadForevermostFarmsSearchChunks(): DocChunk[] {
  const disclaimer =
    "Source: public pages at forevermostfarms.com (Squarespace). Background for the campaign assistant—not a page on the Kelly for SOS site.";

  const home = [
    "# Forevermost Farms — home",
    disclaimer,
    "",
    "## How the site introduces the farm",
    "Welcome to Forevermost Farms.",
    "",
    "For years the farm was fully operational—raising high-quality chickens, turkey, pork and quail, sharing what they learned, and building something they believed in.",
    "",
    "Like many small farms, rising costs after COVID forced a pause in operations. While not currently selling birds, the farm is still present—sharing life on the farm through social media, what they’re learning, and the rhythms of the land.",
    "",
    "Kelly is running for Arkansas Secretary of State; that campaign work, along with her day job, has become a primary focus for Kelly and Steve.",
    "",
    "Forevermost is framed as more than farming: resilience, stewardship, and staying rooted in what matters.",
    "",
    "Visitors are invited to follow on Facebook for what’s happening on the farm.",
    "",
    "## Tagline (site)",
    "A farm we call home between Romance and Joy.",
    "",
    "## Contact (as published on site)",
    "Location: Rose Bud, AR 72137",
    "Email: Forevermostfarms@gmail.com",
    "Phone: (501) 690-8227",
    "",
    "## Images referenced on the live homepage (Squarespace CDN)",
    "Logo: https://images.squarespace-cdn.com/content/v1/5c087de7d274cb2f2a8ef230/1550878633179-8BC58GAJ1O6VL2N26MNG/Forevermost+Farms+Logo.jpg",
    "Hero / farm photo: https://images.squarespace-cdn.com/content/v1/5c087de7d274cb2f2a8ef230/1741917146085-SOP8WN5S35M6HX73TIB6/IMG_2238.jpeg",
    "Additional photography appears across blog posts; URLs noted on featured posts below.",
    "",
    "## Pull quote on site",
    "“If you don’t like the road you’re walking on, start paving another one.” — Dolly Parton",
  ].join("\n");

  const about = [
    "# Forevermost Farms — about",
    disclaimer,
    "",
    "## Know your farmer. Know your food.",
    "The farming adventure began in 2018 shortly after Kelly and Steve married. After years in the corporate world they wanted a different lifestyle, tried several types of farming, and found passion in regenerative ranching.",
    "",
    "They raised chickens, turkeys and pigs and sold products primarily in central Arkansas. Commercial operations were ultimately paused; they remain on the land and still love it.",
  ].join("\n");

  const blogIndex = [
    "# Forevermost Farms — blog index & teasers (“From the Heart”)",
    disclaimer,
    "",
    "Blog lives at /blog. Authors include Kelly Grappe and Steve Grappe. Selected posts and URLs:",
    "",
    "## 2021",
    `- State of the Farm - 2021 — ${BASE}/blog/2021/2/3/ad72f0j385b1234tvq1iy4yl7navkx`,
    "",
    "## 2020",
    `- To Everything there is a Season — ${BASE}/blog/2020/10/11/jao9kqztqeszl0uw8j50cyfaohl9va`,
    `- Why We Do What We Do — ${BASE}/blog/2020/7/7/why-we-do-what-we-do`,
    `- Teaser (Jan 26): Steve teaching Grace to make “Grappe Gumbo,” a New Year’s Eve tradition — ${BASE}/blog/2021/1/26/cqidmfxef087a6u5pivcl95bw6bxci`,
    `- 500 baby chickens / “all in” on chickens (March batch, lessons from scale) — ${BASE}/blog/500littleblessings`,
    `- A Sad Day on the Farm (Elvis the rooster) — ${BASE}/blog/2020/2/14/a-sad-day-on-the-farm`,
    `- A Big Hunk O' Love (Elvis the rooster, not the King) — ${BASE}/blog/elvis`,
    `- Duct Tape, Floral Wire & Pretty Ribbon (holiday crafts / bows tradition) — ${BASE}/blog/2019/10/27/duct-tape-floral-wire-amp-pretty-ribbon`,
    `- Three Chords & the Truth (country music, Craig Morgan song) — ${BASE}/blog/2019/10/20/three-chords-amp-the-truth`,
    `- Harvest day / self-sufficiency and processing animals — ${BASE}/blog/2019/10/1/harvest-day`,
    `- Sisterhood prayer excerpt — ${BASE}/blog/2019/9/22/sisterhood`,
    `- Stuff happens (Steve) — ${BASE}/blog/2019/8/29/stuff-happens`,
    `- Back to school / love of school supplies — ${BASE}/blog/2019/8/15/back-to-school`,
    `- The Meraki Charcuterie (friends’ visit, food) — ${BASE}/blog/2019/8/5/the-meraki-charcuterie`,
    `- Keeping the Faith - A Story of Chicken Love — ${BASE}/blog/2019/7/26/keeping-the-faith-a-story-of-chicken-love`,
    `- Living in a dream (Steve) — ${BASE}/blog/2019/7/24/living-in-a-dream`,
    "",
    "## Teasers preserved from index (short)",
    "February 2021: annual “vision” post—goals on paper, gratitude to mentors (Grass Roots Farmers Co-Op, Natural State Processing, Heifer USA, Cypress Valley, etc.).",
    "October 2020: reflection on hunting, harvest, and learning to participate in raising meat for the table.",
    "July 2020: full essay on pasture-raised poultry, transparency, non-GMO feed, USDA processing in Clinton AR, delivery in customer coolers, cost structure, gratitude for customers (~42k chicken meals that year, plus pigs/turkeys).",
  ].join("\n");

  const whyWeDo = [
    "# Blog: Why We Do What We Do (July 7, 2020)",
    `${BASE}/blog/2020/7/7/why-we-do-what-we-do`,
    disclaimer,
    "",
    "Kelly describes buying the farm without growing up on one; grandfather farmed; odds against small farmers; belief in prayer, positivity, hard work.",
    "",
    "First year: experiments—crafts, soaps, bath products, chickens, pigs, rabbits, turkeys, goats, meal worms; large garden; buildings and renovations; learning what they want to raise.",
    "",
    "Decision in January: focus on chickens—commercial brooder, 20x50 schooner, feed, chicks, grain bin, tractor; ongoing electrical/freezer work. Pasture-raised approach: dignity for animals, land regeneration, transparency with customers.",
    "",
    "Six numbered transparency points on cost and practices: small batches (500–700), hand feeding/water 2–3x daily, non-GMO feed transported ~170 miles, brooder then daily pasture moves (video on Facebook), USDA processing Clinton AR ($3–5/bird), home delivery in customer coolers, taste feedback.",
    "",
    "Hard costs cited as more than $11/bird before capital, utilities, labor; two full-time (Kelly and Steve) and one part-time teen; long hours, limited time away during peak season—framed as gratitude, not complaint.",
    "",
    "Closing: ~42,000 meals from chicken that year; pigs and turkeys add ~11,000 meals; honor and responsibility for food on family tables.",
    "",
    "## Image URL (social share / Pinterest from post)",
    "https://images.squarespace-cdn.com/content/v1/5c087de7d274cb2f2a8ef230/1594170310247-W3PYV9X58BGVHYAUV0QQ/baby+chick.jpg",
  ].join("\n");

  const state2021 = [
    "# Blog: State of the Farm - 2021 (Feb 3, 2021)",
    `${BASE}/blog/2021/2/3/ad72f0j385b1234tvq1iy4yl7navkx`,
    disclaimer,
    "",
    "Annual vision post: chickens (~3000 prior year; plan 2400; wholesale + delivery; ground chicken; chicks in March–November); gratitude to Grass Roots, Natural State Processing, Heifer USA.",
    "",
    "Hogs: growth from 5 to 17 to plan of 90 in 2021; USDA processing reservations 12–18 months out; partners including Cypress Valley, Perry McChesney for feeder pigs.",
    "",
    "Turkeys: lessons from early losses; 100 then plan for 900; ground turkey and sausage; whole birds for holidays; early orders encouraged.",
    "",
    "Beef: partnership with Providence Farms (Perry and Colby) for beef aligned with their values; retail cuts and shares; Cypress Valley for cut sheets.",
    "",
    "Hatchery / Chicken Ranch: specialty breeds, incubator, breeds listed (Black Copper Marans, Golden Cuckoo Marans, Splash Marans, Olive Eggers, Cream Legbars, Appenzellar Spitzhauben, Red Jungle Fowl, White Crested Polish, Golden Sebright, Ayam Cemani, etc.); Scott Stewart coops in Mountain View; Steve interested in genetics.",
    "",
    "Community: Mighty Rib, customer reviews, Arkansas Farmers for the People on Facebook, St Joseph’s Farm stand, Me and McGee / Southern Standard food truck.",
    "",
    "Personal: pandemic, missing hugs from parents; hopes for farm events; Hootenanny Oct 30 with David Adam Byrnes; Goodnight Goat storytime; planned YouTube.",
    "",
    "Mom’s line: “What I am looking for is looking for me.”",
    "",
    "## Image URL (share)",
    "https://images.squarespace-cdn.com/content/v1/5c087de7d274cb2f2a8ef230/1612351226180-0SK4T7PJ5HQL5NC6HUF3/IMG_5445.jpeg",
  ].join("\n");

  return [
    { path: `external:${BASE}/`, title: "Forevermost Farms — home & contact", chunkIndex: 0, content: cap(home) },
    { path: `external:${BASE}/about`, title: "Forevermost Farms — about", chunkIndex: 0, content: cap(about) },
    { path: `external:${BASE}/blog`, title: "Forevermost Farms — blog index", chunkIndex: 0, content: cap(blogIndex) },
    {
      path: `external:${BASE}/blog/2020/7/7/why-we-do-what-we-do`,
      title: "Forevermost Farms — Why We Do What We Do",
      chunkIndex: 0,
      content: cap(whyWeDo),
    },
    {
      path: `external:${BASE}/blog/2021/2/3/ad72f0j385b1234tvq1iy4yl7navkx`,
      title: "Forevermost Farms — State of the Farm 2021",
      chunkIndex: 0,
      content: cap(state2021),
    },
  ];
}
