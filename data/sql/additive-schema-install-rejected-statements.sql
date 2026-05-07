-- Rejected statements from unsafe diff filter (628)
-- Source: data\sql\unsafe-production-to-current-schema-diff.sql

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."identities" DROP CONSTRAINT "identities_user_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."mfa_amr_claims" DROP CONSTRAINT "mfa_amr_claims_session_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."mfa_challenges" DROP CONSTRAINT "mfa_challenges_auth_factor_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."mfa_factors" DROP CONSTRAINT "mfa_factors_user_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."oauth_authorizations" DROP CONSTRAINT "oauth_authorizations_client_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."oauth_authorizations" DROP CONSTRAINT "oauth_authorizations_user_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."oauth_consents" DROP CONSTRAINT "oauth_consents_client_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."oauth_consents" DROP CONSTRAINT "oauth_consents_user_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."one_time_tokens" DROP CONSTRAINT "one_time_tokens_user_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_session_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."saml_providers" DROP CONSTRAINT "saml_providers_sso_provider_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."saml_relay_states" DROP CONSTRAINT "saml_relay_states_flow_state_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."saml_relay_states" DROP CONSTRAINT "saml_relay_states_sso_provider_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."sessions" DROP CONSTRAINT "sessions_oauth_client_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."sessions" DROP CONSTRAINT "sessions_user_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."sso_domains" DROP CONSTRAINT "sso_domains_sso_provider_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."webauthn_challenges" DROP CONSTRAINT "webauthn_challenges_user_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "auth"."webauthn_credentials" DROP CONSTRAINT "webauthn_credentials_user_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."ballot_items" DROP CONSTRAINT "ballot_items_geographic_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."candidates" DROP CONSTRAINT "candidates_contest_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."contest_partisan_index" DROP CONSTRAINT "contest_partisan_index_contest_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."contests" DROP CONSTRAINT "contests_election_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."county_results" DROP CONSTRAINT "county_results_county_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."county_results" DROP CONSTRAINT "county_results_election_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."county_turnout" DROP CONSTRAINT "county_turnout_county_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."county_turnout" DROP CONSTRAINT "county_turnout_election_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."donations" DROP CONSTRAINT "donations_event_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."donations" DROP CONSTRAINT "donations_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."election_candidates" DROP CONSTRAINT "election_candidates_contest_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."election_contests" DROP CONSTRAINT "election_contests_election_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."election_results" DROP CONSTRAINT "election_results_candidate_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."election_results" DROP CONSTRAINT "election_results_contest_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."events" DROP CONSTRAINT "events_host_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."events" DROP CONSTRAINT "events_location_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."events" DROP CONSTRAINT "events_organization_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."events" DROP CONSTRAINT "events_submission_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."external_records" DROP CONSTRAINT "external_records_source_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."geographic_units" DROP CONSTRAINT "geographic_units_parent_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."geography_leaders" DROP CONSTRAINT "geography_leaders_geographic_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."geography_leaders" DROP CONSTRAINT "geography_leaders_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."geography_leaders" DROP CONSTRAINT "geography_leaders_role_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."ingestion_entities" DROP CONSTRAINT "ingestion_entities_ingestion_job_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."ingestion_extractions" DROP CONSTRAINT "ingestion_extractions_ingestion_job_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."ingestion_files" DROP CONSTRAINT "ingestion_files_ingestion_job_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."ingestion_jobs" DROP CONSTRAINT "ingestion_jobs_uploaded_by_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."ingestion_mapping_suggestions" DROP CONSTRAINT "ingestion_mapping_suggestions_ingestion_entity_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."ingestion_reviews" DROP CONSTRAINT "ingestion_reviews_ingestion_entity_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."ingestion_reviews" DROP CONSTRAINT "ingestion_reviews_reviewer_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."ingestion_write_events" DROP CONSTRAINT "ingestion_write_events_ingestion_entity_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."initiative_signatures" DROP CONSTRAINT "initiative_signatures_initiative_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."interactions" DROP CONSTRAINT "interactions_created_by_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."interactions" DROP CONSTRAINT "interactions_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."media_assets" DROP CONSTRAINT "media_assets_ingestion_job_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."media_assets" DROP CONSTRAINT "media_assets_uploaded_by_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."media_entity_links" DROP CONSTRAINT "media_entity_links_media_asset_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."media_tags" DROP CONSTRAINT "media_tags_media_asset_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."message_audience_members" DROP CONSTRAINT "message_audience_members_audience_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."message_events" DROP CONSTRAINT "message_events_queue_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."message_queue" DROP CONSTRAINT "message_queue_campaign_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."organizer_assignments" DROP CONSTRAINT "organizer_assignments_geographic_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."organizer_assignments" DROP CONSTRAINT "organizer_assignments_leader_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."organizing_targets" DROP CONSTRAINT "organizing_targets_assigned_to_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."organizing_targets" DROP CONSTRAINT "organizing_targets_geographic_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."organizing_targets" DROP CONSTRAINT "organizing_targets_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."organizing_unit_hierarchy" DROP CONSTRAINT "organizing_unit_hierarchy_child_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."organizing_unit_hierarchy" DROP CONSTRAINT "organizing_unit_hierarchy_parent_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."organizing_unit_memberships" DROP CONSTRAINT "organizing_unit_memberships_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."organizing_unit_memberships" DROP CONSTRAINT "organizing_unit_memberships_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."organizing_units" DROP CONSTRAINT "organizing_units_parent_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."organizing_units" DROP CONSTRAINT "organizing_units_unit_type_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."person_geography" DROP CONSTRAINT "person_geography_geographic_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."person_geography" DROP CONSTRAINT "person_geography_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."person_profiles" DROP CONSTRAINT "person_profiles_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."petition_signatures" DROP CONSTRAINT "petition_signatures_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."petition_signatures" DROP CONSTRAINT "petition_signatures_petition_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."results" DROP CONSTRAINT "results_candidate_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."results" DROP CONSTRAINT "results_contest_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."results" DROP CONSTRAINT "results_election_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."shifts" DROP CONSTRAINT "shifts_related_event_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."shifts" DROP CONSTRAINT "shifts_volunteer_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_assigned_to_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_related_event_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_related_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_submission_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."training_certifications" DROP CONSTRAINT "training_certifications_path_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."training_enrollments" DROP CONSTRAINT "training_enrollments_path_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."training_events" DROP CONSTRAINT "training_events_module_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."training_modules" DROP CONSTRAINT "training_modules_course_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."training_path_modules" DROP CONSTRAINT "training_path_modules_module_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."training_path_modules" DROP CONSTRAINT "training_path_modules_path_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."training_progress" DROP CONSTRAINT "training_progress_module_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."training_records" DROP CONSTRAINT "training_records_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."turf_people" DROP CONSTRAINT "turf_people_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."turf_people" DROP CONSTRAINT "turf_people_turf_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."turfs" DROP CONSTRAINT "turfs_created_by_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."turfs" DROP CONSTRAINT "turfs_geographic_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."user_auth_methods" DROP CONSTRAINT "user_auth_methods_user_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."volunteer_intake_submissions" DROP CONSTRAINT "volunteer_intake_submissions_volunteer_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."volunteer_profiles" DROP CONSTRAINT "volunteer_profiles_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."volunteer_sources" DROP CONSTRAINT "volunteer_sources_volunteer_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."voter_profiles" DROP CONSTRAINT "voter_profiles_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."workspace_feature_flags" DROP CONSTRAINT "workspace_feature_flags_configured_by_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."workspace_feature_flags" DROP CONSTRAINT "workspace_feature_flags_workspace_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."workspace_geography_scope" DROP CONSTRAINT "workspace_geography_scope_unit_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."workspace_geography_scope" DROP CONSTRAINT "workspace_geography_scope_workspace_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."workspace_members" DROP CONSTRAINT "workspace_members_invited_by_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."workspace_members" DROP CONSTRAINT "workspace_members_person_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."workspace_members" DROP CONSTRAINT "workspace_members_role_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."workspace_members" DROP CONSTRAINT "workspace_members_workspace_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."workspace_roles" DROP CONSTRAINT "workspace_roles_workspace_type_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."workspaces" DROP CONSTRAINT "workspaces_organization_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."workspaces" DROP CONSTRAINT "workspaces_workspace_type_id_fkey"

