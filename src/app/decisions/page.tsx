import Link from "next/link";
import { Plus } from "lucide-react";
import { searchDecisions } from "@/lib/decisions";
import { DecisionList } from "@/components/decision-list";
import { DecisionTable } from "@/components/decision-table";
import { Pagination } from "@/components/decision-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DecisionsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DecisionsPage({
  searchParams,
}: DecisionsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const result = await searchDecisions({ page, pageSize: 9 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Decisions</h1>
          <p className="mt-2 text-muted-foreground">
            {result.total} decision{result.total !== 1 ? "s" : ""} in the
            archive
          </p>
        </div>
        <Button asChild>
          <Link href="/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Decision
          </Link>
        </Button>
      </div>

      {result.decisions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-lg font-medium">No decisions yet</p>
            <p className="mt-2 text-muted-foreground">
              Get started by adding your first board decision.
            </p>
            <Button asChild className="mt-6">
              <Link href="/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Decision
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="md:hidden">
            <DecisionList decisions={result.decisions} />
          </div>
          <div className="hidden md:block">
            <DecisionTable decisions={result.decisions} />
          </div>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/decisions"
            searchParams={{}}
          />
        </>
      )}
    </div>
  );
}
