import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "bda_session_email";
export const DEFAULT_ADMIN_EMAIL = "michelle.c@bam.org.my";
export const ANONYMOUS_USER_EMAIL = "anonymous@bam.org.my";

export type Session = {
  email: string | null;
  isAdmin: boolean;
};

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).toLowerCase();
}

export async function getSession(): Promise<Session> {
  const cookieStore = await cookies();
  const email = cookieStore.get(SESSION_COOKIE)?.value?.toLowerCase() ?? null;
  const adminEmail = getAdminEmail();

  return {
    email,
    isAdmin: email !== null && email === adminEmail,
  };
}

export async function setSessionEmail(email: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, email.toLowerCase(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export type DeleteAuthorizationResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export async function authorizeAdmin(): Promise<DeleteAuthorizationResult> {
  const session = await getSession();

  if (!session.isAdmin) {
    return {
      allowed: false,
      reason: "Only administrators can perform this action.",
    };
  }

  return { allowed: true };
}

/**
 * Only the configured administrator may delete decisions.
 * Extend with role-based checks when full auth is added.
 */
export async function authorizeDeleteDecision(
  decisionId: string
): Promise<DeleteAuthorizationResult> {
  const session = await getSession();

  if (!session.isAdmin) {
    return {
      allowed: false,
      reason: "Only administrators can delete decisions.",
    };
  }

  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    select: { id: true, createdBy: true },
  });

  if (!decision) {
    return { allowed: false, reason: "Decision not found." };
  }

  return { allowed: true };
}

export async function getActorEmailForCreate(): Promise<string> {
  const session = await getSession();
  return session.email ?? ANONYMOUS_USER_EMAIL;
}
