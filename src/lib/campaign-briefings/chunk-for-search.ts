/**
 * Splits long briefing text so each chunk fits embedding limits and stays semantically local.
 */
export function chunkTextForSearch(text: string, maxLen = 1800): string[] {
  const t = text.replace(/\r\n/g, "\n").trim();
  if (!t) return [];
  if (t.length <= maxLen) return [t];
  const chunks: string[] = [];
  let i = 0;
  while (i < t.length) {
    let end = Math.min(i + maxLen, t.length);
    if (end < t.length) {
      const br = t.lastIndexOf("\n\n", end);
      if (br > i + 400) end = br;
      else {
        const br2 = t.lastIndexOf("\n", end);
        if (br2 > i + 200) end = br2;
      }
    }
    const piece = t.slice(i, end).trim();
    if (piece) chunks.push(piece);
    i = end;
  }
  return chunks;
}
