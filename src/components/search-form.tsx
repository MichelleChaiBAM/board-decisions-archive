"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Loader2, Search, X } from "lucide-react";
import type { DecisionWithSubjects } from "@/lib/decisions";
import { searchDecisionsAction } from "@/app/actions/decisions";
import { DateRangePicker } from "@/components/date-range-picker";
import { DecisionCard } from "@/components/decision-card";
import { DecisionDetailModal } from "@/components/decision-detail-modal";
import { SubjectMultiSelect } from "@/components/subject-multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchFormProps {
  subjectOptions: string[];
  initialQuery?: string;
  initialSubjects?: string[];
  initialDateFrom?: string;
  initialDateTo?: string;
  compact?: boolean;
  autoSearch?: boolean;
}

export function SearchForm({
  subjectOptions,
  initialQuery = "",
  initialSubjects = [],
  initialDateFrom,
  initialDateTo,
  compact = false,
  autoSearch = false,
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [subjects, setSubjects] = useState<string[]>(initialSubjects);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (initialDateFrom || initialDateTo) {
      return {
        from: initialDateFrom ? new Date(initialDateFrom) : undefined,
        to: initialDateTo ? new Date(initialDateTo) : undefined,
      };
    }
    return undefined;
  });
  const [decisions, setDecisions] = useState<DecisionWithSubjects[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(autoSearch);
  const [selected, setSelected] = useState<DecisionWithSubjects | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDeleted = useCallback(
    (id: string) => {
      setDecisions((prev) => prev.filter((d) => d.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      setSelected(null);
      setModalOpen(false);
      router.refresh();
    },
    [router]
  );

  const buildParams = useCallback(() => {
    return {
      query: query.trim() || undefined,
      subjects: subjects.length > 0 ? subjects : undefined,
      dateFrom: dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined,
      dateTo: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      page: 1,
      pageSize: compact ? 5 : 20,
    };
  }, [query, subjects, dateRange, compact]);

  const runSearch = useCallback(() => {
    startTransition(async () => {
      setError(null);
      setHasSearched(true);
      const result = await searchDecisionsAction(buildParams());
      if (result.success) {
        setDecisions(result.data.decisions);
        setTotal(result.data.total);
      } else {
        setError(result.error);
        setDecisions([]);
        setTotal(0);
      }
    });
  }, [buildParams]);

  useEffect(() => {
    if (!autoSearch) return;
    const timer = setTimeout(runSearch, 300);
    return () => clearTimeout(timer);
  }, [autoSearch, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (compact) {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (subjects.length > 0) params.set("subjects", subjects.join(","));
      if (dateRange?.from)
        params.set("from", format(dateRange.from, "yyyy-MM-dd"));
      if (dateRange?.to) params.set("to", format(dateRange.to, "yyyy-MM-dd"));
      router.push(`/search?${params.toString()}`);
      return;
    }
    runSearch();
  };

  const clearFilters = () => {
    setQuery("");
    setSubjects([]);
    setDateRange(undefined);
    setDecisions([]);
    setTotal(0);
    setHasSearched(false);
    setError(null);
  };

  const filters = (
    <div
      className={
        compact
          ? "flex flex-col gap-3"
          : "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      }
    >
      <div className={compact ? "space-y-2" : "space-y-2 sm:col-span-2"}>
        <Label htmlFor="search-query">Keywords</Label>
        <Input
          id="search-query"
          placeholder="Search title, description, or keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Subject Matter</Label>
        <SubjectMultiSelect
          options={subjectOptions}
          value={subjects}
          onChange={setSubjects}
          placeholder="All subjects"
        />
      </div>

      <div className="space-y-2">
        <Label>Date Range</Label>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {compact ? (
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            {filters}
            <div className="mt-4 flex gap-2">
              <Button type="submit" size="lg" className="flex-1 sm:flex-none">
                <Search className="mr-2 h-4 w-4" />
                Search Archive
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filters}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  disabled={isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {!compact && hasSearched && (
        <div className="space-y-4">
          {error ? (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-6 text-center text-destructive">
                {error}
              </CardContent>
            </Card>
          ) : isPending ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : decisions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium">No decisions found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search filters or keywords.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {total} decision{total !== 1 ? "s" : ""} found
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {decisions.map((decision) => (
                  <DecisionCard
                    key={decision.id}
                    decision={decision}
                    onClick={() => {
                      setSelected(decision);
                      setModalOpen(true);
                    }}
                    onDeleted={handleDeleted}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <DecisionDetailModal
        decision={selected}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
