"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDecisionAction } from "@/app/actions/decisions";
import { useAdminAuth } from "@/components/admin-auth-provider";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteDecisionButtonProps {
  decisionId: string;
  decisionTitle: string;
  onDeleted?: () => void;
  size?: "default" | "sm" | "icon";
  className?: string;
}

export function DeleteDecisionButton({
  decisionId,
  decisionTitle,
  onDeleted,
  size = "default",
  className,
}: DeleteDecisionButtonProps) {
  const { isAdmin, isLoading } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isLoading || !isAdmin) {
    return null;
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteDecisionAction(decisionId);

      if (result.success) {
        setOpen(false);
        toast.success("Decision deleted successfully");
        onDeleted?.();
      } else {
        toast.error(result.error ?? "Only administrators can delete decisions.");
      }
    });
  };

  const isIcon = size === "icon";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size={isIcon ? "icon" : size}
          className={className}
          disabled={isPending}
          onClick={(e) => e.stopPropagation()}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className={isIcon ? "h-4 w-4" : "mr-2 h-4 w-4"} />
          )}
          {!isIcon && "Delete"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this decision?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove{" "}
            <span className="font-medium text-foreground">
              &ldquo;{decisionTitle}&rdquo;
            </span>{" "}
            from the archive. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
