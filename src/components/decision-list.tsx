"use client";

import type { DecisionWithSubjects } from "@/lib/decisions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DecisionCard } from "@/components/decision-card";
import { DecisionDetailModal } from "@/components/decision-detail-modal";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: PaginationProps) {
  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t pt-6">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} asChild>
          <Link href={buildUrl(page - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          asChild
        >
          <Link href={buildUrl(page + 1)}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

interface DecisionListProps {
  decisions: DecisionWithSubjects[];
}

export function DecisionList({ decisions: initialDecisions }: DecisionListProps) {
  const router = useRouter();
  const [decisions, setDecisions] = useState(initialDecisions);
  const [selected, setSelected] = useState<DecisionWithSubjects | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setDecisions(initialDecisions);
  }, [initialDecisions]);

  const handleDeleted = (id: string) => {
    setDecisions((prev) => prev.filter((d) => d.id !== id));
    setSelected(null);
    setModalOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <DecisionDetailModal
        decision={selected}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onDeleted={handleDeleted}
      />
    </>
  );
}
