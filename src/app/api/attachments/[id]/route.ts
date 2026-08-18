import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getLocalFilePath,
  isRemoteStorageKey,
} from "@/lib/pdf-attachments";

function contentDisposition(fileName: string): string {
  const fallback = fileName.replace(/[^\x20-\x7E]+/g, "_").replace(/"/g, "");
  return `inline; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  const attachment = await prisma.attachment.findUnique({
    where: { id },
    select: {
      fileName: true,
      mimeType: true,
      storageKey: true,
    },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  if (isRemoteStorageKey(attachment.storageKey)) {
    return NextResponse.redirect(attachment.storageKey);
  }

  const filePath = getLocalFilePath(attachment.storageKey);
  if (!filePath) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": attachment.mimeType || "application/pdf",
        "Content-Disposition": contentDisposition(attachment.fileName),
        "Content-Length": String(data.byteLength),
      },
    });
  } catch {
    return NextResponse.json({ error: "Attachment file is missing." }, { status: 404 });
  }
}
