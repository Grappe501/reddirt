import type { CheckSosFieldKey } from "./check-sos-field-catalog";
import type { CheckExtraction } from "./check-extraction-types";

export type AprilCheckImageCategory = "donation_folder" | "attachment" | "other";

/** One row in the April26 `Checks donations` folder (may contain multiple physical checks). */
export type AprilCheckSourceImage = {
  relativePath: string;
  fileName: string;
  sourceFolder: string;
  imageCategory: AprilCheckImageCategory;
  extractedAt?: string;
  /** Checks found on this photo after last vision extract. */
  checkCount?: number;
  imageWarnings?: string[];
};

/** One physical check = one Arkansas SOS individual contribution entry. */
export type AprilCheckSosEntry = {
  id: string;
  imageRelativePath: string;
  imageFileName: string;
  sourceFolder: string;
  imageCategory: AprilCheckImageCategory;
  /** 0-based index of this check on the source photo. */
  checkIndexOnImage: number;
  /** Set after extract when known. */
  checksOnImageCount?: number;
  fields: Record<CheckSosFieldKey, string>;
  extraction?: CheckExtraction;
  extractedAt?: string;
  reviewed: boolean;
  operatorNotes?: string;
};

export type AprilCheckSosWorkbook = {
  generatedAt: string;
  april26Dir: string;
  /** Seven donation-folder photos (source of truth for check discovery). */
  sourceImages: AprilCheckSourceImage[];
  /** One entry per physical check (not per photo). */
  entries: AprilCheckSosEntry[];
};

export type AprilCheckSosWorkbookStats = {
  sourceImageCount: number;
  donationFolderImages: number;
  totalChecks: number;
  extracted: number;
  reviewed: number;
  withAmount: number;
  withName: number;
  readyForSos: number;
};

export type CheckReviewFilter = "all" | "donation_only" | "not_extracted" | "needs_review" | "reviewed";
