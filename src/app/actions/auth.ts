"use server";

import {
  authorizeDeleteDecision,
  clearSession,
  getAdminEmail,
  getSession,
  setSessionEmail,
} from "@/lib/auth";

export async function getAdminStatusAction() {
  const session = await getSession();
  return {
    isAdmin: session.isAdmin,
    email: session.email,
    adminEmailHint: getAdminEmail().replace(/(.{2}).*(@.*)/, "$1***$2"),
  };
}

export async function loginAdminAction(email: string) {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return { success: false as const, error: "Email is required." };
  }

  if (normalized !== getAdminEmail()) {
    return {
      success: false as const,
      error: "Only administrators can sign in to manage the archive.",
    };
  }

  await setSessionEmail(normalized);
  return { success: true as const, email: normalized };
}

export async function logoutAdminAction() {
  await clearSession();
  return { success: true as const };
}

export async function checkCanDeleteAction(decisionId: string) {
  const result = await authorizeDeleteDecision(decisionId);
  return result;
}
