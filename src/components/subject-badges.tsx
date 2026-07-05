import { Badge } from "@/components/ui/badge";
import type { DecisionWithSubjects } from "@/lib/decisions";
import { OTHERS_SUBJECT } from "@/lib/subjects";

interface SubjectBadgesProps {
  decision: Pick<DecisionWithSubjects, "subjects" | "customSubject">;
  className?: string;
  maxVisible?: number;
}

function formatSubjectLabel(
  name: string,
  customSubject: string | null
): string {
  if (name === OTHERS_SUBJECT && customSubject) {
    return `Others: ${customSubject}`;
  }
  return name;
}

export function SubjectBadges({
  decision,
  className,
  maxVisible,
}: SubjectBadgesProps) {
  const subjects = decision.subjects.map((s) => s.name);
  const visibleSubjects = maxVisible
    ? subjects.slice(0, maxVisible)
    : subjects;
  const hiddenCount = maxVisible
    ? Math.max(0, subjects.length - maxVisible)
    : 0;

  return (
    <div className={className ?? "flex flex-wrap gap-1.5"}>
      {visibleSubjects.map((name) => (
        <Badge key={name} variant="secondary" className="text-xs">
          {formatSubjectLabel(name, decision.customSubject)}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{hiddenCount} more
        </Badge>
      )}
    </div>
  );
}
