import {
  enrichFilmRoomWithMediaCatalog,
  listFilmRoomMediaDrills,
  type FilmRoomMediaDrill,
} from "@/lib/intelligence/v4/debateFilmRoomEnrichment";
import {
  loadDebateWarRoomP4Packet,
  type DebateWarRoomP4Packet,
} from "@/lib/intelligence/v4/debateWarRoomP4";

export type { FilmRoomMediaDrill };
export { enrichFilmRoomWithMediaCatalog, groupFilmRoomItems } from "@/lib/intelligence/v4/debateFilmRoomEnrichment";

export type DebateFilmRoomPagePacket = DebateWarRoomP4Packet & {
  mediaDrills: FilmRoomMediaDrill[];
  staffWorkflow: string[];
  clipRegisterHref: string;
  videoArchiveHref: string;
};

export function loadDebateFilmRoomPagePacket(): DebateFilmRoomPagePacket {
  const p4 = loadDebateWarRoomP4Packet();
  const filmRoom = enrichFilmRoomWithMediaCatalog(p4.filmRoom);

  return {
    ...p4,
    filmRoom,
    mediaDrills: listFilmRoomMediaDrills(),
    staffWorkflow: [
      "Pick 1 direct clip + 1 transcript excerpt for tonight — not the whole room",
      "Staff verifies timestamp/speaker → binds claims ledger row",
      "Kelly rehearses 30s pivot standing (agree → act → county → bridge)",
      "Do not imply video proof on stage — staff tracks source URL only",
      "Post-debate social uses argument library snippets after claims gate",
    ],
    clipRegisterHref: "/admin/intelligence/video-archive-room",
    videoArchiveHref: "/admin/intelligence/video-archive-room",
  };
}
