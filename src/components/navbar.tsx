"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminLoginControl } from "@/components/admin-login-control";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/add", label: "Add Decision" },
  { href: "/decisions", label: "All Decisions" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-brand-gold">
            <Image
              src="/logo.png"
              alt="Badminton Association of Malaysia logo"
              width={44}
              height={44}
              className="h-full w-full object-contain p-0.5"
              priority
            />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="hidden text-sm font-semibold tracking-tight text-white sm:block">
              Badminton Association of Malaysia
            </span>
            <span className="text-base font-bold tracking-wide text-white sm:hidden">
              BAM
            </span>
            <span className="hidden text-xs font-medium text-brand-gold sm:block">
              Board Decisions Archive
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = isActivePath(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <AdminLoginControl className="hidden md:flex" />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = isActivePath(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-2 border-t border-white/10 pt-2">
              <AdminLoginControl className="w-full justify-start" />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
