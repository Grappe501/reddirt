import mammoth from "mammoth";

/** Plain text from a .docx buffer (for transcripts + RAG; layout is not preserved). */
export async function extractTextFromDocxBuffer(buffer: Buffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
  return (value ?? "").replace(/\r\n/g, "\n").trim();
}
