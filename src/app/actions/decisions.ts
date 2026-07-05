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
  authorizeDeleteDecision,
  getActorEmailForCreate,
} from "@/lib/auth";
import { OTHERS_SUBJECT } from "@/lib/subjects";

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

export async function createDecisionAction(input: CreateDecisionInput) {
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

  try {
    const createdBy = input.createdBy?.trim() || (await getActorEmailForCreate());
    const decision = await createDecision({ ...input, createdBy });
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/decisions");
    return { success: true as const, data: decision };
  } catch (error) {
    console.error("Create failed:", error);
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