-- reason=contains_drop
-- -- DropForeignKey
-- ALTER TABLE "public"."youth_profiles" DROP CONSTRAINT "youth_profiles_person_id_fkey"

-- reason=contains_drop
-- -- DropIndex
-- DROP INDEX "public"."idx_submissions_created_at"

-- reason=contains_drop
-- -- DropIndex
-- DROP INDEX "public"."idx_submissions_module"

-- reason=contains_drop
-- -- AlterTable
-- ALTER TABLE "public"."counties" DROP CONSTRAINT "counties_pkey",
-- DROP COLUMN "created_at",
-- DROP COLUMN "name",
-- ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- ADD COLUMN     "displayName" TEXT NOT NULL,
-- ADD COLUMN     "featuredEventSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
-- ADD COLUMN     "heroEyebrow" TEXT,
-- ADD COLUMN     "heroIntro" TEXT,
-- ADD COLUMN     "leadBio" TEXT,
-- ADD COLUMN     "leadName" TEXT,
-- ADD COLUMN     "leadPhotoUrl" TEXT,
-- ADD COLUMN     "leadTitle" TEXT,
-- ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
-- ADD COLUMN     "regionLabel" TEXT,
-- ADD COLUMN     "showOnStatewideMap" BOOLEAN NOT NULL DEFAULT true,
-- ADD COLUMN     "slug" TEXT NOT NULL,
-- ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
-- ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
-- ALTER COLUMN "id" DROP DEFAULT,
-- ALTER COLUMN "id" SET DATA TYPE TEXT,
-- ALTER COLUMN "fips" SET NOT NULL,
-- ADD CONSTRAINT "counties_pkey" PRIMARY KEY ("id")

-- reason=contains_drop
-- -- AlterTable
-- ALTER TABLE "public"."media_assets" DROP CONSTRAINT "media_assets_pkey",
-- DROP COLUMN "captured_at",
-- DROP COLUMN "context",
-- DROP COLUMN "created_at",
-- DROP COLUMN "ingestion_job_id",
-- DROP COLUMN "media_type",
-- DROP COLUMN "storage_path",
-- DROP COLUMN "uploaded_by",
-- ADD COLUMN     "alt" TEXT,
-- ADD COLUMN     "caption" TEXT,
-- ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- ADD COLUMN     "height" INTEGER,
-- ADD COLUMN     "kind" "public"."MediaKind" NOT NULL DEFAULT 'IMAGE',
-- ADD COLUMN     "originExternalId" TEXT,
-- ADD COLUMN     "originPlatform" "public"."ContentPlatform",
-- ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
-- ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
-- ADD COLUMN     "url" TEXT NOT NULL,
-- ADD COLUMN     "usageNotes" TEXT,
-- ADD COLUMN     "width" INTEGER,
-- ALTER COLUMN "id" DROP DEFAULT,
-- ALTER COLUMN "id" SET DATA TYPE TEXT,
-- ADD CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")

-- reason=contains_drop
-- -- AlterTable
-- ALTER TABLE "public"."submissions" DROP CONSTRAINT "submissions_pkey",
-- DROP COLUMN "created_at",
-- DROP COLUMN "module_id",
-- DROP COLUMN "processed",
-- DROP COLUMN "raw_data",
-- DROP COLUMN "source",
-- ADD COLUMN     "content" TEXT NOT NULL,
-- ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- ADD COLUMN     "structuredData" JSONB,
-- ADD COLUMN     "type" TEXT NOT NULL,
-- ADD COLUMN     "userId" TEXT,
-- ALTER COLUMN "id" DROP DEFAULT,
-- ALTER COLUMN "id" SET DATA TYPE TEXT,
-- ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."audit_log_entries"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."custom_oauth_providers"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."flow_state"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."identities"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."instances"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."mfa_amr_claims"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."mfa_challenges"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."mfa_factors"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."oauth_authorizations"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."oauth_client_states"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."oauth_clients"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."oauth_consents"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."one_time_tokens"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."refresh_tokens"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."saml_providers"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."saml_relay_states"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."schema_migrations"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."sessions"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."sso_domains"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."sso_providers"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."users"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."webauthn_challenges"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "auth"."webauthn_credentials"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ar02_voter_dem_lean"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ar02_voter_race"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ar02_voters"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ballot_initiatives"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ballot_items"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."bls_county_economics"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."candidates"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."census_block_groups"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."census_demographics"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."census_tracts"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."civic_engagement_index"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."contact_origins"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."contact_voter_matches"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."contacts"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."contest_partisan_index"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."contests"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."county_campaign_targets"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."county_results"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."county_turnout"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."donations"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."election_candidates"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."election_contests"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."election_results"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."elections"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."event_notifications"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."event_requests"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."events"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."external_intelligence_sources"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."external_records"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."followups"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."geographic_scores"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."geographic_units"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."geography_leaders"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ingestion_entities"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ingestion_extractions"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ingestion_files"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ingestion_jobs"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ingestion_mapping_suggestions"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ingestion_reviews"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."ingestion_write_events"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."initiative_signatures"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."intelligence_links"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."interactions"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."leadership_roles"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."locations"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."media_entity_links"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."media_tags"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."message_audience_members"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."message_audiences"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."message_campaigns"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."message_events"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."message_queue"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."message_templates"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."organization_types"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."organizations"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."organizer_assignments"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."organizing_targets"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."organizing_unit_hierarchy"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."organizing_unit_memberships"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."organizing_unit_types"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."organizing_units"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."path_to_victory"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."people"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."person_geography"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."person_profiles"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."petition_signatures"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."petitions"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."precinct_scores"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."profiles"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."results"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."runoff_fracture_index"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."shifts"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."statewide_win_targets"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."target_universes"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."tasks"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."telemetry_events"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."training_certifications"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."training_courses"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."training_enrollments"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."training_events"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."training_modules"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."training_path_modules"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."training_paths"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."training_progress"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."training_records"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."turf_people"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."turfs"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."user_auth_methods"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."users"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."volunteer_intake_submissions"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."volunteer_profiles"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."volunteer_signups"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."volunteer_sources"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."volunteers"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."voter_block_group_map"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."voter_geocoded"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."voter_import_batches"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."voter_party_model"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."voter_profiles"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."voter_registry"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."voter_scores"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."voter_vote_history"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."voter_vote_history_raw"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."voters"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."workspace_feature_flags"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."workspace_geography_scope"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."workspace_members"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."workspace_roles"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."workspace_types"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."workspaces"

