import path from "node:path";
import type { PublicStatisticsConnector } from "../shared/contract";
import { fetchWithRetry, persistRawResponse, safeLog } from "../shared/http";
import { isUsableApiKey } from "../../env/loadPublicdataEnv";
import { resolveGeography } from "../../geography/registry";
import type {
  ConnectorValidation,
  DatasetDescriptor,
  NormalizedObservation,
  NormalizedStatisticsBatch,
  PublicStatisticsRequest,
  RawStatisticsResponse,
} from "../../types";

const SOURCE = "nass";
const BASE = "https://quickstats.nass.usda.gov/api";

function resolveNassKey(): { name: string; value: string } | null {
  for (const name of ["NASS_API_KEY", "USDA_NASS_API_KEY"] as const) {
    const v = process.env[name];
    if (isUsableApiKey(v)) return { name, value: v!.trim() };
  }
  return null;
}

function yearOnly(period: string): number {
  return Number(period.slice(0, 4));
}

function parseNassValue(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  // Suppression / withheld codes
  if (/^\([A-Z]\)$/i.test(s) || /^[A-Z]$/i.test(s)) return null;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function geographyParams(geography: string): Record<string, string> {
  if (geography === "nation") {
    return { agg_level_desc: "NATIONAL" };
  }
  if (geography === "state:05") {
    return { agg_level_desc: "STATE", state_alpha: "AR" };
  }
  const county = geography.match(/^county:(\d{5})$/);
  if (county) {
    const fips = county[1];
    const state = fips.slice(0, 2);
    const cnty = fips.slice(2);
    if (state !== "05") {
      throw new Error(`Pass 9 NASS county support is Arkansas-only; got ${geography}`);
    }
    return {
      agg_level_desc: "COUNTY",
      state_alpha: "AR",
      county_code: cnty,
    };
  }
  throw new Error(`Unsupported NASS geography: ${geography}`);
}

export function createNassConnector(opts: {
  rawRoot: string;
  commit: string | null;
}): PublicStatisticsConnector {
  return {
    source: SOURCE,
    async validateConfiguration(): Promise<ConnectorValidation> {
      const key = resolveNassKey();
      return {
        ok: Boolean(key),
        source: SOURCE,
        keyPresent: Boolean(key),
        warnings: key
          ? [
              "Production concentration ≠ market power ≠ monopsony ≠ political capture",
              "NASS establishes agricultural structure; not stronger causal claims",
              "This product uses the NASS API but is not endorsed or certified by NASS",
            ]
          : [
              "NASS_API_KEY missing — register at https://quickstats.nass.usda.gov/api",
              "API_DOT_GOV_KEY is not a Quick Stats substitute",
            ],
        errors: key
          ? []
          : ["NASS_API_KEY / USDA_NASS_API_KEY not configured or not usable"],
      };
    },
    async listSupportedDatasets(): Promise<DatasetDescriptor[]> {
      return [
        {
          code: "api_GET",
          title: "USDA NASS Quick Stats api_GET (Census/Survey aggregates)",
          frequency: "census_or_annual",
          documentationUrl: "https://quickstats.nass.usda.gov/api",
        },
      ];
    },
    async fetch(request: PublicStatisticsRequest): Promise<RawStatisticsResponse> {
      const validation = await this.validateConfiguration();
      if (!validation.ok) {
        throw new Error(validation.errors.join("; "));
      }
      const key = resolveNassKey()!;
      const dataset = request.dataset.replace(/^\/+|\/+$/g, "") || "api_GET";
      if (dataset !== "api_GET") {
        throw new Error(`Unsupported NASS dataset: ${dataset}`);
      }

      const params = new URLSearchParams();
      params.set("key", key.value);
      params.set("format", "JSON");

      const geo = geographyParams(request.geography);
      for (const [k, v] of Object.entries(geo)) params.set(k, v);

      // Manifest facets become Quick Stats parameters (first value wins).
      if (request.facets) {
        for (const [facet, values] of Object.entries(request.facets)) {
          if (!values?.length) continue;
          // Do not let facets override locked geography params unless empty.
          if (geo[facet] != null) continue;
          params.set(facet, values[0]);
        }
      }

      const start = yearOnly(request.period);
      const end = yearOnly(request.endPeriod || request.period);
      // Prefer year__GE / year__LE when multi-year; single year uses year=.
      if (start === end) {
        params.set("year", String(start));
      } else {
        params.set("year__GE", String(start));
        params.set("year__LE", String(end));
      }

      const endpoint = `${BASE}/api_GET/`;
      const url = `${endpoint}?${params.toString()}`;
      const safeParams: Record<string, string> = {
        route: dataset,
        geography: request.geography,
        series: request.variablesOrSeries.join(","),
        facets: request.facets ? JSON.stringify(request.facets) : "",
        unit: request.unit || "",
        seriesTitle: request.seriesTitle || "",
        consumerMetricId: request.consumerMetricId || "",
        period: request.period,
        endPeriod: request.endPeriod || "",
        key_env: key.name,
        // Echo non-secret query shape for provenance (no key).
        query_shape: [...params.keys()]
          .filter((k) => k !== "key")
          .sort()
          .map((k) => `${k}=${params.get(k)}`)
          .join("&"),
      };
      safeLog("nass.fetch", { endpoint, safeParams });
      const { status, text, retryCount } = await fetchWithRetry(url);
      return persistRawResponse({
        root: opts.rawRoot,
        source: SOURCE,
        endpoint,
        safeParams,
        status,
        bodyText: text,
        retryCount,
        commit: opts.commit,
      });
    },
    async normalize(response: RawStatisticsResponse): Promise<NormalizedStatisticsBatch> {
      const warnings: string[] = [];
      const dataset = response.safeParams.route || "api_GET";
      if (response.status !== 200) {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: [`NASS HTTP ${response.status}`],
        };
      }
      if (/unauthorized/i.test(response.bodyText)) {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: ["NASS unauthorized — key invalid or missing"],
        };
      }
      if (/exceeds limit/i.test(response.bodyText)) {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: ["NASS exceeds 50k row limit — narrow facets"],
        };
      }
      if (/bad request/i.test(response.bodyText)) {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: [`NASS bad request: ${response.bodyText.slice(0, 200)}`],
        };
      }

      let parsed: { data?: Array<Record<string, unknown>>; error?: string };
      try {
        parsed = JSON.parse(response.bodyText);
      } catch {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: ["Malformed NASS JSON"],
        };
      }
      if (parsed.error) warnings.push(`NASS error: ${parsed.error}`);
      const rows = parsed.data || [];
      if (!rows.length) warnings.push("NASS returned zero data rows");

      const geography = resolveGeography(response.safeParams.geography || "nation");
      const seriesHint =
        (response.safeParams.series || "").split(",")[0] ||
        response.safeParams.consumerMetricId ||
        "NASS";
      const title = response.safeParams.seriesTitle || `NASS ${seriesHint}`;
      const unit = response.safeParams.unit || "as_reported";
      const consumerMetricId = response.safeParams.consumerMetricId || undefined;
      const start = yearOnly(response.safeParams.period || "1987");
      const end = yearOnly(response.safeParams.endPeriod || response.safeParams.period || "2022");

      // Prefer annual YEAR rows; drop forecasts / month slices when YEAR exists.
      const yearRows = rows.filter((r) => {
        const y = Number(r.year);
        if (!Number.isFinite(y) || y < start || y > end) return false;
        const ref = String(r.reference_period_desc || "").toUpperCase();
        return ref === "YEAR" || ref === "";
      });
      const useRows = yearRows.length ? yearRows : rows;

      // One observation per year. Prefer TOTAL domain over PRODUCERS / size-class
      // domains; among equals, latest load_time wins.
      const domainRank = (row: Record<string, unknown>) => {
        const d = String(row.domain_desc || "").toUpperCase();
        if (d === "TOTAL") return 3;
        if (d === "PRODUCERS") return 1;
        if (d.startsWith("INVENTORY OF")) return 0;
        return 2;
      };
      const byYear = new Map<string, Record<string, unknown>>();
      for (const row of useRows) {
        const y = String(row.year ?? "");
        if (!y) continue;
        const prev = byYear.get(y);
        if (!prev) {
          byYear.set(y, row);
          continue;
        }
        const prevRank = domainRank(prev);
        const nextRank = domainRank(row);
        if (nextRank > prevRank) {
          byYear.set(y, row);
          continue;
        }
        if (nextRank < prevRank) continue;
        const prevLoad = String(prev.load_time || "");
        const nextLoad = String(row.load_time || "");
        if (nextLoad >= prevLoad) byYear.set(y, row);
      }

      const observations: NormalizedObservation[] = [];
      for (const [year, row] of [...byYear.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        const value = parseNassValue(row.Value ?? row.value);
        observations.push({
          seriesCode: seriesHint,
          seriesTitle: title,
          geographyId: geography.geographyId,
          geographyType: geography.geographyType,
          geographyName: geography.name,
          period: year,
          value,
          unit: unit || String(row.unit_desc || "as_reported"),
          estimateType: "nass_quickstats",
          definition: `USDA NASS Quick Stats ${String(row.short_desc || seriesHint)} (${String(row.source_desc || "CENSUS/SURVEY")}; ${String(row.domain_desc || "TOTAL")}${row.domaincat_desc && String(row.domaincat_desc) !== "NOT SPECIFIED" ? `; ${String(row.domaincat_desc)}` : ""})`,
          limitations: [
            "Production concentration ≠ market power ≠ monopsony ≠ political capture",
            "Census of Agriculture definitions and disclosure suppressions vary by year",
            "County aggregates can be disclosure-suppressed; do not invent missing cells",
            "NASS structure evidence does not by itself establish capture or monopsony",
          ],
          consumerMetricId,
        });
      }

      return { source: SOURCE, dataset, observations, warnings };
    },
  };
}

export function nassRawRoot(repoRoot: string): string {
  return path.join(repoRoot, "data", "public-statistics", "raw");
}
