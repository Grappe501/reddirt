/**
 * Headless screenshot pack for launch QA (Chrome/Edge if available).
 * Saves under H:/SOSWebsite/.local/temp/launch-qa-screenshots/
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const base = process.argv[2] || "http://127.0.0.1:3456";
const outDir = path.join("H:", "SOSWebsite", ".local", "temp", "launch-qa-screenshots");
fs.mkdirSync(outDir, { recursive: true });

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

const chrome = chromeCandidates.find((p) => fs.existsSync(p));
if (!chrome) {
  console.error("No Chrome/Edge found for headless screenshots.");
  process.exit(2);
}

const shots = [
  { name: "home-desktop", url: `${base}/`, w: 1440, h: 900 },
  { name: "home-tablet", url: `${base}/`, w: 768, h: 1024 },
  { name: "home-mobile", url: `${base}/`, w: 390, h: 844 },
  { name: "about-desktop", url: `${base}/about`, w: 1440, h: 900 },
  { name: "about-mobile", url: `${base}/about`, w: 390, h: 844 },
  { name: "priorities-desktop", url: `${base}/priorities`, w: 1440, h: 900 },
  { name: "priorities-mobile", url: `${base}/priorities`, w: 390, h: 844 },
  { name: "journey-desktop", url: `${base}/about/journey`, w: 1440, h: 900 },
  { name: "get-involved-mobile", url: `${base}/get-involved`, w: 390, h: 844 },
  { name: "campaign-photos-desktop", url: `${base}/campaign-photos`, w: 1440, h: 900 },
];

let ok = 0;
for (const shot of shots) {
  const file = path.join(outDir, `${shot.name}.png`);
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--window-size=${shot.w},${shot.h}`,
    `--screenshot=${file}`,
    shot.url,
  ];
  const r = spawnSync(chrome, args, { encoding: "utf8", timeout: 90000 });
  if (r.status === 0 && fs.existsSync(file) && fs.statSync(file).size > 1000) {
    console.log(`OK ${shot.name} (${fs.statSync(file).size} bytes)`);
    ok += 1;
  } else {
    console.log(`FAIL ${shot.name} status=${r.status} stderr=${(r.stderr || "").slice(0, 200)}`);
  }
}

console.log(`screenshots=${ok}/${shots.length} dir=${outDir}`);
if (ok < shots.length) process.exitCode = 1;
