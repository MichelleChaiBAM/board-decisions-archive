import { AddDecisionForm } from "@/components/add-decision-form";
import { getSession } from "@/lib/auth";

export default async function AddDecisionPage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Add Decision</h1>
        <p className="mt-2 text-muted-foreground">
          Record a new board decision in the official archive.
        </p>
      </div>
      <AddDecisionForm isAdmin={session.isAdmin} />
    </div>
  );
}
