/**
 * Queue of extras to attach when the next matching city/county stop is added.
 * Used by apply-kelly-visit-edits (editor + scripts) and the local visits editor UI.
 */
const fs = require("node:fs");
const path = require("node:path");

const queuePath = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "kelly-county-visits",
  "pending-attachments.json",
);

function todayAsOf() {
  return process.env.KELLY_VISITS_AS_OF?.trim() || new Date().toISOString().slice(0, 10);
}

function loadQueue() {
  return JSON.parse(fs.readFileSync(queuePath, "utf8"));
}

function saveQueue(data) {
  data.updatedAt = todayAsOf();
  fs.writeFileSync(queuePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function openItems(data) {
  return (data.items || []).filter((item) => item.status === "open");
}

function matchesAttachment(item, stop) {
  if (!item || item.status !== "open" || !stop) return false;

  const city = String(stop.city || "")
    .trim()
    .toLowerCase();
  const counties = Array.isArray(stop.counties)
    ? stop.counties.map((c) => String(c).trim()).filter(Boolean)
    : [];
  const matchCities = (item.match?.cities || []).map((c) => String(c).trim().toLowerCase());
  const matchCounties = (item.match?.counties || []).map((c) => String(c).trim());

  const cityHit = Boolean(city && matchCities.includes(city));
  const countyHit = counties.some((c) => matchCounties.includes(c));
  if (!cityHit && !countyHit) return false;

  if (item.requireUpcoming && stop.date && stop.date < todayAsOf()) return false;

  if (item.skipIfPrivate) {
    if (stop.status === "private" || stop.includeOnPublicPage === false) return false;
  }

  const titleBlob = `${stop.title || ""} ${stop.publicTitle || ""}`.toLowerCase();
  for (const needle of item.skipIfTitleIncludes || []) {
    if (needle && titleBlob.includes(String(needle).toLowerCase())) return false;
  }

  return true;
}

function matchingOpenItems(stop, data) {
  return openItems(data || loadQueue()).filter((item) => matchesAttachment(item, stop));
}

function markAttached(itemId, { hostStopId, companionStopId }) {
  const data = loadQueue();
  const item = (data.items || []).find((row) => row.id === itemId);
  if (!item) return null;
  item.status = "attached";
  item.attachedToStopId = hostStopId || null;
  item.attachedCompanionId = companionStopId || null;
  item.attachedOn = todayAsOf();
  saveQueue(data);
  return item;
}

module.exports = {
  queuePath,
  loadQueue,
  saveQueue,
  openItems,
  matchesAttachment,
  matchingOpenItems,
  markAttached,
};