-- reason=contains_drop
-- -- DropTable
-- DROP TABLE "public"."youth_profiles"

-- reason=contains_drop
-- -- DropEnum
-- DROP TYPE "auth"."aal_level"

-- reason=contains_drop
-- -- DropEnum
-- DROP TYPE "auth"."code_challenge_method"

-- reason=contains_drop
-- -- DropEnum
-- DROP TYPE "auth"."factor_status"

-- reason=contains_drop
-- -- DropEnum
-- DROP TYPE "auth"."factor_type"

-- reason=contains_drop
-- -- DropEnum
-- DROP TYPE "auth"."oauth_authorization_status"

-- reason=contains_drop
-- -- DropEnum
-- DROP TYPE "auth"."oauth_client_type"

-- reason=contains_drop
-- -- DropEnum
-- DROP TYPE "auth"."oauth_registration_type"

-- reason=contains_drop
-- -- DropEnum
-- DROP TYPE "auth"."oauth_response_type"

-- reason=contains_drop
-- -- DropEnum
-- DROP TYPE "auth"."one_time_token_type"

-- reason=create_table_target_already_observed
-- -- CreateTable
-- CREATE TABLE "public"."User" (
--     "id" TEXT NOT NULL,
--     "email" TEXT NOT NULL,
--     "name" TEXT,
--     "phone" TEXT,
--     "zip" TEXT,
--     "county" TEXT,
--     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--     "linkedVoterRecordId" TEXT,
--
--     CONSTRAINT "User_pkey" PRIMARY KEY ("id")
-- )

-- reason=high_risk_voter_semantic_table
-- -- CreateTable
-- CREATE TABLE "public"."VoterFileSnapshot" (
--     "id" TEXT NOT NULL,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "fileReceivedAt" TIMESTAMP(3),
--     "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "fileAsOfDate" TIMESTAMP(3) NOT NULL,
--     "previousSnapshotId" TEXT,
--     "sourceFilename" TEXT,
--     "sourceFileHash" TEXT,
--     "rowCountProcessed" INTEGER,
--     "status" "public"."VoterFileIngestStatus" NOT NULL DEFAULT 'RECEIVED',
--     "errorMessage" TEXT,
--     "operatorNotes" TEXT,
--
--     CONSTRAINT "VoterFileSnapshot_pkey" PRIMARY KEY ("id")
-- )

-- reason=high_risk_voter_semantic_table
-- -- CreateTable
-- CREATE TABLE "public"."CountyVoterMetrics" (
--     "id" TEXT NOT NULL,
--     "countyId" TEXT NOT NULL,
--     "countySlug" TEXT NOT NULL,
--     "voterFileSnapshotId" TEXT NOT NULL,
--     "asOfDate" TIMESTAMP(3) NOT NULL,
--     "registrationBaselineDate" TIMESTAMP(3) NOT NULL,
--     "totalRegisteredCount" INTEGER,
--     "newRegistrationsSinceBaseline" INTEGER NOT NULL DEFAULT 0,
--     "newRegistrationsSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
--     "droppedSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
--     "netChangeSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
--     "countyGoal" INTEGER,
--     "progressPercent" DOUBLE PRECISION,
--     "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "reviewStatus" "public"."CountyContentReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
--
--     CONSTRAINT "CountyVoterMetrics_pkey" PRIMARY KEY ("id")
-- )

-- reason=high_risk_voter_semantic_table
-- -- CreateTable
-- CREATE TABLE "public"."VoterRecord" (
--     "id" TEXT NOT NULL,
--     "voterFileKey" TEXT NOT NULL,
--     "countyFips" TEXT NOT NULL,
--     "countyId" TEXT NOT NULL,
--     "countySlug" TEXT NOT NULL,
--     "city" TEXT,
--     "precinct" TEXT,
--     "registrationDate" TIMESTAMP(3),
--     "firstSeenSnapshotId" TEXT NOT NULL,
--     "lastSeenSnapshotId" TEXT NOT NULL,
--     "updatedFromSnapshotId" TEXT,
--     "droppedAtSnapshotId" TEXT,
--     "droppedOffAt" TIMESTAMP(3),
--     "inLatestCompletedFile" BOOLEAN NOT NULL DEFAULT true,
--     "firstName" TEXT,
--     "lastName" TEXT,
--     "phone10" TEXT,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--
--     CONSTRAINT "VoterRecord_pkey" PRIMARY KEY ("id")
-- )

-- reason=high_risk_voter_semantic_table
-- -- CreateTable
-- CREATE TABLE "public"."VoterElectionParticipation" (
--     "id" TEXT NOT NULL,
--     "voterRecordId" TEXT NOT NULL,
--     "contestKey" TEXT NOT NULL,
--     "participated" BOOLEAN NOT NULL,
--     "primaryBallotParty" TEXT,
--     "provenance" "public"."VoterParticipationProvenance" NOT NULL DEFAULT 'VENDOR_VOTER_FILE',
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--
--     CONSTRAINT "VoterElectionParticipation_pkey" PRIMARY KEY ("id")
-- )

-- reason=high_risk_voter_semantic_table
-- -- CreateTable
-- CREATE TABLE "public"."VoterSignal" (
--     "id" TEXT NOT NULL,
--     "voterRecordId" TEXT,
--     "userId" TEXT,
--     "relationalContactId" TEXT,
--     "signalKind" "public"."VoterSignalKind" NOT NULL,
--     "signalSource" "public"."VoterSignalSource" NOT NULL,
--     "signalStrength" "public"."VoterSignalStrength" NOT NULL,
--     "signalDate" TIMESTAMP(3),
--     "confidence" "public"."ModelConfidence" NOT NULL,
--     "notes" TEXT,
--     "metadataJson" JSONB,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--
--     CONSTRAINT "VoterSignal_pkey" PRIMARY KEY ("id")
-- )

-- reason=high_risk_voter_semantic_table
-- -- CreateTable
-- CREATE TABLE "public"."VoterModelClassification" (
--     "id" TEXT NOT NULL,
--     "voterRecordId" TEXT NOT NULL,
--     "classification" "public"."VoterClassification" NOT NULL,
--     "confidence" "public"."ModelConfidence" NOT NULL,
--     "sourceSummary" TEXT,
--     "modelVersion" TEXT NOT NULL DEFAULT 'voter-model-v1',
--     "generatedBy" "public"."ModelGeneratedBy" NOT NULL,
--     "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "isCurrent" BOOLEAN NOT NULL DEFAULT true,
--     "overriddenByUserId" TEXT,
--     "overriddenAt" TIMESTAMP(3),
--     "overrideReason" TEXT,
--     "metadataJson" JSONB,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--
--     CONSTRAINT "VoterModelClassification_pkey" PRIMARY KEY ("id")
-- )

