import { readFileSync } from "node:fs";

function loadKey() {
  const t = readFileSync(".env", "utf8");
  const m = t.match(/^FRED_API_KEY=(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

const key = loadKey();
const ids = [
  "TNWBSHNO",
  "BOGZ1FL152090005Q",
  "BOGZ1FL152090005A",
  "HNONWQH027S",
  "DABSHNO",
  "CMDEBT",
  "HCCSDODNS",
  "BOGZ1FL192090005Q",
  "BOGZ1FL153064105Q",
  "BOGZ1FL154190005Q",
  "BOGZ1FL153165105Q",
  "BOGZ1FL153166000Q",
];

for (const id of ids) {
  const url = `https://api.stlouisfed.org/fred/series?series_id=${id}&api_key=${encodeURIComponent(key)}&file_type=json`;
  const r = await fetch(url);
  const j = await r.json();
  const s = j.seriess?.[0];
  console.log(
    JSON.stringify({
      id,
      status: r.status,
      title: s?.title || null,
      freq: s?.frequency || null,
      units: s?.units || null,
      obs_start: s?.observation_start,
      obs_end: s?.observation_end,
      error: j.error_message || null,
    }),
  );
}
