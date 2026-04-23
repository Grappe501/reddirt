-- CE-1 follow-up: indexes from packet spec + unique segment membership per user (PostgreSQL allows multiple NULL userId).
CREATE INDEX "CommunicationRecipient_deliveryHealthStatus_idx" ON "CommunicationRecipient"("deliveryHealthStatus");
CREATE INDEX "CommunicationRecipient_targetSegmentId_idx" ON "CommunicationRecipient"("targetSegmentId");
CREATE INDEX "CommsPlanAudienceSegment_isDynamic_idx" ON "CommsPlanAudienceSegment"("isDynamic");
CREATE INDEX "CommsPlanAudienceSegment_name_idx" ON "CommsPlanAudienceSegment"("name");
CREATE UNIQUE INDEX "CommsPlanAudienceSegmentMember_comsPlanAudienceSegmentId_userId_key" ON "CommsPlanAudienceSegmentMember"("comsPlanAudienceSegmentId", "userId");