-- reason=high_risk_voter_semantic_table
-- -- CreateTable
-- CREATE TABLE "public"."VoterInteraction" (
--     "id" TEXT NOT NULL,
--     "voterRecordId" TEXT,
--     "relationalContactId" TEXT,
--     "contactedByUserId" TEXT,
--     "relatedVolunteerUserId" TEXT,
--     "interactionType" "public"."VoterInteractionType" NOT NULL,
--     "interactionChannel" "public"."VoterInteractionChannel" NOT NULL,
--     "interactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "supportLevel" "public"."VoterSupportLevel",
--     "registrationChecked" BOOLEAN NOT NULL DEFAULT false,
--     "registrationStatusAtContact" TEXT,
--     "wantsFollowUp" BOOLEAN NOT NULL DEFAULT false,
--     "followUpNotes" TEXT,
--     "votePlanStatus" "public"."VotePlanStatus",
--     "notes" TEXT,
--     "metadataJson" JSONB,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--
--     CONSTRAINT "VoterInteraction_pkey" PRIMARY KEY ("id")
-- )

-- reason=high_risk_voter_semantic_table
-- -- CreateTable
-- CREATE TABLE "public"."VoterVotePlan" (
--     "id" TEXT NOT NULL,
--     "voterRecordId" TEXT NOT NULL,
--     "createdByUserId" TEXT,
--     "planStatus" "public"."VotePlanStatus" NOT NULL DEFAULT 'NEEDS_PLAN',
--     "votingMethod" TEXT,
--     "plannedVoteDate" TIMESTAMP(3),
--     "pollingPlaceNotes" TEXT,
--     "transportationNeeded" BOOLEAN NOT NULL DEFAULT false,
--     "reminderNeeded" BOOLEAN NOT NULL DEFAULT true,
--     "notes" TEXT,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--
--     CONSTRAINT "VoterVotePlan_pkey" PRIMARY KEY ("id")
-- )

-- reason=high_risk_voter_semantic_table
-- -- CreateTable
-- CREATE TABLE "public"."VoterSnapshotChange" (
--     "id" TEXT NOT NULL,
--     "voterFileSnapshotId" TEXT NOT NULL,
--     "voterRecordId" TEXT,
--     "voterFileKey" TEXT NOT NULL,
--     "changeType" "public"."VoterSnapshotChangeType" NOT NULL,
--     "countyId" TEXT NOT NULL,
--     "countySlug" TEXT NOT NULL,
--     "summaryJson" JSONB,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--
--     CONSTRAINT "VoterSnapshotChange_pkey" PRIMARY KEY ("id")
-- )

