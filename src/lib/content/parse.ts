export type DocChunk = {
  path: string;
  title: string;
  chunkIndex: number;
  content: string;
};

/**
 * Split markdown into coarse chunks by headings (## / #) for embedding.
 */
export function chunkMarkdown(sourcePath: string, raw: string): DocChunk[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const chunks: DocChunk[] = [];
  let buf: string[] = [];
  let title = sourcePath;
  let idx = 0;

  const flush = () => {
    const text = buf.join("\n").trim();
    if (text.length < 40) {
      buf = [];
      return;
    }
    chunks.push({ path: sourcePath, title, chunkIndex: idx++, content: text });
    buf = [];
  };

  for (const line of lines) {
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      flush();
      title = h[2].trim() || title;
      buf.push(`# ${h[2].trim()}`);
      continue;
    }
    buf.push(line);
  }
  flush();

  if (chunks.length === 0 && raw.trim().length >= 40) {
    return [{ path: sourcePath, title, chunkIndex: 0, content: raw.trim().slice(0, 12000) }];
  }

  return chunks;
}
