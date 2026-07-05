"use client";

import { useState } from "react";
import { Loader2, LogIn, LogOut, Shield } from "lucide-react";
import { useAdminAuth } from "@/components/admin-auth-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AdminLoginControl({ className }: { className?: string }) {
  const { isAdmin, email, adminEmailHint, isLoading, login, logout } =
    useAdminAuth();
  const [open, setOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div
        className={cn(
          "h-9 w-24 animate-pulse rounded-md bg-white/10",
          className
        )}
      />
    );
  }

  if (isAdmin) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-xs text-white/90 md:bg-white/10">
          <Shield className="h-3.5 w-3.5 text-brand-gold" />
          Admin{email ? `: ${email.split("@")[0]}` : ""}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-white/80 hover:bg-white/10 hover:text-white"
          onClick={() => logout()}
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "text-white/80 hover:bg-white/10 hover:text-white",
            className
          )}
        >
          <LogIn className="mr-1.5 h-4 w-4" />
          Admin sign in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Administrator sign in</DialogTitle>
          <DialogDescription>
            Only the archive administrator can delete decisions. Sign in with
            your admin email (e.g. {adminEmailHint}).
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setIsSubmitting(true);
            const result = await login(loginEmail);
            setIsSubmitting(false);
            if (result.success) {
              setOpen(false);
              setLoginEmail("");
            } else {
              setError(result.error ?? "Sign in failed.");
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="michelle.c@bam.org.my"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign in as admin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
