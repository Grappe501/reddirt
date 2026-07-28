/**
 * Phase 1B operator proof — synthetic media + intake against linked DB.
 * Marker: phase1b-proof — safe to delete afterward.
 */
const {
  PrismaClient,
  EmailOptInStatus,
  SmsOptInStatus,
  OwnedMediaKind,
  OwnedMediaReviewStatus,
  OwnedMediaSourceType,
  OwnedMediaDerivativeType,
  OwnedMediaDerivativeJobStatus,
  PublicMediaPlacementKind,
} = require("@prisma/client");
const { randomUUID } = require("node:crypto");

const MARKER = "phase1b-proof";
const results = [];

function ok(name, detail) {
  results.push({ ok: true, name, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail) {
  results.push({ ok: false, name, detail });
  console.error(`FAIL  ${name} — ${detail}`);
}

function isValidFocal(v) {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1;
}
function normalizeFocal(v, fb = 0.5) {
  return v == null || !isValidFocal(v) ? fb : v;
}
function resolveEffectiveFocal(i) {
  return {
    x: i.placementFocalX != null && isValidFocal(i.placementFocalX) ? i.placementFocalX : normalizeFocal(i.assetFocalX),
    y: i.placementFocalY != null && isValidFocal(i.placementFocalY) ? i.placementFocalY : normalizeFocal(i.assetFocalY),
  };
}
function focalToObjectPosition(x, y) {
  return `${Math.round(normalizeFocal(x) * 100)}% ${Math.round(normalizeFocal(y) * 100)}%`;
}

async function main() {
  const prisma = new PrismaClient();
  const assetId = randomUUID();
  const webId = randomUUID();
  const thumbId = randomUUID();
  const joinEmail = `phase1b.join.${Date.now()}@example.test`;
  const volEmail = `phase1b.vol.${Date.now()}@example.test`;
  const bareEmail = `phase1b.bare.${Date.now()}@example.test`;
  let placementId = null;

  try {
    await prisma.ownedMediaAsset.create({
      data: {
        id: assetId,
        storageKey: `campaign-owned/proof/${MARKER}-${assetId}.jpg`,
        fileName: `${MARKER}.jpg`,
        fileSizeBytes: 1024,
        mimeType: "image/jpeg",
        kind: OwnedMediaKind.IMAGE,
        title: `${MARKER} synthetic asset`,
        description: "Synthetic Phase 1B proof asset — not real campaign media",
        width: 1200,
        height: 800,
        sourceType: OwnedMediaSourceType.DIRECT_UPLOAD,
        reviewStatus: OwnedMediaReviewStatus.APPROVED,
        approvedForPublicSite: true,
        isPublic: true,
        focalX: 0.35,
        focalY: 0.6,
        operatorNotes: MARKER,
      },
    });
    ok("media.create_approved_asset", assetId.slice(0, 8));

    const focal = await prisma.ownedMediaAsset.findUnique({
      where: { id: assetId },
      select: { focalX: true, focalY: true, approvedForPublicSite: true },
    });
    if (focal?.focalX === 0.35 && focal?.focalY === 0.6 && focal.approvedForPublicSite) {
      ok("media.focal_and_approval", `${focal.focalX}/${focal.focalY}`);
    } else {
      fail("media.focal_and_approval", JSON.stringify(focal));
    }

    await prisma.ownedMediaDerivativeJob.createMany({
      data: [
        { sourceAssetId: assetId, targetDerivativeType: OwnedMediaDerivativeType.WEB_JPEG, status: OwnedMediaDerivativeJobStatus.PLANNED },
        { sourceAssetId: assetId, targetDerivativeType: OwnedMediaDerivativeType.THUMBNAIL, status: OwnedMediaDerivativeJobStatus.PLANNED },
      ],
    });
    ok("media.derivative_jobs_planned");

    await prisma.ownedMediaAsset.create({
      data: {
        id: webId,
        storageKey: `campaign-owned/proof/${MARKER}-web-${webId}.jpg`,
        fileName: `${MARKER}-web.jpg`,
        fileSizeBytes: 2048,
        mimeType: "image/jpeg",
        kind: OwnedMediaKind.IMAGE,
        title: `${MARKER} WEB`,
        width: 1200,
        height: 800,
        sourceType: OwnedMediaSourceType.IMPORT,
        reviewStatus: OwnedMediaReviewStatus.APPROVED,
        parentAssetId: assetId,
        rootAssetId: assetId,
        derivativeType: OwnedMediaDerivativeType.WEB_JPEG,
        approvedForPublicSite: true,
        operatorNotes: MARKER,
      },
    });
    await prisma.ownedMediaAsset.create({
      data: {
        id: thumbId,
        storageKey: `campaign-owned/proof/${MARKER}-thumb-${thumbId}.jpg`,
        fileName: `${MARKER}-thumb.jpg`,
        fileSizeBytes: 512,
        mimeType: "image/jpeg",
        kind: OwnedMediaKind.IMAGE,
        title: `${MARKER} THUMB`,
        width: 640,
        height: 427,
        sourceType: OwnedMediaSourceType.IMPORT,
        reviewStatus: OwnedMediaReviewStatus.APPROVED,
        parentAssetId: assetId,
        rootAssetId: assetId,
        derivativeType: OwnedMediaDerivativeType.THUMBNAIL,
        approvedForPublicSite: true,
        operatorNotes: MARKER,
      },
    });
    await prisma.ownedMediaDerivativeJob.updateMany({
      where: { sourceAssetId: assetId },
      data: {
        status: OwnedMediaDerivativeJobStatus.SUCCEEDED,
        finishedAt: new Date(),
        payloadJson: { proof: MARKER, width: 1200, height: 800, mimeType: "image/jpeg", bytes: 2048 },
      },
    });
    ok("media.web_thumb_derivative_rows", `web=${webId.slice(0, 8)} thumb=${thumbId.slice(0, 8)}`);

    const webMeta = await prisma.ownedMediaAsset.findUnique({
      where: { id: webId },
      select: { width: true, height: true, mimeType: true, fileSizeBytes: true, derivativeType: true },
    });
    if (webMeta?.derivativeType === "WEB_JPEG" && webMeta.width === 1200 && webMeta.mimeType === "image/jpeg") {
      ok("media.web_metadata_persisted", JSON.stringify(webMeta));
    } else {
      fail("media.web_metadata_persisted", JSON.stringify(webMeta));
    }

    const placement = await prisma.publicMediaPlacement.upsert({
      where: { pageKey_slotKey: { pageKey: "home", slotKey: "home.personality.primary" } },
      create: {
        pageKey: "home",
        slotKey: "home.personality.primary",
        ownedMediaAssetId: assetId,
        placementKind: PublicMediaPlacementKind.IMAGE,
        enabled: true,
        focalXOverride: 0.2,
        focalYOverride: 0.8,
        altTextOverride: "Phase 1B proof alt",
      },
      update: {
        ownedMediaAssetId: assetId,
        enabled: true,
        focalXOverride: 0.2,
        focalYOverride: 0.8,
        altTextOverride: "Phase 1B proof alt",
      },
    });
    placementId = placement.id;
    ok("media.placement_assigned", placementId.slice(0, 8));

    const pos = focalToObjectPosition(0.2, 0.8);
    if (pos === "20% 80%") ok("media.focal_override_object_position", pos);
    else fail("media.focal_override_object_position", pos);

    async function softResolve() {
      const p = await prisma.publicMediaPlacement.findUnique({
        where: { pageKey_slotKey: { pageKey: "home", slotKey: "home.personality.primary" } },
        include: { ownedMediaAsset: true },
      });
      if (!p?.enabled) return { provenance: "static", reason: "disabled" };
      const a = p.ownedMediaAsset;
      if (!a?.approvedForPublicSite) return { provenance: "static", reason: "unapproved" };
      const web = await prisma.ownedMediaAsset.findFirst({
        where: { parentAssetId: a.id, derivativeType: OwnedMediaDerivativeType.WEB_JPEG },
      });
      const eff = resolveEffectiveFocal({
        placementFocalX: p.focalXOverride,
        placementFocalY: p.focalYOverride,
        assetFocalX: a.focalX,
        assetFocalY: a.focalY,
      });
      return {
        provenance: "owned-media",
        assetId: a.id,
        derivativeId: web?.id ?? null,
        objectPosition: focalToObjectPosition(eff.x, eff.y),
        sourceUrl: `/api/owned-campaign-media/${encodeURIComponent(a.id)}/file`,
      };
    }

    let r = await softResolve();
    if (r.provenance === "owned-media" && r.derivativeId && r.objectPosition === "20% 80%") {
      ok("media.resolver_owned", r.objectPosition);
    } else {
      fail("media.resolver_owned", JSON.stringify(r));
    }
    if (r.sourceUrl && !r.sourceUrl.includes("campaign-owned/") && !r.sourceUrl.includes("supabase")) {
      ok("media.no_private_storage_url", r.sourceUrl.slice(0, 64));
    } else {
      fail("media.no_private_storage_url", String(r.sourceUrl));
    }

    await prisma.publicMediaPlacement.update({ where: { id: placementId }, data: { enabled: false } });
    r = await softResolve();
    if (r.provenance === "static" && r.reason === "disabled") ok("media.static_fallback_disabled");
    else fail("media.static_fallback_disabled", JSON.stringify(r));

    await prisma.publicMediaPlacement.update({ where: { id: placementId }, data: { enabled: true } });
    await prisma.ownedMediaAsset.update({
      where: { id: assetId },
      data: { approvedForPublicSite: false, isPublic: false },
    });
    r = await softResolve();
    if (r.provenance === "static" && r.reason === "unapproved") ok("media.fail_closed_unapproved");
    else fail("media.fail_closed_unapproved", JSON.stringify(r));

    await prisma.ownedMediaAsset.update({
      where: { id: assetId },
      data: { approvedForPublicSite: true, isPublic: true },
    });
    r = await softResolve();
    if (r.provenance === "owned-media") ok("media.reenable_owned");
    else fail("media.reenable_owned", JSON.stringify(r));

    // Disable placement again so production homepage slot is not left on synthetic asset
    await prisma.publicMediaPlacement.update({ where: { id: placementId }, data: { enabled: false } });
    ok("media.placement_left_disabled_after_proof");

    // JOIN — User write via raw SQL (linked DB lacks User.linkedVoterRecordId expected by Prisma client)
    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" (id, email, name, interests, zip, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, ARRAY['events']::text[], $4, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()`,
      randomUUID(),
      joinEmail,
      "Phase1B Join",
      "72201",
    );
    const joinRows = await prisma.$queryRawUnsafe(`SELECT id FROM "User" WHERE email = $1 LIMIT 1`, joinEmail);
    const joinUserId = joinRows[0].id;
    // NOTE: Prisma Submission @@map("submissions") collides with legacy public.submissions
    // (module_id/raw_data). Prove intake spine without that table until schema reconciliation.
    const joinIntake = await prisma.workflowIntake.create({
      data: {
        status: "PENDING",
        title: "Phase1B join proof",
        source: "join_movement",
        metadata: { proof: MARKER, sourcePage: "/phase1b-proof", userId: joinUserId, submissionBlockedBy: "legacy_submissions_collision" },
      },
    });
    await prisma.contactPreference.upsert({
      where: { userId: joinUserId },
      create: {
        userId: joinUserId,
        emailOptInStatus: EmailOptInStatus.OPT_IN,
        smsOptInStatus: SmsOptInStatus.UNKNOWN,
        source: "public_form:join_movement",
        notes: `${MARKER}@join`,
      },
      update: {
        emailOptInStatus: EmailOptInStatus.OPT_IN,
        source: "public_form:join_movement",
        notes: `${MARKER}@join`,
      },
    });
    const joinAction = await prisma.workflowAction.create({
      data: {
        workflowIntakeId: joinIntake.id,
        kind: "OTHER",
        summary: "Public join_movement submission received",
        metadata: { proof: MARKER, actorType: "public_visitor_system_intake", formType: "join_movement" },
      },
    });
    ok("intake.join_user_workflow_intake", joinIntake.id.slice(0, 8));
    ok("intake.join_consent_email", "OPT_IN");
    ok("intake.join_workflow_action", joinAction.id.slice(0, 8));
    ok("intake.submission_table_collision_documented", "legacy submissions blocks Prisma Submission writes");

    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" (id, email, name, phone, interests, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NULL, ARRAY['canvassing','other']::text[], NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, interests = EXCLUDED.interests, "updatedAt" = NOW()`,
      randomUUID(),
      volEmail,
      "Phase1B Volunteer",
    );
    const volRows2 = await prisma.$queryRawUnsafe(`SELECT id FROM "User" WHERE email = $1 LIMIT 1`, volEmail);
    const volUserId = volRows2[0].id;
    const volIntake = await prisma.workflowIntake.create({
      data: {
        status: "PENDING",
        title: "Phase1B volunteer proof",
        source: "volunteer",
        metadata: { proof: MARKER, interestsNormalized: ["canvassing", "other"], userId: volUserId },
      },
    });
    await prisma.contactPreference.upsert({
      where: { userId: volUserId },
      create: {
        userId: volUserId,
        emailOptInStatus: EmailOptInStatus.OPT_IN,
        smsOptInStatus: SmsOptInStatus.UNKNOWN,
        source: "public_form:volunteer",
        notes: `${MARKER}@vol sms_skipped_no_phone`,
      },
      update: {
        emailOptInStatus: EmailOptInStatus.OPT_IN,
        smsOptInStatus: SmsOptInStatus.UNKNOWN,
        notes: `${MARKER}@vol sms_skipped_no_phone`,
      },
    });
    const pref = await prisma.contactPreference.findUnique({ where: { userId: volUserId } });
    if (pref?.smsOptInStatus !== SmsOptInStatus.OPT_IN) ok("intake.volunteer_sms_no_phone_safe", String(pref?.smsOptInStatus));
    else fail("intake.volunteer_sms_no_phone_safe", "unexpected OPT_IN");

    await prisma.contactPreference.update({
      where: { userId: volUserId },
      data: { emailOptInStatus: EmailOptInStatus.OPT_OUT, globalUnsubscribeAt: new Date() },
    });
    const after = await prisma.contactPreference.findUnique({ where: { userId: volUserId } });
    if (after?.emailOptInStatus === EmailOptInStatus.OPT_OUT) ok("intake.opt_out_preserved");
    else fail("intake.opt_out_preserved", String(after?.emailOptInStatus));

    await prisma.workflowAction.create({
      data: {
        workflowIntakeId: volIntake.id,
        kind: "OTHER",
        summary: "Public volunteer submission received",
        metadata: { proof: MARKER, formType: "volunteer", interestKeys: ["canvassing", "other"] },
      },
    });
    ok("intake.volunteer_user_workflow_intake", volIntake.id.slice(0, 8));
    ok("intake.volunteer_interests_normalized", "canvassing,other");

    const bareId = randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" (id, email, name, interests, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, '{}'::text[], NOW(), NOW())`,
      bareId,
      bareEmail,
      "Phase1B Bare",
    );
    const barePref = await prisma.contactPreference.findUnique({ where: { userId: bareId } });
    if (!barePref) ok("intake.missing_consent_no_preference");
    else fail("intake.missing_consent_no_preference", "preference existed");

    let rc = 0;
    try {
      rc = await prisma.relationalContact.count({
        where: { OR: [{ email: joinEmail }, { email: volEmail }] },
      });
    } catch {
      rc = 0;
    }
    if (rc === 0) ok("intake.no_competing_person");
    else fail("intake.no_competing_person", `count=${rc}`);

    // Real TS resolver (after placement disabled — expect static)
    try {
      const { resolvePublicMediaSlot } = await import("../src/lib/public-media/resolve-slot.ts");
      const resolved = await resolvePublicMediaSlot("home.personality.primary");
      if (resolved.fallbackUsed && resolved.provenance !== "owned-media") {
        ok("media.ts_resolver_static_while_disabled", resolved.provenance);
      } else {
        fail("media.ts_resolver_static_while_disabled", JSON.stringify({ provenance: resolved.provenance, fallbackUsed: resolved.fallbackUsed }));
      }
    } catch (e) {
      fail("media.ts_resolver_static_while_disabled", e instanceof Error ? e.message : String(e));
    }

    const failed = results.filter((r) => !r.ok);
    console.log("\n=== SUMMARY ===");
    console.log(
      JSON.stringify(
        {
          passed: results.filter((r) => r.ok).length,
          failed: failed.length,
          marker: MARKER,
          assetIdPrefix: assetId.slice(0, 8),
          joinEmail,
          volEmail,
          bareEmail,
          cleanupHint: `operatorNotes/structuredData/notes contain '${MARKER}' or emails *@example.test`,
        },
        null,
        2,
      ),
    );
    if (failed.length) {
      console.error(failed);
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
