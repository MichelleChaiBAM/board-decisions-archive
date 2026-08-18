import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { del, put } from "@vercel/blob";
import {
  MAX_PDF_SIZE_BYTES,
  PDF_MIME_TYPE,
} from "@/lib/pdf-constants";

export {
  MAX_PDF_FILES,
  MAX_PDF_SIZE_BYTES,
  PDF_MIME_TYPE,
} from "@/lib/pdf-constants";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads", "attachments");

export type StoredPdf = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
};

export function isBlobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function sanitizePdfFileName(name: string): string {
  const base = path.basename(name).replace(/[^\w.\-() +]+/g, "_").trim();
  const withExt = base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
  return withExt.slice(0, 180) || "document.pdf";
}

function hasPdfMagicBytes(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}

export function assertPdfMetadata(input: {
  fileName: string;
  mimeType?: string;
  sizeBytes: number;
  storageKey?: string;
}): void {
  if (!input.fileName.toLowerCase().endsWith(".pdf")) {
    throw new Error(`"${input.fileName}" is not a PDF file.`);
  }
  if (
    input.mimeType &&
    input.mimeType !== PDF_MIME_TYPE &&
    input.mimeType !== "application/x-pdf" &&
    input.mimeType !== "application/octet-stream"
  ) {
    throw new Error(`"${input.fileName}" is not a PDF file.`);
  }
  if (input.sizeBytes <= 0) {
    throw new Error(`"${input.fileName}" is empty.`);
  }
  if (input.sizeBytes > MAX_PDF_SIZE_BYTES) {
    throw new Error(`"${input.fileName}" exceeds the 10 MB limit.`);
  }
  if (input.storageKey && !isRemoteStorageKey(input.storageKey)) {
    throw new Error(`"${input.fileName}" has an invalid storage location.`);
  }
}

export async function validateAndReadPdf(file: File): Promise<Uint8Array> {
  assertPdfMetadata({
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasPdfMagicBytes(bytes)) {
    throw new Error(`"${file.name}" is not a valid PDF file.`);
  }
  return bytes;
}

export function isRemoteStorageKey(storageKey: string): boolean {
  return storageKey.startsWith("https://");
}

export async function savePdf(file: File): Promise<StoredPdf> {
  const bytes = await validateAndReadPdf(file);
  const fileName = sanitizePdfFileName(file.name);
  const id = randomUUID();

  if (isBlobStorageConfigured()) {
    const blob = await put(`attachments/${id}-${fileName}`, Buffer.from(bytes), {
      access: "public",
      contentType: PDF_MIME_TYPE,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      fileName,
      mimeType: PDF_MIME_TYPE,
      sizeBytes: bytes.length,
      storageKey: blob.url,
    };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "PDF storage is not configured. Add a Vercel Blob token (BLOB_READ_WRITE_TOKEN) to enable uploads."
    );
  }

  const dir = path.join(LOCAL_UPLOAD_DIR, id);
  await mkdir(dir, { recursive: true });
  const storedName = `${id}-${fileName}`;
  await writeFile(path.join(dir, storedName), bytes);

  return {
    fileName,
    mimeType: PDF_MIME_TYPE,
    sizeBytes: bytes.length,
    storageKey: `local:${path.join(id, storedName)}`,
  };
}

export async function deleteStoredFile(storageKey: string): Promise<void> {
  if (isRemoteStorageKey(storageKey)) {
    if (isBlobStorageConfigured()) {
      await del(storageKey, { token: process.env.BLOB_READ_WRITE_TOKEN });
    }
    return;
  }

  const filePath = getLocalFilePath(storageKey);
  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch {
    // Ignore missing files so decision deletion can still complete.
  }
}

export function getLocalFilePath(storageKey: string): string | null {
  if (!storageKey.startsWith("local:")) return null;

  const relative = storageKey.slice("local:".length);
  const resolved = path.resolve(path.join(LOCAL_UPLOAD_DIR, relative));
  const root = path.resolve(LOCAL_UPLOAD_DIR);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return null;
  }
  return resolved;
}
