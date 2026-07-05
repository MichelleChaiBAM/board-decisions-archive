"use client";

import type { DecisionWithSubjects } from "@/lib/decisions";
import { Calendar, ChevronRight } from "lucide-react";
import { SubjectBadges } from "@/components/subject-badges";
import { DeleteDecisionButton } from "@/components/delete-decision-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface DecisionCardProps {
  decision: DecisionWithSubjects;
  onClick: () => void;
  onDeleted?: (id: string) => void;
  showDelete?: boolean;
}

export function DecisionCard({
  decision,
  onClick,
  onDeleted,
  showDelete = true,
}: DecisionCardProps) {
  return (
    <Card
      className="group relative cursor-pointer transition-all hover:border-primary/30 hover:shadow-md"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {showDelete && onDeleted && (
        <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <DeleteDecisionButton
            decisionId={decision.id}
            decisionTitle={decision.title}
            onDeleted={() => onDeleted(decision.id)}
            size="icon"
            className="h-8 w-8"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 pr-8">
            <SubjectBadges decision={decision} maxVisible={3} />
            <CardTitle className="text-base leading-snug group-hover:text-primary">
              {decision.title}
            </CardTitle>
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <CardDescription className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(decision.decisionDate)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {decision.description}
        </p>
      </CardContent>
    </Card>
  );
}
