"use client";

import { useState } from "react";
import type { AprilCheckSosWorkbook } from "@/lib/compliance/checks/april-check-sos-types";
import { SosCheckEntryClient } from "./sos-check-entry-client";
import { SosCheckEntryToolbar } from "./sos-check-entry-toolbar";

export function SosCheckEntryShell({
  initialWorkbook,
  april26Dir,
  folderExists,
  checkImageCount,
  openAiConfigured,
}: {
  initialWorkbook: AprilCheckSosWorkbook;
  april26Dir: string;
  folderExists: boolean;
  checkImageCount: number;
  openAiConfigured: boolean;
}) {
  const [workbook, setWorkbook] = useState(initialWorkbook);

  return (
    <>
      <SosCheckEntryToolbar
        april26Dir={april26Dir}
        folderExists={folderExists}
        checkImageCount={checkImageCount}
        onImported={(w) => {
          setWorkbook(w);
        }}
      />
      <SosCheckEntryClient
        initialWorkbook={workbook}
        imagesAvailable={folderExists}
        openAiConfigured={openAiConfigured}
        key={workbook.generatedAt}
      />
    </>
  );
}
