import "server-only";
import { checkUpload } from "./interview";

// Reads an uploaded file from a form field. Returns null when nothing was
// chosen, { error } when the file is unusable, else { kind, mimeType, bytes }.
export async function readUpload(file, allowed, label) {
  // An empty file input still submits a zero-byte File; treat it as none.
  if (!(file instanceof File) || file.size === 0) return null;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const found = checkUpload({ size: bytes.length, head: bytes.subarray(0, 12), name: file.name }, allowed, label);
  return found.error ? found : { ...found, bytes };
}

// Word files are converted directly: exact, and no AI call. Returns '' when
// the file has no text or isn't really a Word document. Mammoth puts a blank
// line after every paragraph, so those are folded into single line breaks.
export async function docxText(bytes) {
  const mammoth = await import("mammoth");
  try {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    return value.replace(/[ \t]+\n/g, "\n").replace(/\n{2,}/g, "\n").trim();
  } catch {
    return "";
  }
}