-- reason=high_risk_voter_semantic_table
-- -- CreateTable
-- CREATE TABLE "public"."OppositionVoteRecord" (
--     "id" TEXT NOT NULL,
--     "entityId" TEXT NOT NULL,
--     "sourceId" TEXT,
--     "billNumber" TEXT,
--     "vote" TEXT,
--     "voteDate" TIMESTAMP(3),
--     "chamber" TEXT,
--     "category" TEXT,
--     "impactGroup" TEXT,
--     "confidence" "public"."OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
--     "reviewStatus" "public"."OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
--     "notes" TEXT,
--     "metadataJson" JSONB NOT NULL DEFAULT '{}',
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--
--     CONSTRAINT "OppositionVoteRecord_pkey" PRIMARY KEY ("id")
-- )

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE UNIQUE INDEX "VoterFileSnapshot_sourceFileHash_key" ON "public"."VoterFileSnapshot"("sourceFileHash")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterFileSnapshot_fileAsOfDate_idx" ON "public"."VoterFileSnapshot"("fileAsOfDate")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterFileSnapshot_status_fileAsOfDate_idx" ON "public"."VoterFileSnapshot"("status", "fileAsOfDate")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "CountyVoterMetrics_countySlug_asOfDate_idx" ON "public"."CountyVoterMetrics"("countySlug", "asOfDate")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "CountyVoterMetrics_asOfDate_idx" ON "public"."CountyVoterMetrics"("asOfDate")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "CountyVoterMetrics_countyId_asOfDate_idx" ON "public"."CountyVoterMetrics"("countyId", "asOfDate")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE UNIQUE INDEX "CountyVoterMetrics_countyId_voterFileSnapshotId_key" ON "public"."CountyVoterMetrics"("countyId", "voterFileSnapshotId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE UNIQUE INDEX "VoterRecord_voterFileKey_key" ON "public"."VoterRecord"("voterFileKey")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterRecord_countyId_inLatestCompletedFile_idx" ON "public"."VoterRecord"("countyId", "inLatestCompletedFile")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterRecord_countyId_lastName_firstName_idx" ON "public"."VoterRecord"("countyId", "lastName", "firstName")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterRecord_phone10_idx" ON "public"."VoterRecord"("phone10")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterRecord_countySlug_idx" ON "public"."VoterRecord"("countySlug")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterRecord_countyFips_idx" ON "public"."VoterRecord"("countyFips")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterRecord_registrationDate_idx" ON "public"."VoterRecord"("registrationDate")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterElectionParticipation_voterRecordId_idx" ON "public"."VoterElectionParticipation"("voterRecordId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterElectionParticipation_contestKey_participated_idx" ON "public"."VoterElectionParticipation"("contestKey", "participated")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterElectionParticipation_contestKey_primaryBallotParty_idx" ON "public"."VoterElectionParticipation"("contestKey", "primaryBallotParty")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE UNIQUE INDEX "VoterElectionParticipation_voterRecordId_contestKey_key" ON "public"."VoterElectionParticipation"("voterRecordId", "contestKey")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterSignal_voterRecordId_idx" ON "public"."VoterSignal"("voterRecordId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterSignal_userId_idx" ON "public"."VoterSignal"("userId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterSignal_relationalContactId_idx" ON "public"."VoterSignal"("relationalContactId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterSignal_signalKind_idx" ON "public"."VoterSignal"("signalKind")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterModelClassification_voterRecordId_idx" ON "public"."VoterModelClassification"("voterRecordId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterModelClassification_voterRecordId_isCurrent_idx" ON "public"."VoterModelClassification"("voterRecordId", "isCurrent")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterInteraction_voterRecordId_idx" ON "public"."VoterInteraction"("voterRecordId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterInteraction_relationalContactId_idx" ON "public"."VoterInteraction"("relationalContactId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterInteraction_contactedByUserId_idx" ON "public"."VoterInteraction"("contactedByUserId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterInteraction_relatedVolunteerUserId_idx" ON "public"."VoterInteraction"("relatedVolunteerUserId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterInteraction_interactionDate_idx" ON "public"."VoterInteraction"("interactionDate")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterVotePlan_voterRecordId_idx" ON "public"."VoterVotePlan"("voterRecordId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterSnapshotChange_voterFileSnapshotId_changeType_idx" ON "public"."VoterSnapshotChange"("voterFileSnapshotId", "changeType")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterSnapshotChange_countySlug_voterFileSnapshotId_idx" ON "public"."VoterSnapshotChange"("countySlug", "voterFileSnapshotId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "VoterSnapshotChange_voterFileKey_idx" ON "public"."VoterSnapshotChange"("voterFileKey")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "OppositionVoteRecord_entityId_idx" ON "public"."OppositionVoteRecord"("entityId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "OppositionVoteRecord_sourceId_idx" ON "public"."OppositionVoteRecord"("sourceId")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE UNIQUE INDEX "counties_slug_key" ON "public"."counties"("slug")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE UNIQUE INDEX "counties_fips_key" ON "public"."counties"("fips")

-- reason=create_index_on_table_not_in_candidate_new_set
-- -- CreateIndex
-- CREATE INDEX "counties_published_sortOrder_idx" ON "public"."counties"("published", "sortOrder")

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."User" ADD CONSTRAINT "User_linkedVoterRecordId_fkey" FOREIGN KEY ("linkedVoterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ComplianceDocument" ADD CONSTRAINT "ComplianceDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."FieldUnit" ADD CONSTRAINT "FieldUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."FieldUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."FieldAssignment" ADD CONSTRAINT "FieldAssignment_fieldUnitId_fkey" FOREIGN KEY ("fieldUnitId") REFERENCES "public"."FieldUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."FieldAssignment" ADD CONSTRAINT "FieldAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."FieldAssignment" ADD CONSTRAINT "FieldAssignment_positionSeatId_fkey" FOREIGN KEY ("positionSeatId") REFERENCES "public"."PositionSeat"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."BudgetLine" ADD CONSTRAINT "BudgetLine_budgetPlanId_fkey" FOREIGN KEY ("budgetPlanId") REFERENCES "public"."BudgetPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."PositionSeat" ADD CONSTRAINT "PositionSeat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ContactPreference" ADD CONSTRAINT "ContactPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ContactPreference" ADD CONSTRAINT "ContactPreference_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ContactPreference" ADD CONSTRAINT "ContactPreference_communicationThreadId_fkey" FOREIGN KEY ("communicationThreadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VolunteerProfile" ADD CONSTRAINT "VolunteerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."Commitment" ADD CONSTRAINT "Commitment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."WorkflowIntake" ADD CONSTRAINT "WorkflowIntake_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."WorkflowIntake" ADD CONSTRAINT "WorkflowIntake_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."WorkflowIntake" ADD CONSTRAINT "WorkflowIntake_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventRequest" ADD CONSTRAINT "EventRequest_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventRequest" ADD CONSTRAINT "EventRequest_campaignEventId_fkey" FOREIGN KEY ("campaignEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."WorkflowAction" ADD CONSTRAINT "WorkflowAction_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."WorkflowAction" ADD CONSTRAINT "WorkflowAction_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialContentItem" ADD CONSTRAINT "SocialContentItem_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialContentItem" ADD CONSTRAINT "SocialContentItem_campaignEventId_fkey" FOREIGN KEY ("campaignEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialContentItem" ADD CONSTRAINT "SocialContentItem_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_sourceSocialContentItemId_fkey" FOREIGN KEY ("sourceSocialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_createdSocialContentItemId_fkey" FOREIGN KEY ("createdSocialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_createdWorkflowIntakeId_fkey" FOREIGN KEY ("createdWorkflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_executedSocialContentItemId_fkey" FOREIGN KEY ("executedSocialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialContentDraft" ADD CONSTRAINT "SocialContentDraft_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialContentDraft" ADD CONSTRAINT "SocialContentDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialPlatformVariant" ADD CONSTRAINT "SocialPlatformVariant_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialPlatformVariant" ADD CONSTRAINT "SocialPlatformVariant_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "public"."SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialPerformanceSnapshot" ADD CONSTRAINT "SocialPerformanceSnapshot_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialPerformanceSnapshot" ADD CONSTRAINT "SocialPerformanceSnapshot_socialPlatformVariantId_fkey" FOREIGN KEY ("socialPlatformVariantId") REFERENCES "public"."SocialPlatformVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialPerformanceSnapshot" ADD CONSTRAINT "SocialPerformanceSnapshot_conversionCampaignEventId_fkey" FOREIGN KEY ("conversionCampaignEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialContentStrategicInsight" ADD CONSTRAINT "SocialContentStrategicInsight_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationWatchlist" ADD CONSTRAINT "ConversationWatchlist_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationWatchlist" ADD CONSTRAINT "ConversationWatchlist_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationItem" ADD CONSTRAINT "ConversationItem_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationItem" ADD CONSTRAINT "ConversationItem_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "public"."ConversationWatchlist"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationAnalysis" ADD CONSTRAINT "ConversationAnalysis_conversationItemId_fkey" FOREIGN KEY ("conversationItemId") REFERENCES "public"."ConversationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationCluster" ADD CONSTRAINT "ConversationCluster_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationClusterItem" ADD CONSTRAINT "ConversationClusterItem_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "public"."ConversationCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationClusterItem" ADD CONSTRAINT "ConversationClusterItem_conversationItemId_fkey" FOREIGN KEY ("conversationItemId") REFERENCES "public"."ConversationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_primaryConversationItemId_fkey" FOREIGN KEY ("primaryConversationItemId") REFERENCES "public"."ConversationItem"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "public"."ConversationCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_socialPlatformVariantId_fkey" FOREIGN KEY ("socialPlatformVariantId") REFERENCES "public"."SocialPlatformVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SyncedPost" ADD CONSTRAINT "SyncedPost_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ContentItemOverride" ADD CONSTRAINT "ContentItemOverride_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."InboundContentItem" ADD CONSTRAINT "InboundContentItem_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."InboundContentItem" ADD CONSTRAINT "InboundContentItem_syncedPostId_fkey" FOREIGN KEY ("syncedPostId") REFERENCES "public"."SyncedPost"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ContentDecision" ADD CONSTRAINT "ContentDecision_inboundItemId_fkey" FOREIGN KEY ("inboundItemId") REFERENCES "public"."InboundContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."PlatformMetricSnapshot" ADD CONSTRAINT "PlatformMetricSnapshot_platformConnectionId_fkey" FOREIGN KEY ("platformConnectionId") REFERENCES "public"."PlatformConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_linkedCampaignEventId_fkey" FOREIGN KEY ("linkedCampaignEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_parentAssetId_fkey" FOREIGN KEY ("parentAssetId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_rootAssetId_fkey" FOREIGN KEY ("rootAssetId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_mediaIngestBatchId_fkey" FOREIGN KEY ("mediaIngestBatchId") REFERENCES "public"."MediaIngestBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaAnnotation" ADD CONSTRAINT "OwnedMediaAnnotation_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaAnnotation" ADD CONSTRAINT "OwnedMediaAnnotation_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaTranscript" ADD CONSTRAINT "OwnedMediaTranscript_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaQuoteCandidate" ADD CONSTRAINT "OwnedMediaQuoteCandidate_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaQuoteCandidate" ADD CONSTRAINT "OwnedMediaQuoteCandidate_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "public"."OwnedMediaTranscript"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ElectionContestResult" ADD CONSTRAINT "ElectionContestResult_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."ElectionResultSource"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ElectionCountyResult" ADD CONSTRAINT "ElectionCountyResult_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."ElectionResultSource"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ElectionCountyResult" ADD CONSTRAINT "ElectionCountyResult_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "public"."ElectionContestResult"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ElectionCountyResult" ADD CONSTRAINT "ElectionCountyResult_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ElectionCandidateResult" ADD CONSTRAINT "ElectionCandidateResult_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "public"."ElectionContestResult"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ElectionCandidateResult" ADD CONSTRAINT "ElectionCandidateResult_countyResultId_fkey" FOREIGN KEY ("countyResultId") REFERENCES "public"."ElectionCountyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ElectionPrecinctResult" ADD CONSTRAINT "ElectionPrecinctResult_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."ElectionResultSource"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ElectionPrecinctResult" ADD CONSTRAINT "ElectionPrecinctResult_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "public"."ElectionContestResult"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ElectionPrecinctResult" ADD CONSTRAINT "ElectionPrecinctResult_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ElectionPrecinctCandidateResult" ADD CONSTRAINT "ElectionPrecinctCandidateResult_precinctResultId_fkey" FOREIGN KEY ("precinctResultId") REFERENCES "public"."ElectionPrecinctResult"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CountyCampaignStats" ADD CONSTRAINT "CountyCampaignStats_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CountyPublicDemographics" ADD CONSTRAINT "CountyPublicDemographics_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CountyRegistrationSnapshot" ADD CONSTRAINT "CountyRegistrationSnapshot_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CountyStrategyKpi" ADD CONSTRAINT "CountyStrategyKpi_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CountyElectedOfficial" ADD CONSTRAINT "CountyElectedOfficial_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterFileSnapshot" ADD CONSTRAINT "VoterFileSnapshot_previousSnapshotId_fkey" FOREIGN KEY ("previousSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CountyVoterMetrics" ADD CONSTRAINT "CountyVoterMetrics_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CountyVoterMetrics" ADD CONSTRAINT "CountyVoterMetrics_voterFileSnapshotId_fkey" FOREIGN KEY ("voterFileSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterRecord" ADD CONSTRAINT "VoterRecord_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterRecord" ADD CONSTRAINT "VoterRecord_firstSeenSnapshotId_fkey" FOREIGN KEY ("firstSeenSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterRecord" ADD CONSTRAINT "VoterRecord_lastSeenSnapshotId_fkey" FOREIGN KEY ("lastSeenSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterRecord" ADD CONSTRAINT "VoterRecord_updatedFromSnapshotId_fkey" FOREIGN KEY ("updatedFromSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterRecord" ADD CONSTRAINT "VoterRecord_droppedAtSnapshotId_fkey" FOREIGN KEY ("droppedAtSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterElectionParticipation" ADD CONSTRAINT "VoterElectionParticipation_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterSignal" ADD CONSTRAINT "VoterSignal_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterSignal" ADD CONSTRAINT "VoterSignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterSignal" ADD CONSTRAINT "VoterSignal_relationalContactId_fkey" FOREIGN KEY ("relationalContactId") REFERENCES "public"."RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterModelClassification" ADD CONSTRAINT "VoterModelClassification_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterModelClassification" ADD CONSTRAINT "VoterModelClassification_overriddenByUserId_fkey" FOREIGN KEY ("overriddenByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterInteraction" ADD CONSTRAINT "VoterInteraction_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterInteraction" ADD CONSTRAINT "VoterInteraction_relationalContactId_fkey" FOREIGN KEY ("relationalContactId") REFERENCES "public"."RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterInteraction" ADD CONSTRAINT "VoterInteraction_contactedByUserId_fkey" FOREIGN KEY ("contactedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterInteraction" ADD CONSTRAINT "VoterInteraction_relatedVolunteerUserId_fkey" FOREIGN KEY ("relatedVolunteerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."RelationalContact" ADD CONSTRAINT "RelationalContact_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."RelationalContact" ADD CONSTRAINT "RelationalContact_matchedVoterRecordId_fkey" FOREIGN KEY ("matchedVoterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."RelationalContact" ADD CONSTRAINT "RelationalContact_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."RelationalContact" ADD CONSTRAINT "RelationalContact_fieldUnitId_fkey" FOREIGN KEY ("fieldUnitId") REFERENCES "public"."FieldUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterVotePlan" ADD CONSTRAINT "VoterVotePlan_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterVotePlan" ADD CONSTRAINT "VoterVotePlan_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_voterFileSnapshotId_fkey" FOREIGN KEY ("voterFileSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CampaignEvent" ADD CONSTRAINT "CampaignEvent_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CampaignEvent" ADD CONSTRAINT "CampaignEvent_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CampaignEvent" ADD CONSTRAINT "CampaignEvent_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CampaignEvent" ADD CONSTRAINT "CampaignEvent_calendarSourceId_fkey" FOREIGN KEY ("calendarSourceId") REFERENCES "public"."CalendarSource"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ArkansasFestivalIngest" ADD CONSTRAINT "ArkansasFestivalIngest_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ArkansasFestivalIngest" ADD CONSTRAINT "ArkansasFestivalIngest_promotedCampaignEventId_fkey" FOREIGN KEY ("promotedCampaignEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ArkansasFestivalIngest" ADD CONSTRAINT "ArkansasFestivalIngest_ingestRunId_fkey" FOREIGN KEY ("ingestRunId") REFERENCES "public"."FestivalIngestRun"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "public"."WorkflowRun"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "public"."CampaignTask"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."WorkflowTemplateTask" ADD CONSTRAINT "WorkflowTemplateTask_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "public"."WorkflowTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "public"."WorkflowTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "public"."WorkflowRun"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventSignup" ADD CONSTRAINT "EventSignup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventSignup" ADD CONSTRAINT "EventSignup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventSignup" ADD CONSTRAINT "EventSignup_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventSignup" ADD CONSTRAINT "EventSignup_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."TeamRoleAssignment" ADD CONSTRAINT "TeamRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."TeamRoleAssignment" ADD CONSTRAINT "TeamRoleAssignment_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."MediaIngestBatch" ADD CONSTRAINT "MediaIngestBatch_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaCollectionItem" ADD CONSTRAINT "OwnedMediaCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."OwnedMediaCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaCollectionItem" ADD CONSTRAINT "OwnedMediaCollectionItem_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaReviewLog" ADD CONSTRAINT "OwnedMediaReviewLog_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaReviewLog" ADD CONSTRAINT "OwnedMediaReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OwnedMediaDerivativeJob" ADD CONSTRAINT "OwnedMediaDerivativeJob_sourceAssetId_fkey" FOREIGN KEY ("sourceAssetId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SignupSheetDocument" ADD CONSTRAINT "SignupSheetDocument_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SignupSheetDocument" ADD CONSTRAINT "SignupSheetDocument_lastExtractionId_fkey" FOREIGN KEY ("lastExtractionId") REFERENCES "public"."SignupSheetExtraction"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SignupSheetDocument" ADD CONSTRAINT "SignupSheetDocument_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SignupSheetExtraction" ADD CONSTRAINT "SignupSheetExtraction_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."SignupSheetDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."SignupSheetDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_extractionId_fkey" FOREIGN KEY ("extractionId") REFERENCES "public"."SignupSheetExtraction"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_matchedVoterRecordId_fkey" FOREIGN KEY ("matchedVoterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_matchedUserId_fkey" FOREIGN KEY ("matchedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VolunteerMatchCandidate" ADD CONSTRAINT "VolunteerMatchCandidate_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."SignupSheetEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."VolunteerMatchCandidate" ADD CONSTRAINT "VolunteerMatchCandidate_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationThread" ADD CONSTRAINT "CommunicationThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationThread" ADD CONSTRAINT "CommunicationThread_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationThread" ADD CONSTRAINT "CommunicationThread_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationThread" ADD CONSTRAINT "CommunicationThread_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_communicationCampaignId_fkey" FOREIGN KEY ("communicationCampaignId") REFERENCES "public"."CommunicationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_communicationCampaignRecipientId_fkey" FOREIGN KEY ("communicationCampaignRecipientId") REFERENCES "public"."CommunicationCampaignRecipient"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationTemplate" ADD CONSTRAINT "CommunicationTemplate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."AudienceSegment" ADD CONSTRAINT "AudienceSegment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."CommunicationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_audienceSegmentId_fkey" FOREIGN KEY ("audienceSegmentId") REFERENCES "public"."AudienceSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_communicationCampaignId_fkey" FOREIGN KEY ("communicationCampaignId") REFERENCES "public"."CommunicationCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_communicationThreadId_fkey" FOREIGN KEY ("communicationThreadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_targetVolunteerProfileId_fkey" FOREIGN KEY ("targetVolunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationThreadTag" ADD CONSTRAINT "CommunicationThreadTag_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationThreadTag" ADD CONSTRAINT "CommunicationThreadTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."CommunicationTag"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceWorkflowIntakeId_fkey" FOREIGN KEY ("sourceWorkflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceCampaignTaskId_fkey" FOREIGN KEY ("sourceCampaignTaskId") REFERENCES "public"."CampaignTask"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceEventId_fkey" FOREIGN KEY ("sourceEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceSocialContentItemId_fkey" FOREIGN KEY ("sourceSocialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_communicationPlanId_fkey" FOREIGN KEY ("communicationPlanId") REFERENCES "public"."CommunicationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_reviewRequestedByUserId_fkey" FOREIGN KEY ("reviewRequestedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationVariant" ADD CONSTRAINT "CommunicationVariant_communicationDraftId_fkey" FOREIGN KEY ("communicationDraftId") REFERENCES "public"."CommunicationDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationVariant" ADD CONSTRAINT "CommunicationVariant_reviewRequestedByUserId_fkey" FOREIGN KEY ("reviewRequestedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationVariant" ADD CONSTRAINT "CommunicationVariant_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_communicationPlanId_fkey" FOREIGN KEY ("communicationPlanId") REFERENCES "public"."CommunicationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_communicationDraftId_fkey" FOREIGN KEY ("communicationDraftId") REFERENCES "public"."CommunicationDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_communicationVariantId_fkey" FOREIGN KEY ("communicationVariantId") REFERENCES "public"."CommunicationVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_queuedByUserId_fkey" FOREIGN KEY ("queuedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_lastRetriedByUserId_fkey" FOREIGN KEY ("lastRetriedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationThreadId_fkey" FOREIGN KEY ("communicationThreadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationPlanId_fkey" FOREIGN KEY ("communicationPlanId") REFERENCES "public"."CommunicationPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationSendId_fkey" FOREIGN KEY ("communicationSendId") REFERENCES "public"."CommunicationSend"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_campaignTaskId_fkey" FOREIGN KEY ("campaignTaskId") REFERENCES "public"."CampaignTask"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_conversationOpportunityId_fkey" FOREIGN KEY ("conversationOpportunityId") REFERENCES "public"."ConversationOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_comsPlanAudienceSegmentId_fkey" FOREIGN KEY ("comsPlanAudienceSegmentId") REFERENCES "public"."CommsPlanAudienceSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationMessageId_fkey" FOREIGN KEY ("communicationMessageId") REFERENCES "public"."CommunicationMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactProfile" ADD CONSTRAINT "EmailContactProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactProfile" ADD CONSTRAINT "EmailContactProfile_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactProfile" ADD CONSTRAINT "EmailContactProfile_relationalContactId_fkey" FOREIGN KEY ("relationalContactId") REFERENCES "public"."RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactProfileFact" ADD CONSTRAINT "EmailContactProfileFact_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactProfileFact" ADD CONSTRAINT "EmailContactProfileFact_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactProfileFactSuggestion" ADD CONSTRAINT "EmailContactProfileFactSuggestion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactProfileFactSuggestion" ADD CONSTRAINT "EmailContactProfileFactSuggestion_emailWorkflowItemId_fkey" FOREIGN KEY ("emailWorkflowItemId") REFERENCES "public"."EmailWorkflowItem"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactProfileFactSuggestion" ADD CONSTRAINT "EmailContactProfileFactSuggestion_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailAudienceHint" ADD CONSTRAINT "EmailAudienceHint_emailWorkflowItemId_fkey" FOREIGN KEY ("emailWorkflowItemId") REFERENCES "public"."EmailWorkflowItem"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailAudienceHint" ADD CONSTRAINT "EmailAudienceHint_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailAudienceHint" ADD CONSTRAINT "EmailAudienceHint_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailAudienceDefinition" ADD CONSTRAINT "EmailAudienceDefinition_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailAudienceDefinition" ADD CONSTRAINT "EmailAudienceDefinition_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailAudiencePreviewRun" ADD CONSTRAINT "EmailAudiencePreviewRun_audienceDefinitionId_fkey" FOREIGN KEY ("audienceDefinitionId") REFERENCES "public"."EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailAudiencePreviewRun" ADD CONSTRAINT "EmailAudiencePreviewRun_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_assignedReviewerUserId_fkey" FOREIGN KEY ("assignedReviewerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."MessageStudioDraftRevision" ADD CONSTRAINT "MessageStudioDraftRevision_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."MessageStudioDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."MessageStudioDraftRevision" ADD CONSTRAINT "MessageStudioDraftRevision_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactImportBatch" ADD CONSTRAINT "EmailContactImportBatch_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactImportBatch" ADD CONSTRAINT "EmailContactImportBatch_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactImportRow" ADD CONSTRAINT "EmailContactImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."EmailContactImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactImportRow" ADD CONSTRAINT "EmailContactImportRow_matchedProfileId_fkey" FOREIGN KEY ("matchedProfileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactImportRow" ADD CONSTRAINT "EmailContactImportRow_committedProfileId_fkey" FOREIGN KEY ("committedProfileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactImportDecision" ADD CONSTRAINT "EmailContactImportDecision_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."EmailContactImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactImportDecision" ADD CONSTRAINT "EmailContactImportDecision_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."EmailContactImportRow"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailContactImportDecision" ADD CONSTRAINT "EmailContactImportDecision_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SendGridContactMap" ADD CONSTRAINT "SendGridContactMap_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SendGridContactMap" ADD CONSTRAINT "SendGridContactMap_emailAudienceDefinitionId_fkey" FOREIGN KEY ("emailAudienceDefinitionId") REFERENCES "public"."EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SendGridAudienceMap" ADD CONSTRAINT "SendGridAudienceMap_emailAudienceDefinitionId_fkey" FOREIGN KEY ("emailAudienceDefinitionId") REFERENCES "public"."EmailAudienceDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SendGridContactSyncRun" ADD CONSTRAINT "SendGridContactSyncRun_audienceDefinitionId_fkey" FOREIGN KEY ("audienceDefinitionId") REFERENCES "public"."EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SendGridContactSyncRun" ADD CONSTRAINT "SendGridContactSyncRun_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."SendGridContactSyncRun" ADD CONSTRAINT "SendGridContactSyncRun_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_messageStudioDraftId_fkey" FOREIGN KEY ("messageStudioDraftId") REFERENCES "public"."MessageStudioDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_emailAudienceDefinitionId_fkey" FOREIGN KEY ("emailAudienceDefinitionId") REFERENCES "public"."EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_sendGridContactSyncRunId_fkey" FOREIGN KEY ("sendGridContactSyncRunId") REFERENCES "public"."SendGridContactSyncRun"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_preflightByUserId_fkey" FOREIGN KEY ("preflightByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailSendRecipient" ADD CONSTRAINT "EmailSendRecipient_sendExecutionId_fkey" FOREIGN KEY ("sendExecutionId") REFERENCES "public"."EmailSendExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailSendRecipient" ADD CONSTRAINT "EmailSendRecipient_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailSendApproval" ADD CONSTRAINT "EmailSendApproval_sendExecutionId_fkey" FOREIGN KEY ("sendExecutionId") REFERENCES "public"."EmailSendExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EmailSendApproval" ADD CONSTRAINT "EmailSendApproval_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_communicationSendId_fkey" FOREIGN KEY ("communicationSendId") REFERENCES "public"."CommunicationSend"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_comsPlanAudienceSegmentId_fkey" FOREIGN KEY ("comsPlanAudienceSegmentId") REFERENCES "public"."CommsPlanAudienceSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_communicationThreadId_fkey" FOREIGN KEY ("communicationThreadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationRecipientEvent" ADD CONSTRAINT "CommunicationRecipientEvent_communicationRecipientId_fkey" FOREIGN KEY ("communicationRecipientId") REFERENCES "public"."CommunicationRecipient"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommunicationLinkDefinition" ADD CONSTRAINT "CommunicationLinkDefinition_communicationSendId_fkey" FOREIGN KEY ("communicationSendId") REFERENCES "public"."CommunicationSend"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommsPlanAudienceSegment" ADD CONSTRAINT "CommsPlanAudienceSegment_communicationPlanId_fkey" FOREIGN KEY ("communicationPlanId") REFERENCES "public"."CommunicationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommsPlanAudienceSegment" ADD CONSTRAINT "CommsPlanAudienceSegment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommsPlanAudienceSegment" ADD CONSTRAINT "CommsPlanAudienceSegment_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_comsPlanAudienceSegmentId_fkey" FOREIGN KEY ("comsPlanAudienceSegmentId") REFERENCES "public"."CommsPlanAudienceSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."MediaOutreachItem" ADD CONSTRAINT "MediaOutreachItem_linkedCommunicationPlanId_fkey" FOREIGN KEY ("linkedCommunicationPlanId") REFERENCES "public"."CommunicationPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."MediaOutreachItem" ADD CONSTRAINT "MediaOutreachItem_linkedWorkflowIntakeId_fkey" FOREIGN KEY ("linkedWorkflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."MediaOutreachItem" ADD CONSTRAINT "MediaOutreachItem_linkedConversationOpportunityId_fkey" FOREIGN KEY ("linkedConversationOpportunityId") REFERENCES "public"."ConversationOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."StaffGmailAccount" ADD CONSTRAINT "StaffGmailAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CalendarSource" ADD CONSTRAINT "CalendarSource_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."CalendarWatchChannel" ADD CONSTRAINT "CalendarWatchChannel_calendarSourceId_fkey" FOREIGN KEY ("calendarSourceId") REFERENCES "public"."CalendarSource"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."WeeklyBigRock" ADD CONSTRAINT "WeeklyBigRock_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "public"."WeeklyCampaignPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."WeeklyBigRock" ADD CONSTRAINT "WeeklyBigRock_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventApproval" ADD CONSTRAINT "EventApproval_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventApproval" ADD CONSTRAINT "EventApproval_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventApproval" ADD CONSTRAINT "EventApproval_approverUserId_fkey" FOREIGN KEY ("approverUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventStageChangeLog" ADD CONSTRAINT "EventStageChangeLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventStageChangeLog" ADD CONSTRAINT "EventStageChangeLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventSyncLog" ADD CONSTRAINT "EventSyncLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventSyncLog" ADD CONSTRAINT "EventSyncLog_calendarSourceId_fkey" FOREIGN KEY ("calendarSourceId") REFERENCES "public"."CalendarSource"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventAnalyticsSnapshot" ADD CONSTRAINT "EventAnalyticsSnapshot_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."EventAnalyticsSnapshot" ADD CONSTRAINT "EventAnalyticsSnapshot_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ExternalMediaMention" ADD CONSTRAINT "ExternalMediaMention_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."ExternalMediaSource"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ExternalMediaMention" ADD CONSTRAINT "ExternalMediaMention_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."ExternalMediaMention" ADD CONSTRAINT "ExternalMediaMention_relatedCountyId_fkey" FOREIGN KEY ("relatedCountyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionBillRecord" ADD CONSTRAINT "OppositionBillRecord_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionBillRecord" ADD CONSTRAINT "OppositionBillRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionVoteRecord" ADD CONSTRAINT "OppositionVoteRecord_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionVoteRecord" ADD CONSTRAINT "OppositionVoteRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionFinanceRecord" ADD CONSTRAINT "OppositionFinanceRecord_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionFinanceRecord" ADD CONSTRAINT "OppositionFinanceRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionMessageRecord" ADD CONSTRAINT "OppositionMessageRecord_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionMessageRecord" ADD CONSTRAINT "OppositionMessageRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionVideoRecord" ADD CONSTRAINT "OppositionVideoRecord_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionVideoRecord" ADD CONSTRAINT "OppositionVideoRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionNewsMention" ADD CONSTRAINT "OppositionNewsMention_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionNewsMention" ADD CONSTRAINT "OppositionNewsMention_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionElectionPattern" ADD CONSTRAINT "OppositionElectionPattern_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionElectionPattern" ADD CONSTRAINT "OppositionElectionPattern_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionAccountabilityItem" ADD CONSTRAINT "OppositionAccountabilityItem_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE

-- reason=update
-- -- AddForeignKey
-- ALTER TABLE "public"."OppositionAccountabilityItem" ADD CONSTRAINT "OppositionAccountabilityItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE
