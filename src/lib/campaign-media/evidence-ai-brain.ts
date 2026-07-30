import "server-only";

import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { evidenceAiToolsFor } from "@/lib/campaign-media/evidence-ai-tool-defs";
import { executeEvidenceAiTool } from "@/lib/campaign-media/evidence-ai-tool-runtime";
import type { EvidenceAiSuggestion } from "@/lib/campaign-media/evidence-ai-types";
import {
  modeMeta,
  parseEvidenceAiMode,
  systemExtraForMode,
  type EvidenceAiMode,
} from "@/lib/campaign-media/evidence-ai-modes";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";

const SYSTEM = `You are the Evidence Workbench brain for Kelly Grappe's Arkansas Secretary of State campaign.
You may call tools to ground suggestions in local campaign data (counties, calendar, memory, albums, transcripts)
and to inspect or create non-destructive photo derivatives / video excerpt plans.
Hard rules:
- Prefer "Unknown" over inventing county, city, venue, people, or dates.
- Active AI mode limits which tools are available — stay inside that subset.
- Never invent geography from clothing, vibes, or incomplete tool results.
- Confirmed memory and calendar Confirmed rows are soft priors — only reuse when the current asset clearly matches.
- Needs confirm / empty calendar geography is NOT proof.
- whatThisProves must use concrete evidence language (listened/learned/visited/spoke/engaged).
- Photo derivatives never overwrite originals; prefer suggest_crop_plan before create_photo_derivative.
- For videos, call prep_video_package first for clip/intel prep; never invent timestamps.
- Only call encode_video_excerpt when the operator explicitly asks to encode (confirmEncode:true).
- Only call extract_video_poster when the operator explicitly asks (confirmPoster:true).
- Only call render_video_edit_project when the operator explicitly asks to render a Pro Edit (confirmRender:true).
- Prefer propose_video_edit_project before rendering; use update_video_edit_cutlist for reorder/trim/drop (never invent spoken lines).
- Use preview_video_edit_captions before burn-in; sidecars write SRT+VTT from verbatim transcript windows only.
- Only call soft_archive_video_assemblies with confirmArchive:true — never delete media files.
- Prefer propose_photo_edit_project before rendering still packs; only call render_photo_edit_project with confirmRender:true.
- Photo Pro Edit never auto-promotes — promote_photo_derivative remains a separate explicit step.
- Call get_evidence_publish_queue when prioritizing Unknown → Save → Approve backlog work.
- Only call run_publish_queue_turbo when the operator explicitly asks to turbo the publish-queue backlog (confirm:true).
- Only call refresh_evidence_density_snapshot when the operator asks to refresh density metrics / evening log.
- Call build_evidence_ship_report when the operator asks what still needs to be committed/deployed.
- Only call write_registry_graduation_stub when the operator explicitly asks for a draft→registry stub (never silent registry rewrite).
- Call propose_curated_placement when the operator asks to reorder HOMEPAGE_* curated IDs; never invent geography to justify placement.
- Only call apply_curated_placement when the operator explicitly confirms curation (confirmCurate:true). Hero stays null unless allowHero was set on propose.
- Only call undo_curated_placement with confirmCurate:true when the operator asks to restore a prior homepage curation snapshot.
- Call get_speech_confirm_queue / get_speech_readiness_matrix when prioritizing speech confirm → publish work.
- Only call batch_save_speech_evidence / batch_publish_speech_flags when the operator explicitly asks for speech batch writes.
- Only call undo_batch_speech_publish when the operator explicitly asks to undo a speech publish batch.
- Call propose_speech_placement for homepage video ID diffs; only apply_speech_placement with confirmCurate:true.
- Only call apply_transcript_intelligence when the operator explicitly asks to apply (confirm:true).
- Call analyze_transcript_intelligence for chapters/quotes/claims/do-not-claim; never invent spoken lines.
- Only call batch_apply_photo_evidence when the operator explicitly asks to write the same fields to multiple named photo ids.
- Only call batch_publish_photo_flags when the operator explicitly asks to approve/hold/homepage/featured a named selection.
- Only call undo_batch_publish when the operator explicitly asks to undo a publish batch.
- Only call intake_all_photos when the operator explicitly asks to intake/queue new stills from disk.
- Only call turbo_ingest_photos when the operator explicitly asks to run turbo identify+fit (confirm required).
- Only call apply_turbo_proposal when the operator explicitly asks to apply a turbo proposal.
- Call get_website_surface_inventory / score_photo_website_fit when suggesting where a still fits on the site.
- Call rank_evidence_next_actions when the operator asks what to do next across the workbench.
- Call propose_event_night_pack to link a calendar night to cue-aligned photos/speeches (never invent matches).
- Call suggest_calendar_presence_fields to propose calendar geography — never auto-Confirm; Prefer Unknown.
- Only call batch_create_photo_derivatives when the operator explicitly asks to generate derivatives for named photo ids.
- Only call promote_photo_derivative when the operator explicitly asks to promote a derivative into public placement.
- After tools, return ONE final JSON object (no markdown) with:
  county, city, venue, eventDate, eventName, photographer, peopleVisible[],
  whatThisProves, confidence (high|medium|low), warnings[], rationale,
  optional sceneTags[], altTextDraft, cropAdvice (photos), speakerNotes (videos).`;

