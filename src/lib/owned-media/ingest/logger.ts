import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";

export type IngestLogLevel = "info" | "warn" | "error" | "success";

function ts(): string {
  return new Date().toISOString();
}

function line(level: IngestLogLevel, message: string, extra?: Record<string, unknown>): string {
  const base = `[${ts()}] [${level.toUpperCase()}] ${message}`;
  if (extra && Object.keys(extra).length) {
    return `${base} ${JSON.stringify(extra)}`;
  }
  return base;
}

export function createIngestLogger(logDir?: string) {
  const dir = logDir ?? path.join(process.cwd(), "campaign-media");
  try {
    mkdirSync(dir, { recursive: true });
  } catch {
    /* ignore */
  }
  const logFile = path.join(dir, "ingest.log");

  return {
    log(level: IngestLogLevel, message: string, extra?: Record<string, unknown>) {
      const s = line(level, message, extra);
      // eslint-disable-next-line no-console
      console.log(s);
      try {
        appendFileSync(logFile, `${s}\n`, "utf8");
      } catch {
        /* ignore */
      }
    },
    info(message: string, extra?: Record<string, unknown>) {
      this.log("info", message, extra);
    },
    warn(message: string, extra?: Record<string, unknown>) {
      this.log("warn", message, extra);
    },
    error(message: string, extra?: Record<string, unknown>) {
      this.log("error", message, extra);
    },
    success(message: string, extra?: Record<string, unknown>) {
      this.log("success", message, extra);
    },
  };
}

export type IngestLogger = ReturnType<typeof createIngestLogger>;
