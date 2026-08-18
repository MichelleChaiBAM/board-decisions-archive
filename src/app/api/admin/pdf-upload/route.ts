import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/auth";
import {
  MAX_PDF_SIZE_BYTES,
  PDF_MIME_TYPE,
} from "@/lib/pdf-attachments";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json(
      { error: "Only administrators can upload PDF attachments." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.toLowerCase().endsWith(".pdf")) {
          throw new Error("Only PDF files are allowed.");
        }

        return {
          allowedContentTypes: [PDF_MIME_TYPE, "application/x-pdf"],
          maximumSizeInBytes: MAX_PDF_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ email: session.email }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("PDF upload token failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to authorize the PDF upload.",
      },
      { status: 400 }
    );
  }
}
