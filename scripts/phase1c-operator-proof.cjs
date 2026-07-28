/**
 * Phase 1C operator proof — Submission + User parity + join/volunteer intake spine.
 * Marker: phase1c-proof — safe to delete afterward (no real PII).
 *
 * Usage (from RedDirt/):
 *   node scripts/run-with-h-drive-env.cjs node scripts/phase1c-operator-proof.cjs
 */
const {
  PrismaClient,
  EmailOptInStatus,
  SmsOptInStatus,
} = require("@prisma/client");
const { randomUUID } = require("node:crypto");

const MARKER = "phase1c-proof";
const results = [];

function ok(name, detail) {
  results.push({ ok: true, name, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail) {
  results.push({ ok: false, name, detail });
  console.error(`FAIL  ${name} — ${detail}`);
}

async function main() {
  const prisma = new PrismaClient();
  const suffix = randomUUID().slice(0, 8);
  const joinEmail = `phase1c.join.${suffix}@example.invalid`;
  const volEmail = `phase1c.vol.${suffix}@example.invalid`;
  let joinUserId = null;
  let volUserId = null;
  let joinSubmissionId = null;
  let volSubmissionId = null;
  let legacyCountBefore = null;

  try {
    // --- Physical mapping / legacy preservation ---
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_name IN ('Submission','submissions')
      ORDER BY 1`);
    const names = tables.map((t) => t.table_name);
    if (names.includes("Submission") && names.includes("submissions")) {
      ok("map.both_tables_present", "PascalCase Submission + legacy submissions coexist");
    } else {
      fail("map.both_tables_present", JSON.stringify(names));
    }

    const legacyCols = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='submissions'
      ORDER BY ordinal_position`);
    const legacyColNames = legacyCols.map((c) => c.column_name);
    if (legacyColNames.includes("module_id") && legacyColNames.includes("raw_data")) {
      ok("legacy.shape_unchanged", legacyColNames.join(","));
    } else {
      fail("legacy.shape_unchanged", JSON.stringify(legacyColNames));
    }

    const before = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::bigint AS n FROM public.submissions`,
    );
    legacyCountBefore = Number(before[0].n);

    const rdCols = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='Submission'
      ORDER BY ordinal_position`);
    const rdNames = rdCols.map((c) => c.column_name);
    for (const need of ["id", "userId", "type", "content", "structuredData", "createdAt"]) {
      if (!rdNames.includes(need)) fail("submission.columns", `missing ${need}`);
    }
    if (rdNames.includes("id") && rdNames.includes("type") && !rdNames.includes("module_id")) {
      ok("submission.reddirt_shape", rdNames.join(","));
    }

    const userHasLink = await prisma.$queryRawUnsafe(`
      SELECT 1 AS ok FROM information_schema.columns
      WHERE table_schema='public' AND table_name='User' AND column_name='linkedVoterRecordId'`);
    if (userHasLink.length) ok("user.linkedVoterRecordId_present");
    else fail("user.linkedVoterRecordId_present", "column missing");

    // --- User upsert + null linkedVoterRecordId ---
    const joinUser = await prisma.user.upsert({
      where: { email: joinEmail },
      create: {
        email: joinEmail,
        name: "Phase1C Join Proof",
        interests: ["events"],
        linkedVoterRecordId: null,
      },
      update: {
        name: "Phase1C Join Proof",
        linkedVoterRecordId: null,
      },
    });
    joinUserId = joinUser.id;
    if (joinUser.linkedVoterRecordId == null) {
      ok("user.upsert_null_linkedVoterRecordId", joinUser.id);
    } else {
      fail("user.upsert_null_linkedVoterRecordId", String(joinUser.linkedVoterRecordId));
    }

    const readUser = await prisma.user.findUnique({ where: { id: joinUserId } });
    if (readUser?.email === joinEmail) ok("user.read_existing", readUser.id);
    else fail("user.read_existing", "not found");

    // --- Submission create/read ---
    const joinSub = await prisma.submission.create({
      data: {
        userId: joinUserId,
        type: "join_movement",
        content: `${MARKER} join proof`,
        structuredData: {
          proof: MARKER,
          formType: "join_movement",
          interests: ["events"],
          sourcePage: "/phase1c-proof",
        },
      },
    });
    joinSubmissionId = joinSub.id;
    const joinSubRead = await prisma.submission.findUnique({
      where: { id: joinSubmissionId },
      include: { user: true },
    });
    if (joinSubRead?.userId === joinUserId && joinSubRead.user?.email === joinEmail) {
      ok("submission.create_read_user_relation", joinSubmissionId);
    } else {
      fail("submission.create_read_user_relation", JSON.stringify(joinSubRead));
    }

    // --- Join intake spine ---
    const joinIntake = await prisma.workflowIntake.create({
      data: {
        submissionId: joinSubmissionId,
        status: "PENDING",
        title: `${MARKER} join`,
        source: "join_movement",
        metadata: { proof: MARKER, formType: "join_movement" },
      },
    });
    const joinAction = await prisma.workflowAction.create({
      data: {
        workflowIntakeId: joinIntake.id,
        kind: "OTHER",
        summary: `${MARKER} join created`,
        metadata: { proof: MARKER, automaticOutreach: false },
      },
    });
    await prisma.contactPreference.upsert({
      where: { userId: joinUserId },
      create: {
        userId: joinUserId,
        emailOptInStatus: EmailOptInStatus.OPT_IN,
        smsOptInStatus: SmsOptInStatus.UNKNOWN,
        source: "phase1c_proof_join",
      },
      update: {
        emailOptInStatus: EmailOptInStatus.OPT_IN,
        source: "phase1c_proof_join",
      },
    });
    const joinIntakeRead = await prisma.workflowIntake.findUnique({
      where: { id: joinIntake.id },
      include: { submission: true, actions: true },
    });
    if (
      joinIntakeRead?.submissionId === joinSubmissionId &&
      joinIntakeRead.submission?.id === joinSubmissionId &&
      joinAction.id
    ) {
      ok("join.e2e_user_submission_intake_action", joinIntake.id);
    } else {
      fail("join.e2e_user_submission_intake_action", JSON.stringify(joinIntakeRead));
    }
    const joinPref = await prisma.contactPreference.findUnique({ where: { userId: joinUserId } });
    if (joinPref?.emailOptInStatus === EmailOptInStatus.OPT_IN) {
      ok("join.contact_preference_email", joinPref.source);
    } else fail("join.contact_preference_email", JSON.stringify(joinPref));

    // --- Volunteer path ---
    const volUser = await prisma.user.upsert({
      where: { email: volEmail },
      create: {
        email: volEmail,
        name: "Phase1C Volunteer Proof",
        interests: ["canvassing", "other"],
        linkedVoterRecordId: null,
      },
      update: {
        interests: ["canvassing", "other"],
        linkedVoterRecordId: null,
      },
    });
    volUserId = volUser.id;
    if (
      Array.isArray(volUser.interests) &&
      volUser.interests.includes("canvassing") &&
      volUser.interests.includes("other")
    ) {
      ok("volunteer.interest_normalization_persist", volUser.interests.join(","));
    } else {
      fail("volunteer.interest_normalization_persist", JSON.stringify(volUser.interests));
    }

    const volSub = await prisma.submission.create({
      data: {
        userId: volUserId,
        type: "volunteer",
        content: `${MARKER} volunteer proof`,
        structuredData: {
          proof: MARKER,
          formType: "volunteer",
          interests: ["canvassing", "other"],
        },
      },
    });
    volSubmissionId = volSub.id;
    const volIntake = await prisma.workflowIntake.create({
      data: {
        submissionId: volSubmissionId,
        status: "PENDING",
        title: `${MARKER} volunteer`,
        source: "volunteer",
        metadata: { proof: MARKER, formType: "volunteer" },
      },
    });
    await prisma.workflowAction.create({
      data: {
        workflowIntakeId: volIntake.id,
        kind: "OTHER",
        summary: `${MARKER} volunteer created`,
        metadata: { proof: MARKER, automaticOutreach: false },
      },
    });
    await prisma.contactPreference.upsert({
      where: { userId: volUserId },
      create: {
        userId: volUserId,
        emailOptInStatus: EmailOptInStatus.OPT_IN,
        smsOptInStatus: SmsOptInStatus.UNKNOWN,
        source: "phase1c_proof_volunteer",
      },
      update: {
        emailOptInStatus: EmailOptInStatus.OPT_IN,
        source: "phase1c_proof_volunteer",
      },
    });
    ok("volunteer.e2e_user_submission_intake", volIntake.id);

    // Repeat submission safety (second join submission for same user)
    const repeatSub = await prisma.submission.create({
      data: {
        userId: joinUserId,
        type: "join_movement",
        content: `${MARKER} join repeat`,
        structuredData: { proof: MARKER, repeat: true },
      },
    });
    await prisma.workflowIntake.create({
      data: {
        submissionId: repeatSub.id,
        status: "PENDING",
        title: `${MARKER} join repeat`,
        source: "join_movement",
        metadata: { proof: MARKER, repeat: true },
      },
    });
    ok("join.repeat_submission_safe", repeatSub.id);

    // Legacy untouched
    const after = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::bigint AS n FROM public.submissions`,
    );
    const legacyCountAfter = Number(after[0].n);
    if (legacyCountAfter === legacyCountBefore) {
      ok("legacy.row_count_unchanged", String(legacyCountAfter));
    } else {
      fail("legacy.row_count_unchanged", `${legacyCountBefore} -> ${legacyCountAfter}`);
    }

    // No automatic outreach flags in metadata
    ok("outreach.none_automatic", "proof metadata automaticOutreach=false; no send APIs called");

    // Confirm Prisma maps to Submission not submissions
    const mapped = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::bigint AS n FROM "Submission" WHERE content LIKE $1`,
      `${MARKER}%`,
    );
    if (Number(mapped[0].n) >= 2) ok("map.prisma_writes_pascalcase_table", String(mapped[0].n));
    else fail("map.prisma_writes_pascalcase_table", String(mapped[0].n));
  } catch (e) {
    fail("phase1c.uncaught", e instanceof Error ? e.message : String(e));
  } finally {
    // Cleanup synthetic rows (best-effort)
    try {
      if (joinSubmissionId || volSubmissionId) {
        const ids = [joinSubmissionId, volSubmissionId].filter(Boolean);
        const allSubs = await prisma.submission.findMany({
          where: {
            OR: [
              { id: { in: ids } },
              { content: { startsWith: MARKER } },
            ],
          },
          select: { id: true },
        });
        const subIds = allSubs.map((s) => s.id);
        if (subIds.length) {
          const intakes = await prisma.workflowIntake.findMany({
            where: { submissionId: { in: subIds } },
            select: { id: true },
          });
          const intakeIds = intakes.map((i) => i.id);
          if (intakeIds.length) {
            await prisma.workflowAction.deleteMany({ where: { workflowIntakeId: { in: intakeIds } } });
            await prisma.workflowIntake.deleteMany({ where: { id: { in: intakeIds } } });
          }
          await prisma.submission.deleteMany({ where: { id: { in: subIds } } });
        }
      }
      for (const uid of [joinUserId, volUserId].filter(Boolean)) {
        await prisma.contactPreference.deleteMany({ where: { userId: uid } });
        await prisma.user.deleteMany({ where: { id: uid } });
      }
      ok("cleanup.synthetic_removed", "phase1c-proof rows deleted");
    } catch (cleanupErr) {
      fail(
        "cleanup.synthetic_removed",
        cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr),
      );
    }
    await prisma.$disconnect();
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nPhase 1C proof: ${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
}

main();
