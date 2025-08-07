import { Skeleton } from "./ui/skeleton";

export const DatasetDetailsSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg border bg-card/60">
      {/* Header */}
      <div className="flex flex-row gap-2 items-start">
        <Skeleton className="w-8 h-8 rounded-sm" />
        <div className="flex flex-col flex-1 min-w-0 gap-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full max-w-xs" />
        </div>
      </div>

      {/* Description */}
      <Skeleton className="h-3 w-full" />

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-5 w-12 rounded" />
        <Skeleton className="h-5 w-18 rounded" />
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {["resources", "created", "modified", "license"].map((cardType, i) => (
          <div
            key={`dataset-card-${cardType}`}
            className="bg-background/50 rounded p-2 border border-border/50"
          >
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResourceDetailsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 bg-card/60 border border-border p-4 rounded-lg">
      {/* Header */}
      <div className="flex flex-row gap-3 items-start">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex flex-col flex-1 min-w-0 gap-2">
          <Skeleton className="h-5 w-full max-w-sm" />
          <Skeleton className="h-3 w-full max-w-xs" />
        </div>
      </div>

      {/* Main Resource Details */}
      <div className="flex flex-wrap gap-4">
        {["format", "status", "size", "language", "created", "modified"].map(
          (detailType) => (
            <div
              key={`resource-detail-${detailType}`}
              className="flex items-center gap-2"
            >
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          )
        )}
      </div>

      {/* Technical Details Section */}
      <div className="border-t pt-3">
        <Skeleton className="h-3 w-32 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-24 rounded" />
        </div>
      </div>

      {/* Download Link */}
      <div className="border-t pt-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
};
