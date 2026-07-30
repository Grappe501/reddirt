/**
 * Smoke: Evidence AI mode tool subsets (audit #5) — no OpenAI calls.
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-evidence-ai-modes.ts
 */
import Module from "node:module";

const originalLoad = (Module as unknown as { _load: (...args: unknown[]) => unknown })._load;
(Module as unknown as { _load: (...args: unknown[]) => unknown })._load = function (...args: unknown[]) {
  const request = String(args[0] ?? "");
  const normalized = request.replace(/\\/g, "/");
  if (
    request === "server-only" ||
    normalized.includes("/server-only/") ||
    normalized.endsWith("/server-only")
  ) {
    return {};
  }
  return originalLoad.apply(this, args);
};

async function main() {
  const {
    EVIDENCE_AI_MODES,
    listEvidenceAiModesForUi,
    parseEvidenceAiMode,
    systemExtraForMode,
    toolNamesForMode,
  } = await import("../src/lib/campaign-media/evidence-ai-modes");
  const { evidenceAiToolsFor } = await import("../src/lib/campaign-media/evidence-ai-tool-defs");

  if (parseEvidenceAiMode("FIT") !== "fit") {
    console.error("FAIL: parseEvidenceAiMode");
    process.exit(1);
  }
  if (parseEvidenceAiMode("nope") !== "identify") {
    console.error("FAIL: default mode");
    process.exit(1);
  }

  const photoGeneral = evidenceAiToolsFor("photo", "general");
  const photoIdentify = evidenceAiToolsFor("photo", "identify");
  const photoPrep = evidenceAiToolsFor("photo", "photo_prep");
  const photoPublish = evidenceAiToolsFor("photo", "publish");
  const videoPrep = evidenceAiToolsFor("video", "video_prep");
  const videoIdentify = evidenceAiToolsFor("video", "identify");

  if (!(photoIdentify.length < photoGeneral.length)) {
    console.error("FAIL: identify should be smaller than general", {
      identify: photoIdentify.length,
      general: photoGeneral.length,
    });
    process.exit(1);
  }
  if (!(photoPrep.length < photoGeneral.length)) {
    console.error("FAIL: photo_prep subset", photoPrep.length, photoGeneral.length);
    process.exit(1);
  }

  const identifyNames = new Set(
    photoIdentify.filter((t) => t.type === "function").map((t) => t.function.name),
  );
  if (identifyNames.has("batch_publish_photo_flags")) {
    console.error("FAIL: identify must not include batch_publish_photo_flags");
    process.exit(1);
  }
  if (identifyNames.has("encode_video_excerpt")) {
    console.error("FAIL: photo identify must not include video encode");
    process.exit(1);
  }
  if (!identifyNames.has("lookup_arkansas_county")) {
    console.error("FAIL: identify missing grounding tool");
    process.exit(1);
  }

  const prepNames = new Set(
    photoPrep.filter((t) => t.type === "function").map((t) => t.function.name),
  );
  if (!prepNames.has("suggest_crop_plan") || !prepNames.has("create_photo_derivative")) {
    console.error("FAIL: photo_prep missing crop tools", [...prepNames]);
    process.exit(1);
  }
  if (prepNames.has("batch_publish_photo_flags")) {
    console.error("FAIL: photo_prep must not publish");
    process.exit(1);
  }

  const publishNames = new Set(
    photoPublish.filter((t) => t.type === "function").map((t) => t.function.name),
  );
  if (!publishNames.has("get_evidence_publish_queue")) {
    console.error("FAIL: publish missing queue tool");
    process.exit(1);
  }

  const videoPrepNames = new Set(
    videoPrep.filter((t) => t.type === "function").map((t) => t.function.name),
  );
  if (!videoPrepNames.has("prep_video_package") || !videoPrepNames.has("plan_video_excerpt")) {
    console.error("FAIL: video_prep missing prep tools");
    process.exit(1);
  }
  if (videoPrepNames.has("batch_publish_photo_flags")) {
    console.error("FAIL: video_prep must not have photo publish");
    process.exit(1);
  }

  // Mode allow-list tools that exist in schemas must all resolve
  for (const kind of ["photo", "video"] as const) {
    for (const mode of EVIDENCE_AI_MODES) {
      if (kind === "photo" && mode === "video_prep") continue;
      if (kind === "video" && mode === "photo_prep") continue;
      const allow = toolNamesForMode(kind, mode);
      if (!allow) continue;
      const tools = evidenceAiToolsFor(kind, mode);
      const names = new Set(tools.filter((t) => t.type === "function").map((t) => t.function.name));
      const missing = [...allow].filter((n) => !names.has(n));
      if (missing.length) {
        console.error("FAIL: allow-list tools missing from schemas", { kind, mode, missing });
        process.exit(1);
      }
      if (tools.length < 3) {
        console.error("FAIL: too few tools for", kind, mode, tools.length);
        process.exit(1);
      }
      if (!systemExtraForMode(mode).includes("MODE")) {
        console.error("FAIL: systemExtra missing MODE for", mode);
        process.exit(1);
      }
    }
  }

  const uiPhoto = listEvidenceAiModesForUi("photo");
  const uiVideo = listEvidenceAiModesForUi("video");
  if (uiPhoto.some((m) => m.id === "video_prep")) {
    console.error("FAIL: photo UI should hide video_prep");
    process.exit(1);
  }
  if (uiVideo.some((m) => m.id === "photo_prep")) {
    console.error("FAIL: video UI should hide photo_prep");
    process.exit(1);
  }
  if (videoIdentify.length >= evidenceAiToolsFor("video", "general").length) {
    console.error("FAIL: video identify not smaller than general");
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        photo: {
          general: photoGeneral.length,
          identify: photoIdentify.length,
          photo_prep: photoPrep.length,
          publish: photoPublish.length,
        },
        video: {
          general: evidenceAiToolsFor("video", "general").length,
          identify: videoIdentify.length,
          video_prep: videoPrep.length,
        },
        uiPhotoModes: uiPhoto.map((m) => m.id),
        uiVideoModes: uiVideo.map((m) => m.id),
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-evidence-ai-modes");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
