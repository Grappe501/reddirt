import path from "node:path";
import type { PublicStatisticsConnector } from "../shared/contract";
import { fetchWithRetry, persistRawResponse, safeLog } from "../shared/http";
import { isUsableApiKey } from "../../env/loadPublicdataEnv";
import { resolveGeography } from "../../geography/registry";
import type {
  ConnectorValidation,
  DatasetDescriptor,
  NormalizedStatisticsBatch,
  PublicStatisticsRequest,
  RawStatisticsResponse,
} from "../../types";

const SOURCE = "bls";
const ENDPOINT = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

function keyPresent(): boolean {
  return isUsableApiKey(process.env.BLS_API_KEY);
}

export function createBlsConnector(opts: {
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
          ? []
          : ["BLS_API_KEY missing or placeholder — BLS ingest fail-closed"],
        errors: present
          ? []
          : ["BLS_API_KEY not configured or not usable (placeholder/invalid format)"],
      };
    },
    async listSupportedDatasets(): Promise<DatasetDescriptor[]> {
      return [
        {
          code: "laus",
          title: "Local Area Unemployment Statistics",
          frequency: "monthly",
          documentationUrl: "https://www.bls.gov/lau/",
        },
        {
          code: "cpi",
          title: "Consumer Price Index",
          frequency: "monthly",
          documentationUrl: "https://www.bls.gov/cpi/",
        },
        {
          code: "ces",
          title: "Current Employment Statistics",
          frequency: "monthly",
          documentationUrl: "https://www.bls.gov/ces/",
        },
      ];
    },
    async fetch(request: PublicStatisticsRequest): Promise<RawStatisticsResponse> {
      const validation = await this.validateConfiguration();
      if (!validation.ok) {
        throw new Error(validation.errors.join("; "));
      }
      const registrationkey = process.env.BLS_API_KEY!.trim();
      const startyear = request.period;
      const endyear = request.period;
      const body = {
        seriesid: request.variablesOrSeries,
        startyear,
        endyear,
        registrationkey,
      };
      const safeParams: Record<string, string> = {
        seriesid: request.variablesOrSeries.join(","),
        startyear,
        endyear,
        geography: request.geography,
        dataset: request.dataset,
      };
      safeLog("bls.fetch", { endpoint: ENDPOINT, safeParams });
      const { status, text, retryCount } = await fetchWithRetry(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return persistRawResponse({
        root: opts.rawRoot,
        source: SOURCE,
        endpoint: ENDPOINT,
        safeParams,
        status,
        bodyText: text,
        retryCount,
        commit: opts.commit,
      });
    },
    async normalize(response: RawStatisticsResponse): Promise<NormalizedStatisticsBatch> {
      const warnings: string[] = [];
      if (response.status !== 200) {
        return {
          source: SOURCE,
          dataset: response.safeParams.dataset || "bls",
          observations: [],
          warnings: [`BLS HTTP ${response.status}`],
        };
      }
      let parsed: {
        status?: string;
        message?: string[];
        Results?: {
          series?: Array<{
            seriesID: string;
            data?: Array<{
              year: string;
              period: string;
              periodName: string;
              value: string;
              footnotes?: Array<{ text?: string }>;
            }>;
          }>;
        };
      };
      try {
        parsed = JSON.parse(response.bodyText);
      } catch {
        return {
          source: SOURCE,
          dataset: response.safeParams.dataset || "bls",
          observations: [],
          warnings: ["Malformed BLS JSON"],
        };
      }
      if (parsed.status && parsed.status !== "REQUEST_SUCCEEDED") {
        warnings.push(`BLS status: ${parsed.status}`);
        if (parsed.message?.length) warnings.push(...parsed.message);
      }
      const geography = resolveGeography(response.safeParams.geography || "nation");
      const observations = [];
      for (const series of parsed.Results?.series || []) {
        const annual = (series.data || []).filter((d) => d.period === "M13" || d.periodName === "Annual");
        const pick =
          annual[0] ||
          (series.data || []).sort((a, b) => `${b.year}${b.period}`.localeCompare(`${a.year}${a.period}`))[0];
        if (!pick) {
          warnings.push(`No observations for series ${series.seriesID}`);
          continue;
        }
        const value = Number(pick.value);
        observations.push({
          seriesCode: series.seriesID,
          seriesTitle: `BLS ${series.seriesID}`,
          geographyId: geography.geographyId,
          geographyType: geography.geographyType,
          geographyName: geography.name,
          period: pick.period === "M13" ? pick.year : `${pick.year}-${pick.period}`,
          value: Number.isFinite(value) ? value : null,
          unit: "as_reported",
          seasonalAdjustment: null,
          estimateType: "bls_series",
          definition: `BLS series ${series.seriesID}`,
          limitations: [
            "Do not mix seasonally adjusted and non-seasonally adjusted series silently",
            "Survey and administrative series are not identical concepts",
          ],
        });
      }
      return {
        source: SOURCE,
        dataset: response.safeParams.dataset || "bls",
        observations,
        warnings,
      };
    },
  };
}

export function blsRawRoot(repoRoot: string): string {
  return path.join(repoRoot, "data", "public-statistics", "raw");
}
