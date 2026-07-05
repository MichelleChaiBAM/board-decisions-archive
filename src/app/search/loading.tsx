import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-10 w-48" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
