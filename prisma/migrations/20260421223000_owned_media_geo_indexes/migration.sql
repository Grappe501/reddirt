-- Indexes for Phase 1.8 geo queries (needsGeoReview, GPS presence)
CREATE INDEX "OwnedMediaAsset_needsGeoReview_idx" ON "OwnedMediaAsset"("needsGeoReview");
CREATE INDEX "OwnedMediaAsset_gpsLat_gpsLng_idx" ON "OwnedMediaAsset"("gpsLat", "gpsLng");
