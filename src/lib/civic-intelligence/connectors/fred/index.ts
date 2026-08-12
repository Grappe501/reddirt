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

const SOURCE = "fred";
const BASE = "https://api.stlouisfed.org/fred";
const BASE_V2 = "https://api.stlouisfed.org/fred/v2";

function keyPresent(): boolean {
  return isUsableApiKey(process.env.FRED_API_KEY);
}

function toFredObservationDate(period: string): string {
  // Accept YYYY, YYYY-Qn, YYYY-MM, or YYYY-MM-DD
  const q = period.match(/^(\d{4})-Q([1-4])$/i);
  if (q) {
    const year = Number(q[1]);
    const quarter = Number(q[2]);
    const month = (quarter - 1) * 3 + 1;
    return `${year}-${String(month).padStart(2, "0")}-01`;
  }
  if (/^\d{4}-\d{2}$/.test(period)) return `${period}-01`;
  if (/^\d{4}$/.test(period)) return `${period}-01-01`;
  return period.slice(0, 10);
}

function periodFromFredDate(date: string, frequency: string): string {
  const [y, m] = date.split("-").map(Number);
  const freq = (frequency || "").toLowerCase();
  if (freq.startsWith("q")) {
    const q = Math.floor((m - 1) / 3) + 1;
    return `${y}-Q${q}`;
  }
  if (freq.startsWith("m")) {
    return `${y}-${String(m).padStart(2, "0")}`;
  }
  return String(y);
}

function fredAuthHeaders(apiKey: string): Record<string, string> {
  // FRED v2 release endpoints require Bearer; v1 series still uses query api_key.
  return { Authorization: `Bearer ${apiKey}` };
}

export type FredReleaseSeriesPage = {
  series_id: string;
  title: string;
  frequency: string;
  units: string;
  seasonal_adjustment?: string;
  notes?: string;
  observations: Array<{ date?: string; value?: string }>;
};

export type FredReleaseObservationsResult = {
  releaseId: number;
  releaseName: string;
  producerName: string;
  producerUrl: string;
  pages: number;
  series: Map<string, FredReleaseSeriesPage>;
  warnings: string[];
};

/**
 * Page through fred/v2/release/observations until complete or whitelist satisfied.
 * Does not log credentials.
 */
export async function fetchFredReleaseObservations(opts: {
  releaseId: number;
  apiKey: string;
  whitelistSeriesIds?: Set<string>;
  limitPerPage?: number;
  maxPages?: number;
  stopWhenWhitelistComplete?: boolean;
}): Promise<FredReleaseObservationsResult> {
  const whitelist = opts.whitelistSeriesIds;
  const limit = opts.limitPerPage ?? 50000;
  const maxPages = opts.maxPages ?? 200;
  const stopEarly = opts.stopWhenWhitelistComplete !== false && !!whitelist?.size;

  const series = new Map<string, FredReleaseSeriesPage>();
  const warnings: string[] = [];
  let cursor: string | null = null;
  let pages = 0;
  let releaseName = "";
  let producerName = "Board of Governors of the Federal Reserve System (US)";
  let producerUrl = "https://www.federalreserve.gov/";

  while (pages < maxPages) {
    const url = new URL(`${BASE_V2}/release/observations`);
    url.searchParams.set("release_id", String(opts.releaseId));
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", String(limit));
    if (cursor) url.searchParams.set("next_cursor", cursor);

    safeLog("fred.release.fetch_page", {
      release_id: String(opts.releaseId),
      page: String(pages + 1),
      has_cursor: cursor ? "1" : "0",
      whitelist_remaining: whitelist
        ? String([...whitelist].filter((id) => !series.has(id)).length)
        : "n/a",
    });

    const { status, text } = await fetchWithRetry(url.toString(), {
      headers: fredAuthHeaders(opts.apiKey),
      timeoutMs: 120_000,
    });
    pages += 1;
    if (status !== 200) {
      warnings.push(`FRED v2 release/observations HTTP ${status} on page ${pages}`);
      break;
    }
    let parsed: {
      has_more?: boolean | string;
      next_cursor?: string;
      release?: {
        name?: string;
        sources?: Array<{ name?: string; url?: string }>;
      };
      series?: FredReleaseSeriesPage[];
      error_message?: string;
    };
    try {
      parsed = JSON.parse(text);
    } catch {
      warnings.push(`Malformed FRED v2 JSON on page ${pages}`);
      break;
    }
    if (parsed.error_message) warnings.push(parsed.error_message);
    if (parsed.release?.name) releaseName = parsed.release.name;
    if (parsed.release?.sources?.[0]?.name) producerName = parsed.release.sources[0].name!;
    if (parsed.release?.sources?.[0]?.url) producerUrl = parsed.release.sources[0].url!;

    for (const s of parsed.series || []) {
      const id = String(s.series_id || "").trim();
      if (!id) continue;
      if (whitelist && !whitelist.has(id)) continue;
      const prev = series.get(id);
      if (!prev) {
        series.set(id, {
          series_id: id,
          title: s.title,
          frequency: s.frequency,
          units: s.units,
          seasonal_adjustment: s.seasonal_adjustment,
          notes: s.notes,
          observations: [...(s.observations || [])],
        });
      } else {
        // Continuation page may resume the same series mid-history.
        prev.observations.push(...(s.observations || []));
      }
    }

    if (stopEarly && whitelist && [...whitelist].every((id) => series.has(id))) {
      break;
    }
    const hasMore = parsed.has_more === true || parsed.has_more === "true";
    if (!hasMore) break;
    cursor = parsed.next_cursor || null;
    if (!cursor) break;
  }

  if (whitelist) {
    for (const id of whitelist) {
      if (!series.has(id)) warnings.push(`Whitelist series not found in release ${opts.releaseId}: ${id}`);
    }
  }

  return {
    releaseId: opts.releaseId,
    releaseName,
    producerName,
    producerUrl,
    pages,
    series,
    warnings,
  };
}

