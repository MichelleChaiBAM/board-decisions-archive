"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, X } from "lucide-react";
import { upload } from "@vercel/blob/client";
import {
  createDecisionAction,
  getPdfUploadConfigAction,
} from "@/app/actions/decisions";
import { useAdminAuth } from "@/components/admin-auth-provider";
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
import {
  MAX_PDF_FILES,
  MAX_PDF_SIZE_BYTES,
  PDF_MIME_TYPE,
} from "@/lib/pdf-constants";
import { formatFileSize } from "@/lib/utils";

export function AddDecisionForm({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();
  const { isAdmin: isAdminSession } = useAdminAuth();
  const canAttachPdfs = isAdmin || isAdminSession;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [subjectNames, setSubjectNames] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState("");
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [clientUploadEnabled, setClientUploadEnabled] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const showCustomSubject = subjectNames.includes(OTHERS_SUBJECT);

  useEffect(() => {
    getPdfUploadConfigAction().then((config) => {
      setClientUploadEnabled(config.clientUploadEnabled);
    });
  }, []);

  const addPdfFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    setError(null);

    const next = [...pdfFiles];
    for (const file of incoming) {
      const duplicate = next.some(
        (existing) =>
          existing.name === file.name && existing.size === file.size
      );
      if (duplicate) continue;

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError(`"${file.name}" is not a PDF file.`);
        continue;
      }
      if (file.size > MAX_PDF_SIZE_BYTES) {
        setError(`"${file.name}" exceeds the 10 MB limit.`);
        continue;
      }
      if (next.length >= MAX_PDF_FILES) {
        setError(`You can attach up to ${MAX_PDF_FILES} PDF files.`);
        break;
      }
      next.push(file);
    }

    setPdfFiles(next);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setUploadStatus(null);

    if (subjectNames.length === 0) {
      setError("Please select at least one subject matter.");
      return;
    }

    if (showCustomSubject && !customSubject.trim()) {
      setError('Please enter a custom subject when "Others" is selected.');
      return;
    }

    if (pdfFiles.length > 0 && !canAttachPdfs) {
      setError("Only administrators can attach PDF files.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const payload = {
      decisionDate: formData.get("decisionDate") as string,
      title: formData.get("title") as string,
      subjectNames,
      customSubject: showCustomSubject ? customSubject.trim() : undefined,
      keywords: formData.get("keywords") as string,
      description: formData.get("description") as string,
    };

    startTransition(async () => {
      try {
        let uploadedPdfs:
          | {
              fileName: string;
              mimeType: string;
              sizeBytes: number;
              storageKey: string;
            }[]
          | undefined;
        let filesToSend: File[] | undefined;

        if (canAttachPdfs && pdfFiles.length > 0) {
          if (clientUploadEnabled) {
            uploadedPdfs = [];
            for (const [index, file] of pdfFiles.entries()) {
              setUploadStatus(
                `Uploading PDF ${index + 1} of ${pdfFiles.length}…`
              );
              const blob = await upload(
                `attachments/${file.name}`,
                file,
                {
                  access: "public",
                  handleUploadUrl: "/api/admin/pdf-upload",
                  contentType: PDF_MIME_TYPE,
                }
              );
              uploadedPdfs.push({
                fileName: file.name,
                mimeType: PDF_MIME_TYPE,
                sizeBytes: file.size,
                storageKey: blob.url,
              });
            }
            setUploadStatus("Saving decision…");
          } else {
            filesToSend = pdfFiles;
          }
        }

        const result = await createDecisionAction(payload, {
          pdfFiles: filesToSend,
          uploadedPdfs,
        });

        if (result.success) {
          setSuccess(true);
          (e.target as HTMLFormElement).reset();
          setSubjectNames([]);
          setCustomSubject("");
          setPdfFiles([]);
          setTimeout(() => router.push("/decisions"), 1500);
        } else {
          setError(result.error);
        }
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload PDF attachments."
        );
      } finally {
        setUploadStatus(null);
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

          {canAttachPdfs && (
            <div className="space-y-2">
              <Label htmlFor="pdfs">PDF Attachments</Label>
              <Input
                id="pdfs"
                type="file"
                accept="application/pdf,.pdf"
                multiple
                disabled={isPending}
                onChange={(e) => {
                  if (e.target.files) {
                    addPdfFiles(e.target.files);
                    e.target.value = "";
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Administrators can attach multiple PDF files (up to{" "}
                {MAX_PDF_FILES}, 10 MB each).
              </p>
              {pdfFiles.length > 0 && (
                <ul className="space-y-2 rounded-md border bg-muted/30 p-3">
                  {pdfFiles.map((file, index) => (
                    <li
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{file.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() =>
                          setPdfFiles((current) =>
                            current.filter((_, i) => i !== index)
                          )
                        }
                        disabled={isPending}
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {uploadStatus && (
            <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {uploadStatus}
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
              {isPending && pdfFiles.length > 0 ? "Saving…" : "Save Decision"}
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
