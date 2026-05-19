import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export async function prepareCheckImageForVision(absolutePath: string): Promise<{ base64: string; mimeType: string }> {
  const buf = await readFile(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  if (ext === ".heic" || ext === ".heif") {
    const jpeg = await sharp(buf).rotate().jpeg({ quality: 88 }).toBuffer();
    return { base64: jpeg.toString("base64"), mimeType: "image/jpeg" };
  }
  if (ext === ".png") {
    return { base64: buf.toString("base64"), mimeType: "image/png" };
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    return { base64: buf.toString("base64"), mimeType: "image/jpeg" };
  }
  const jpeg = await sharp(buf).rotate().jpeg({ quality: 88 }).toBuffer();
  return { base64: jpeg.toString("base64"), mimeType: "image/jpeg" };
}
