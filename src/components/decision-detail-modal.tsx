"use client";

import type { DecisionWithSubjects } from "@/lib/decisions";
import { Calendar, Tag } from "lucide-react";
import { SubjectBadges } from "@/components/subject-badges";
import { DeleteDecisionButton } from "@/components/delete-decision-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate, parseKeywords } from "@/lib/utils";

interface DecisionDetailModalProps {
  decision: DecisionWithSubjects | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (id: string) => void;
}

export function DecisionDetailModal({
  decision,
  open,
  onOpenChange,
  onDeleted,
}: DecisionDetailModalProps) {
  if (!decision) return null;

  const keywords = parseKeywords(decision.keywords);

  const handleDeleted = () => {
    onDeleted?.(decision.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <SubjectBadges decision={decision} />
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(decision.decisionDate)}
            </span>
          </div>
          <DialogTitle className="text-xl leading-snug">
            {decision.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Full decision details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {keywords.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                Keywords
              </div>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Decision Text
            </h4>
            <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
              {decision.description}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DeleteDecisionButton
            decisionId={decision.id}
            decisionTitle={decision.title}
            onDeleted={handleDeleted}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