function parseSuggestion(raw: string): EvidenceAiSuggestion {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<EvidenceAiSuggestion>;
  const unk = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s || "Unknown";
  };
  const people = Array.isArray(parsed.peopleVisible)
    ? parsed.peopleVisible.map((p) => String(p).trim()).filter(Boolean)
    : [];
  const confidence =
    parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
      ? parsed.confidence
      : "low";
  return {
    county: unk(parsed.county),
    city: unk(parsed.city),
    venue: unk(parsed.venue),
    eventDate: unk(parsed.eventDate),
    eventName: unk(parsed.eventName),
    photographer: unk(parsed.photographer),
    peopleVisible: people,
    whatThisProves: String(parsed.whatThisProves ?? "").trim(),
    confidence,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
    rationale: String(parsed.rationale ?? "").trim(),
    sceneTags: Array.isArray(parsed.sceneTags) ? parsed.sceneTags.map(String).slice(0, 12) : undefined,
    altTextDraft: parsed.altTextDraft ? String(parsed.altTextDraft) : undefined,
    cropAdvice: parsed.cropAdvice ? String(parsed.cropAdvice) : undefined,
    speakerNotes: parsed.speakerNotes ? String(parsed.speakerNotes) : undefined,
  };
}

export async function runEvidenceAiBrain(input: {
  kind: "photo" | "video";
  userText: string;
  imageDataUrl?: string | null;
  /** Additional stills for batch context (kept small). */
  extraImageDataUrls?: string[];
  /** Appended to the system prompt for specialized modes (e.g. batch propose). */
  systemExtra?: string;
  /** Audit #5 — mode-routed tool subset (default identify). */
  mode?: EvidenceAiMode | string;
  maxToolRounds?: number;
}): Promise<
  | {
      ok: true;
      suggestion: EvidenceAiSuggestion;
      toolsUsed: string[];
      model: string;
      mode: EvidenceAiMode;
      toolCount: number;
      rawContent?: string;
    }
  | { ok: false; error: string }
> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OPENAI_API_KEY not configured in RedDirt .env / .env.local." };
  }

  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const mode = parseEvidenceAiMode(input.mode ?? "identify");
  const tools = evidenceAiToolsFor(input.kind, mode);
  const toolsUsed: string[] = [];
  const maxRounds = input.maxToolRounds ?? modeMeta(mode).maxToolRounds;
  const modeExtra = systemExtraForMode(mode);
  const systemExtra = [modeExtra, input.systemExtra].filter(Boolean).join("\n");

  const userContent: ChatCompletionContentPart[] = [{ type: "text", text: input.userText }];
  if (input.imageDataUrl) {
    userContent.push({ type: "image_url", image_url: { url: input.imageDataUrl } });
  }
  for (const url of input.extraImageDataUrls ?? []) {
    if (url) userContent.push({ type: "image_url", image_url: { url } });
  }

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemExtra ? `${SYSTEM}\n${systemExtra}` : SYSTEM },
    { role: "user", content: userContent },
  ];

  const finish = (suggestion: EvidenceAiSuggestion, rawContent?: string) => {
    suggestion.toolsUsed = [...new Set(toolsUsed)];
    suggestion.warnings = [
      ...suggestion.warnings,
      `AI mode: ${mode} (${tools.length} tools)`,
    ];
    return {
      ok: true as const,
      suggestion,
      toolsUsed: suggestion.toolsUsed,
      model,
      mode,
      toolCount: tools.length,
      rawContent,
    };
  };

  try {
    for (let round = 0; round < maxRounds; round++) {
      const res = await client.chat.completions.create({
        model,
        temperature: 0.2,
        tools: tools.length ? tools : undefined,
        tool_choice: tools.length ? "auto" : undefined,
        messages,
      });
      const msg = res.choices[0]?.message;
      if (!msg) return { ok: false, error: "OpenAI returned an empty message." };

      if (msg.tool_calls?.length) {
        messages.push({
          role: "assistant",
          content: msg.content ?? null,
          tool_calls: msg.tool_calls,
        });
        for (const call of msg.tool_calls) {
          if (call.type !== "function") continue;
          const name = call.function.name;
          toolsUsed.push(name);
          const executed = await executeEvidenceAiTool(name, call.function.arguments ?? "{}");
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(executed.ok ? executed.result : { error: executed.error }),
          });
        }
        continue;
      }

      const content = msg.content?.trim() ?? "";
      if (!content) {
        messages.push({
          role: "user",
          content:
            "Return the final evidence JSON object now (no markdown). Prefer Unknown over guessing.",
        });
        const final = await client.chat.completions.create({
          model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages,
        });
        const raw = final.choices[0]?.message?.content?.trim() ?? "";
        if (!raw) return { ok: false, error: "OpenAI returned empty suggestion." };
        return finish(parseSuggestion(raw), raw);
      }

      try {
        return finish(parseSuggestion(content), content);
      } catch {
        messages.push({ role: "assistant", content });
        messages.push({
          role: "user",
          content: "Convert your answer into the required JSON object only.",
        });
        const final = await client.chat.completions.create({
          model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages,
        });
        const raw = final.choices[0]?.message?.content?.trim() ?? "";
        if (!raw) return { ok: false, error: "OpenAI returned empty suggestion." };
        return finish(parseSuggestion(raw), raw);
      }
    }

    return {
      ok: false,
      error: `Evidence AI hit the tool-round limit without a final suggestion (mode=${mode}).`,
    };
  } catch (err) {
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}
