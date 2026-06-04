import type { DebateWarRoomP4Packet } from "@/lib/intelligence/v4/debateWarRoomP4Types";
import type { FilmRoomMediaDrill } from "@/lib/intelligence/v4/debateFilmRoomEnrichmentTypes";

export type { FilmRoomMediaDrill };

/** Client-safe film room page packet shape — no node:fs. */

export type DebateFilmRoomPagePacket = DebateWarRoomP4Packet & {
  mediaDrills: FilmRoomMediaDrill[];
  staffWorkflow: string[];
  clipRegisterHref: string;
  videoArchiveHref: string;
};
