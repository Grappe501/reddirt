/** Rose Bud, AR — default routing origin when Kelly is home. */
export const ROSE_BUD: { lat: number; lng: number } = { lat: 35.316, lng: -92.252 };

/** Known county seats (approximate). Missing counties fall back to deterministic spread inside AR bbox (pipeline only). */
const SEATS: Record<string, { lat: number; lng: number }> = {
  Pulaski: { lat: 34.7465, lng: -92.2896 },
  Washington: { lat: 36.0626, lng: -94.1574 },
  Benton: { lat: 36.3729, lng: -94.2088 },
  Sebastian: { lat: 35.3859, lng: -94.3986 },
  Craighead: { lat: 35.8423, lng: -90.7043 },
  Garland: { lat: 34.5037, lng: -93.0552 },
  Jefferson: { lat: 34.2284, lng: -92.0032 },
  Mississippi: { lat: 35.9273, lng: -89.919 },
  Crittenden: { lat: 35.1465, lng: -90.1845 },
  Union: { lat: 33.2076, lng: -92.8346 },
  Columbia: { lat: 33.2671, lng: -93.2395 },
  Faulkner: { lat: 35.0887, lng: -92.4421 },
  Saline: { lat: 34.5645, lng: -92.5863 },
  White: { lat: 35.2506, lng: -91.7365 },
  Lonoke: { lat: 34.784, lng: -91.9 },
  Pope: { lat: 35.2784, lng: -93.1338 },
  Baxter: { lat: 36.3356, lng: -92.3854 },
  Marion: { lat: 36.2612, lng: -92.6485 },
  Boone: { lat: 36.3084, lng: -93.2518 },
  Crawford: { lat: 35.5892, lng: -94.2446 },
  Franklin: { lat: 35.5023, lng: -93.8452 },
  Johnson: { lat: 35.572, lng: -93.7285 },
  Logan: { lat: 35.3137, lng: -93.6321 },
  Yell: { lat: 35.002, lng: -93.411 },
  Perry: { lat: 35.0476, lng: -92.7938 },
  Newton: { lat: 35.92, lng: -93.218 },
  Carroll: { lat: 36.2753, lng: -93.681 },
  Madison: { lat: 36.152, lng: -93.7366 },
  Greene: { lat: 36.0606, lng: -90.4973 },
  Clay: { lat: 36.2687, lng: -90.9588 },
  Lawrence: { lat: 36.004, lng: -91.114 },
  Randolph: { lat: 36.2612, lng: -91.0376 },
  Sharp: { lat: 36.1807, lng: -91.3385 },
  Jackson: { lat: 35.5962, lng: -91.2149 },
  Independence: { lat: 35.742, lng: -91.641 },
  Izard: { lat: 36.3415, lng: -91.5549 },
  Fulton: { lat: 36.3837, lng: -91.821 },
  Searcy: { lat: 35.247, lng: -91.7335 },
  Stone: { lat: 35.8642, lng: -92.141 },
  Cleburne: { lat: 35.5123, lng: -92.031 },
  "Van Buren": { lat: 35.5959, lng: -92.4513 },
};

function hashSpread(county: string): { lat: number; lng: number } {
  let h = 2166136261;
  for (let i = 0; i < county.length; i++) {
    h ^= county.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const lat = 33.0 + (h % 2400) / 800;
  const lng = -94.6 - (h % 2000) / 700;
  return { lat, lng };
}

export function approxCountyCenter(county: string): { lat: number; lng: number } {
  const c = county.trim();
  if (SEATS[c]) return SEATS[c]!;
  return hashSpread(c);
}
