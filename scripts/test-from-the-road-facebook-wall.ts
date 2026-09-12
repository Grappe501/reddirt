import assert from "node:assert/strict";
import { fromTheRoadHasLiveEmbeds } from "../src/config/from-the-road-embeds";
import { DEFAULT_SOCIAL_FACEBOOK_PAGE_ID, facebookPageProfileUrl } from "../src/config/social";
import { normalizePageFeedEdge } from "../src/lib/integrations/facebook/normalize";

assert.equal(
  facebookPageProfileUrl(),
  `https://www.facebook.com/people/Kelly-Grappe-SOS/${DEFAULT_SOCIAL_FACEBOOK_PAGE_ID}/`,
);

assert.equal(
  fromTheRoadHasLiveEmbeds({
    facebookPageUrl: "https://www.facebook.com/share/1Nor8fqtmT/",
    tiktokVideoIds: [],
    youtubePlaylistId: null,
    instagramEmbedShortcodes: [],
  }),
  false,
  "Facebook URL alone must not open the hanging Page Plugin section",
);

const post = normalizePageFeedEdge({
  id: "61582696603861_123",
  message: "On the road in Arkansas.",
  permalink_url: "https://www.facebook.com/61582696603861/posts/123",
  created_time: "2026-09-12T12:00:00+0000",
  full_picture: "https://scontent.xx.fbcdn.net/example.jpg",
});
assert.ok(post);
assert.equal(post?.pictureUrl, "https://scontent.xx.fbcdn.net/example.jpg");
assert.equal(post?.externalId, "facebook:post:61582696603861_123");

console.log("test-from-the-road-facebook-wall ok");
