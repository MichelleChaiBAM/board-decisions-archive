"use client";

import type { DecisionWithSubjects } from "@/lib/decisions";
import { Calendar, Download, FileText, Paperclip, Tag } from "lucide-react";
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
import { formatDate, formatFileSize, parseKeywords } from "@/lib/utils";

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
  const attachments = decision.attachments ?? [];

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

          {attachments.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" />
                PDF Attachments
              </div>
              <ul className="space-y-2">
                {attachments.map((file) => (
                  <li key={file.id}>
                    <a
                      href={`/api/attachments/${file.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-muted/50"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{file.fileName}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatFileSize(file.sizeBytes)}
                        </span>
                      </span>
                      <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
