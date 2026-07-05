"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  getAdminStatusAction,
  loginAdminAction,
  logoutAdminAction,
} from "@/app/actions/auth";

type AdminAuthContextValue = {
  isAdmin: boolean;
  email: string | null;
  adminEmailHint: string;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [adminEmailHint, setAdminEmailHint] = useState("mi***@bam.org.my");
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const status = await getAdminStatusAction();
    setIsAdmin(status.isAdmin);
    setEmail(status.email);
    setAdminEmailHint(status.adminEmailHint);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (loginEmail: string) => {
      const result = await loginAdminAction(loginEmail);
      if (result.success) {
        await refresh();
        router.refresh();
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    [refresh, router]
  );

  const logout = useCallback(async () => {
    startTransition(async () => {
      await logoutAdminAction();
      await refresh();
      router.refresh();
    });
  }, [refresh, router]);

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        email,
        adminEmailHint,
        isLoading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
