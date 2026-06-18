import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname } from "node:path";

function mimeForPath(fileName: string): string {
  const ext = extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".m4v": "video/x-m4v",
    ".mkv": "video/x-matroska",
  };
  return map[ext] ?? "application/octet-stream";
}

/** Stream a local video with HTTP Range support (required for large MP4 in browsers). */
export async function streamLocalVideoFile(
  absolutePath: string,
  req: Request,
): Promise<Response> {
  const st = await stat(absolutePath);
  if (!st.isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const fileSize = st.size;
  const mime = mimeForPath(absolutePath);
  const range = req.headers.get("range");

  if (range) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (match) {
      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : fileSize - 1;
      if (start >= fileSize || end >= fileSize || start > end) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }
      const chunkSize = end - start + 1;
      const stream = createReadStream(absolutePath, { start, end });
      return new Response(stream as unknown as ReadableStream, {
        status: 206,
        headers: {
          "Content-Type": mime,
          "Content-Length": String(chunkSize),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "private, max-age=3600",
        },
      });
    }
  }

  const stream = createReadStream(absolutePath);
  return new Response(stream as unknown as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(fileSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
