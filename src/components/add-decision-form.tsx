"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createDecisionAction } from "@/app/actions/decisions";
import { SubjectMultiSelect } from "@/components/subject-multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SUBJECT_NAMES, OTHERS_SUBJECT } from "@/lib/subjects";

export function AddDecisionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [subjectNames, setSubjectNames] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState("");

  const showCustomSubject = subjectNames.includes(OTHERS_SUBJECT);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (subjectNames.length === 0) {
      setError("Please select at least one subject matter.");
      return;
    }

    if (showCustomSubject && !customSubject.trim()) {
      setError('Please enter a custom subject when "Others" is selected.');
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createDecisionAction({
        decisionDate: formData.get("decisionDate") as string,
        title: formData.get("title") as string,
        subjectNames,
        customSubject: showCustomSubject ? customSubject.trim() : undefined,
        keywords: formData.get("keywords") as string,
        description: formData.get("description") as string,
      });

      if (result.success) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
        setSubjectNames([]);
        setCustomSubject("");
        setTimeout(() => router.push("/decisions"), 1500);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Add New Decision</CardTitle>
        <CardDescription>
          Record a new board decision in the archive. All fields are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="decisionDate">Decision Date</Label>
            <Input
              id="decisionDate"
              name="decisionDate"
              type="date"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Approval of FY2026 Operating Budget"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjects">Subject Matter</Label>
            <SubjectMultiSelect
              id="subjects"
              options={[...SUBJECT_NAMES]}
              value={subjectNames}
              onChange={setSubjectNames}
              placeholder="Select one or more subjects..."
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Select all applicable subject matters for this decision.
            </p>
          </div>

          {showCustomSubject && (
            <div className="space-y-2">
              <Label htmlFor="customSubject">
                Custom Subject Matter (Others)
              </Label>
              <Input
                id="customSubject"
                placeholder="Describe the custom subject matter"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              name="keywords"
              placeholder="Comma-separated keywords for search"
              required
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Separate keywords with commas (e.g., budget, fiscal year, revenue)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Decision Text</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter the full decision text..."
              rows={8}
              required
              disabled={isPending}
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
              Decision saved successfully! Redirecting...
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Decision
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
