"use client";

import type { DecisionWithSubjects } from "@/lib/decisions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubjectBadges } from "@/components/subject-badges";
import { DeleteDecisionButton } from "@/components/delete-decision-button";
import { DecisionDetailModal } from "@/components/decision-detail-modal";
import { formatDate } from "@/lib/utils";

interface DecisionTableProps {
  decisions: DecisionWithSubjects[];
}

export function DecisionTable({
  decisions: initialDecisions,
}: DecisionTableProps) {
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

  const openDecision = (decision: DecisionWithSubjects) => {
    setSelected(decision);
    setModalOpen(true);
  };

  return (
    <>
      <div className="hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[280px]">Subjects</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {decisions.map((decision) => (
              <TableRow
                key={decision.id}
                className="cursor-pointer"
                onClick={() => openDecision(decision)}
              >
                <TableCell className="text-muted-foreground">
                  {formatDate(decision.decisionDate)}
                </TableCell>
                <TableCell className="font-medium">{decision.title}</TableCell>
                <TableCell>
                  <SubjectBadges decision={decision} maxVisible={2} />
                </TableCell>
                <TableCell>
                  <DeleteDecisionButton
                    decisionId={decision.id}
                    decisionTitle={decision.title}
                    onDeleted={() => handleDeleted(decision.id)}
                    size="icon"
                    className="h-8 w-8"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
