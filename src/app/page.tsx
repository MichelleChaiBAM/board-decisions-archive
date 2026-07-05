import Link from "next/link";
import { ArrowRight, FileSearch, Shield } from "lucide-react";
import { getRecentDecisions, getSubjects } from "@/lib/decisions";
import { SUBJECT_NAMES } from "@/lib/subjects";
import { SearchForm } from "@/components/search-form";
import { DecisionList } from "@/components/decision-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const [dbSubjects, recentDecisions] = await Promise.all([
    getSubjects(),
    getRecentDecisions(3),
  ]);

  const subjectOptions =
    dbSubjects.length > 0
      ? dbSubjects.map((s) => s.name)
      : [...SUBJECT_NAMES];

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 border border-brand-gold/40 bg-brand-gold/15 text-primary"
            >
              Badminton Association of Malaysia
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Board Decisions <span className="text-primary">Archive</span>
            </h1>
            <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-brand-gold" />
            <p className="mt-5 text-lg text-muted-foreground">
              Search, browse, and manage official board decisions. Access
              comprehensive records with powerful filtering by date, subject,
              and keywords.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <SearchForm subjectOptions={subjectOptions} compact />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-primary" />
              Full-text search
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Secure server-side filtering
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Recent Decisions
            </h2>
            <p className="mt-1 text-muted-foreground">
              Latest board decisions added to the archive
            </p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="/decisions">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {recentDecisions.length > 0 ? (
          <DecisionList decisions={recentDecisions} />
        ) : (
          <div className="rounded-xl border border-dashed py-12 text-center">
            <p className="text-muted-foreground">
              No decisions in the archive yet.
            </p>
            <Button asChild className="mt-4">
              <Link href="/add">Add the first decision</Link>
            </Button>
          </div>
        )}

        <div className="mt-6 sm:hidden">
          <Button variant="outline" asChild className="w-full">
            <Link href="/decisions">
              View all decisions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
