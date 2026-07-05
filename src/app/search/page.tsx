import { Suspense } from "react";
import { getSubjects } from "@/lib/decisions";
import { SUBJECT_NAMES } from "@/lib/subjects";
import { SearchForm } from "@/components/search-form";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    subjects?: string;
    from?: string;
    to?: string;
  }>;
}

function SearchSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}

async function SearchContent({
  searchParams,
}: {
  searchParams: {
    q?: string;
    subjects?: string;
    from?: string;
    to?: string;
  };
}) {
  const dbSubjects = await getSubjects();
  const subjectOptions =
    dbSubjects.length > 0
      ? dbSubjects.map((s) => s.name)
      : [...SUBJECT_NAMES];

  const initialSubjects = searchParams.subjects
    ? searchParams.subjects.split(",").filter(Boolean)
    : [];

  const hasParams =
    searchParams.q ||
    searchParams.subjects ||
    searchParams.from ||
    searchParams.to;

  return (
    <SearchForm
      subjectOptions={subjectOptions}
      initialQuery={searchParams.q}
      initialSubjects={initialSubjects}
      initialDateFrom={searchParams.from}
      initialDateTo={searchParams.to}
      autoSearch={!!hasParams}
    />
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Search Archive</h1>
        <p className="mt-2 text-muted-foreground">
          Filter decisions by date range, keywords, and subject matter.
        </p>
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchContent searchParams={params} />
      </Suspense>
    </div>
  );
}
