import type {
  ConnectorValidation,
  DatasetDescriptor,
  NormalizedStatisticsBatch,
  PublicStatisticsRequest,
  RawStatisticsResponse,
} from "../../types";

export interface PublicStatisticsConnector {
  source: string;
  validateConfiguration(): Promise<ConnectorValidation>;
  listSupportedDatasets(): Promise<DatasetDescriptor[]>;
  fetch(request: PublicStatisticsRequest): Promise<RawStatisticsResponse>;
  normalize(response: RawStatisticsResponse): Promise<NormalizedStatisticsBatch>;
}
