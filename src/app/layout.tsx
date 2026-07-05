import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { AdminAuthProvider } from "@/components/admin-auth-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BAM Board Decisions Archive",
  description:
    "Official Badminton Association of Malaysia archive to search, browse, and manage board decisions with powerful filtering.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <AdminAuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          <footer className="border-t bg-primary py-8 text-primary-foreground">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-1 px-4 text-center sm:px-6 lg:px-8">
              <div className="h-1 w-16 rounded-full bg-brand-gold" />
              <p className="mt-3 text-sm font-semibold">
                Badminton Association of Malaysia
              </p>
              <p className="text-xs text-white/70">
                Board Decisions Archive &mdash; Official Record Management System
              </p>
            </div>
          </footer>
          </AdminAuthProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