export function createFredConnector(opts: {
  rawRoot: string;
  commit: string | null;
}): PublicStatisticsConnector {
  return {
    source: SOURCE,
    async validateConfiguration(): Promise<ConnectorValidation> {
      const present = keyPresent();
      return {
        ok: present,
        source: SOURCE,
        keyPresent: present,
        warnings: present
          ? [
              "FRED is a distribution channel — original producers (Fed DFA, BEA, etc.) remain the provenance agencies.",
              "FRED v2 release/observations uses Authorization Bearer; v1 series/observations uses query api_key.",
              "Wealth shares ≠ causal market power or political capture.",
            ]
          : ["FRED_API_KEY missing — register at https://fred.stlouisfed.org/docs/api/api_key.html"],
        errors: present ? [] : ["FRED_API_KEY not configured or not usable"],
      };
    },
    async listSupportedDatasets(): Promise<DatasetDescriptor[]> {
      return [
        {
          code: "series/observations",
          title: "FRED series observations (v1)",
          frequency: "varies",
          documentationUrl: "https://fred.stlouisfed.org/docs/api/fred/",
        },
        {
          code: "release/observations",
          title: "FRED release observations (v2, cursor-paginated)",
          frequency: "varies",
          documentationUrl: "https://fred.stlouisfed.org/docs/api/fred/",
        },
      ];
    },
    async fetch(request: PublicStatisticsRequest): Promise<RawStatisticsResponse> {
      const validation = await this.validateConfiguration();
      if (!validation.ok) {
        throw new Error(validation.errors.join("; "));
      }
      const apiKey = process.env.FRED_API_KEY!.trim();
      const dataset = (request.dataset || "series/observations").trim();

      if (dataset === "release/observations" || dataset === "v2/release/observations") {
        const releaseId = Number(request.variablesOrSeries[0] || 0);
        const seriesFilter = (request.variablesOrSeries[1] || "").trim();
        if (!Number.isFinite(releaseId) || releaseId <= 0) {
          throw new Error("FRED release/observations requires variablesOrSeries[0] = release_id");
        }
        const whitelist = seriesFilter ? new Set([seriesFilter]) : undefined;
        const result = await fetchFredReleaseObservations({
          releaseId,
          apiKey,
          whitelistSeriesIds: whitelist,
          stopWhenWhitelistComplete: !!whitelist,
        });
        const body = {
          release: {
            release_id: result.releaseId,
            name: result.releaseName,
            sources: [{ name: result.producerName, url: result.producerUrl }],
          },
          pages: result.pages,
          warnings: result.warnings,
          series: [...result.series.values()],
        };
        const endpoint = `${BASE_V2}/release/observations`;
        const safeParams: Record<string, string> = {
          route: "release/observations",
          release_id: String(releaseId),
          series: seriesFilter,
          geography: request.geography,
          unit: request.unit || "",
          seriesTitle: request.seriesTitle || "",
          consumerMetricId: request.consumerMetricId || "",
          producer: result.producerName,
          pages: String(result.pages),
          key_env: "FRED_API_KEY",
          auth: "Authorization_Bearer",
        };
        safeLog("fred.fetch", { endpoint, safeParams });
        return persistRawResponse({
          root: opts.rawRoot,
          source: SOURCE,
          endpoint,
          safeParams,
          status: result.series.size > 0 ? 200 : 404,
          bodyText: JSON.stringify(body),
          retryCount: 0,
          commit: opts.commit,
        });
      }

      const seriesId = (request.variablesOrSeries[0] || "").trim();
      if (!seriesId) throw new Error("FRED request requires variablesOrSeries[0] = series_id");

      const frequency = request.frequency || "a";
      const params = new URLSearchParams();
      params.set("series_id", seriesId);
      params.set("api_key", apiKey);
      params.set("file_type", "json");
      params.set("observation_start", toFredObservationDate(request.period));
      params.set(
        "observation_end",
        toFredObservationDate(request.endPeriod || request.period),
      );
      if (frequency && frequency !== "native") {
        if (["a", "q", "m"].includes(frequency.toLowerCase())) {
          params.set("frequency", frequency.toLowerCase());
          params.set("aggregation_method", "eop");
        }
      }

      const endpoint = `${BASE}/series/observations`;
      const url = `${endpoint}?${params.toString()}`;
      const safeParams: Record<string, string> = {
        route: "series/observations",
        geography: request.geography,
        series: seriesId,
        unit: request.unit || "",
        seriesTitle: request.seriesTitle || "",
        consumerMetricId: request.consumerMetricId || "",
        period: request.period,
        endPeriod: request.endPeriod || "",
        frequency: frequency,
        key_env: "FRED_API_KEY",
        query_shape: [...params.keys()]
          .filter((k) => k !== "api_key")
          .sort()
          .map((k) => `${k}=${params.get(k)}`)
          .join("&"),
      };
      safeLog("fred.fetch", { endpoint, safeParams });
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
      const dataset = response.safeParams.route || "series/observations";
      if (response.status !== 200) {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: [`FRED HTTP ${response.status}`],
        };
      }

      const geography = resolveGeography(response.safeParams.geography || "nation");
      const consumerMetricId = response.safeParams.consumerMetricId || undefined;

      if (dataset === "release/observations") {
        let parsed: {
          warnings?: string[];
          series?: FredReleaseSeriesPage[];
          release?: { sources?: Array<{ name?: string }> };
        };
        try {
          parsed = JSON.parse(response.bodyText);
        } catch {
          return {
            source: SOURCE,
            dataset,
            observations: [],
            warnings: ["Malformed FRED release JSON"],
          };
        }
        if (parsed.warnings?.length) warnings.push(...parsed.warnings);
        const producer =
          response.safeParams.producer ||
          parsed.release?.sources?.[0]?.name ||
          "Board of Governors of the Federal Reserve System (US)";
        const filterSeries = response.safeParams.series || "";
        const observations: NormalizedObservation[] = [];
        for (const s of parsed.series || []) {
          if (filterSeries && s.series_id !== filterSeries) continue;
          const freq = s.frequency || "Quarterly";
          const unit = response.safeParams.unit || s.units || "as_reported";
          for (const row of s.observations || []) {
            const date = String(row.date || "");
            const raw = String(row.value ?? "").trim();
            if (!date || raw === "." || raw === "") continue;
            const value = Number(raw);
            if (!Number.isFinite(value)) continue;
            observations.push({
              seriesCode: s.series_id,
              seriesTitle: s.title,
              geographyId: geography.geographyId,
              geographyName: geography.name,
              geographyType: geography.geographyType,
              period: periodFromFredDate(date, freq),
              value,
              unit,
              estimateType: "observation",
              definition: `FRED v2 release observations for ${s.series_id}; producing agency: ${producer}`,
              limitations: [
                "FRED redistributes Z.1/agency series. Structure/history ≠ local ownership, market power, or political capture.",
              ],
              consumerMetricId,
            });
          }
        }
        if (!observations.length) warnings.push("FRED release returned zero matching observations");
        return { source: SOURCE, dataset, observations, warnings };
      }

      let parsed: {
        observations?: Array<{ date?: string; value?: string }>;
        error_message?: string;
      };
      try {
        parsed = JSON.parse(response.bodyText);
      } catch {
        return {
          source: SOURCE,
          dataset,
          observations: [],
          warnings: ["Malformed FRED JSON"],
        };
      }
      if (parsed.error_message) warnings.push(`FRED error: ${parsed.error_message}`);
      const rows = parsed.observations || [];
      if (!rows.length) warnings.push("FRED returned zero observations");

      const seriesCode = response.safeParams.series || "FRED";
      const title = response.safeParams.seriesTitle || `FRED ${seriesCode}`;
      const unit = response.safeParams.unit || "as_reported";
      const frequency = response.safeParams.frequency || "a";

      const observations: NormalizedObservation[] = [];
      for (const row of rows) {
        const date = String(row.date || "");
        const raw = String(row.value ?? "").trim();
        if (!date || raw === "." || raw === "") continue;
        const value = Number(raw);
        if (!Number.isFinite(value)) continue;
        observations.push({
          seriesCode,
          seriesTitle: title,
          geographyId: geography.geographyId,
          geographyName: geography.name,
          geographyType: geography.geographyType,
          period: periodFromFredDate(date, frequency),
          value,
          unit,
          estimateType: "observation",
          definition: `FRED series ${seriesCode} (distribution channel; original producer per series notes)`,
          limitations: [
            "FRED redistributes agency series. DFA shares are model-based and revise. Structure/history ≠ causal capture.",
          ],
          consumerMetricId,
        });
      }

      return { source: SOURCE, dataset, observations, warnings };
    },
  };
}
