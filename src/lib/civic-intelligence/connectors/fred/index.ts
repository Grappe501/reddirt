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
          title: "FRED series observations",
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
      // Keep native frequency; do not force aggregation that invents values.
      if (frequency && frequency !== "native") {
        // FRED accepts a/q/m; only set when caller asks.
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

      const geography = resolveGeography(response.safeParams.geography || "nation");
      const seriesCode = response.safeParams.series || "FRED";
      const title = response.safeParams.seriesTitle || `FRED ${seriesCode}`;
      const unit = response.safeParams.unit || "as_reported";
      const frequency = response.safeParams.frequency || "a";
      const consumerMetricId = response.safeParams.consumerMetricId || undefined;

      const observations: NormalizedObservation[] = [];
      for (const row of rows) {
        const date = String(row.date || "");
        const raw = String(row.value ?? "").trim();
        if (!date || raw === "." || raw === "") continue;
        const value = Number(raw);
        if (!Number.isFinite(value)) continue;
        observations.push({
          sourceId: SOURCE,
          datasetId: dataset,
          seriesCode,
          seriesTitle: title,
          geographyId: geography.geographyId,
          geographyName: geography.name,
          geographyType: geography.geographyType,
          period: periodFromFredDate(date, frequency),
          value,
          unit,
          definition: `FRED series ${seriesCode} (distribution channel; original producer per series notes)`,
          limitations:
            "FRED redistributes agency series. DFA shares are model-based and revise. Structure/history ≠ causal capture.",
          confidence: "verified_primary",
          consumerMetricId,
        });
      }

      return { source: SOURCE, dataset, observations, warnings };
    },
  };
}
