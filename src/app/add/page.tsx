import { AddDecisionForm } from "@/components/add-decision-form";

export default function AddDecisionPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Add Decision</h1>
        <p className="mt-2 text-muted-foreground">
          Record a new board decision in the official archive.
        </p>
      </div>
      <AddDecisionForm />
    </div>
  );
}
