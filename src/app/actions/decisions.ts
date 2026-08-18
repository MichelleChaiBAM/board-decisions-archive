"use server";

import { revalidatePath } from "next/cache";
import {
  createDecision,
  deleteDecision,
  type CreateDecisionInput,
  type DecisionSearchParams,
  searchDecisions,
} from "@/lib/decisions";
import {
  authorizeAdmin,
  authorizeDeleteDecision,
  getActorEmailForCreate,
  getSession,
} from "@/lib/auth";
import { OTHERS_SUBJECT } from "@/lib/subjects";
import {
  assertPdfMetadata,
  deleteStoredFile,
  isBlobStorageConfigured,
  MAX_PDF_FILES,
  savePdf,
  type StoredPdf,
} from "@/lib/pdf-attachments";

export async function searchDecisionsAction(params: DecisionSearchParams) {
  try {
    return { success: true as const, data: await searchDecisions(params) };
  } catch (error) {
    console.error("Search failed:", error);
    return {
      success: false as const,
      error: "Failed to search decisions. Please try again.",
    };
  }
}

export async function getPdfUploadConfigAction() {
  const session = await getSession();
  return {
    isAdmin: session.isAdmin,
    clientUploadEnabled: isBlobStorageConfigured(),
    maxFiles: MAX_PDF_FILES,
  };
}

type CreateDecisionPayload = Omit<CreateDecisionInput, "attachments">;

export type UploadedPdfInput = StoredPdf;

async function collectAttachments(input: {
  pdfFiles?: File[];
  uploadedPdfs?: UploadedPdfInput[];
}): Promise<{ attachments: StoredPdf[] } | { error: string }> {
  const pdfFiles = input.pdfFiles?.filter(Boolean) ?? [];
  const uploadedPdfs = input.uploadedPdfs ?? [];
  const total = pdfFiles.length + uploadedPdfs.length;

  if (total === 0) {
    return { attachments: [] };
  }

  const auth = await authorizeAdmin();
  if (!auth.allowed) {
    return { error: "Only administrators can attach PDF files." };
  }

  if (total > MAX_PDF_FILES) {
    return { error: `You can attach up to ${MAX_PDF_FILES} PDF files.` };
  }

  try {
    for (const uploaded of uploadedPdfs) {
      assertPdfMetadata(uploaded);
    }

    const saved: StoredPdf[] = [];
    for (const file of pdfFiles) {
      saved.push(await savePdf(file));
    }

    return {
      attachments: [
        ...uploadedPdfs.map((file) => ({
          fileName: file.fileName,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          storageKey: file.storageKey,
        })),
        ...saved,
      ],
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to process PDF attachments.",
    };
  }
}

export async function createDecisionAction(
  input: CreateDecisionPayload,
  pdfs?: {
    pdfFiles?: File[];
    uploadedPdfs?: UploadedPdfInput[];
  }
) {
  if (!input.title?.trim()) {
    return { success: false as const, error: "Title is required." };
  }
  if (!input.subjectNames || input.subjectNames.length === 0) {
    return {
      success: false as const,
      error: "At least one subject matter is required.",
    };
  }
  if (
    input.subjectNames.includes(OTHERS_SUBJECT) &&
    !input.customSubject?.trim()
  ) {
    return {
      success: false as const,
      error: 'Custom subject matter is required when "Others" is selected.',
    };
  }
  if (!input.description?.trim()) {
    return { success: false as const, error: "Description is required." };
  }
  if (!input.decisionDate) {
    return { success: false as const, error: "Decision date is required." };
  }

  const collected = await collectAttachments(pdfs ?? {});
  if ("error" in collected) {
    return { success: false as const, error: collected.error };
  }

  try {
    const createdBy = input.createdBy?.trim() || (await getActorEmailForCreate());
    const decision = await createDecision({
      ...input,
      createdBy,
      attachments: collected.attachments,
    });
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/decisions");
    return { success: true as const, data: decision };
  } catch (error) {
    console.error("Create failed:", error);
    await Promise.all(
      collected.attachments.map((file) => deleteStoredFile(file.storageKey))
    );
    return {
      success: false as const,
      error: "Failed to create decision. Please try again.",
    };
  }
}

export async function deleteDecisionAction(id: string) {
  if (!id?.trim()) {
    return { success: false as const, error: "Decision ID is required." };
  }

  const auth = await authorizeDeleteDecision(id);

  if (!auth.allowed) {
    return { success: false as const, error: auth.reason };
  }

  try {
    await deleteDecision(id);
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/decisions");
    return { success: true as const };
  } catch (error) {
    console.error("Delete failed:", error);
    return {
      success: false as const,
      error: "Failed to delete decision. It may have already been removed.",
    };
  }
}
