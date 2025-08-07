import Link from "next/link";
import { Badge } from "./ui/badge";
import { SparklesIcon } from "./icons";
import { Skeleton } from "./ui/skeleton";
import { SearchIcon } from "lucide-react";

interface DatasetSearchResult {
  id: string;
  title: string;
  publisher_link?: string;
}

interface DatasetSearchOutput {
  result: {
    results: DatasetSearchResult[];
  };
}

interface DatasetSearchInput {
  q: string;
  keywords?: string[];
}

interface DatasetSearchMessageProps {
  toolCallId: string;
  input: DatasetSearchInput;
  output: DatasetSearchOutput;
}

export function DatasetSearchMessage({
  toolCallId,
  input,
  output,
}: DatasetSearchMessageProps) {
  return (
    <div
      key={toolCallId}
      className="overflow-hidden sm:max-w-md md:max-w-full min-w-full w-full max-w-fit"
    >
      <div className="flex flex-row gap-2 items-center">
        <span className="text-muted-foreground">
          <SparklesIcon size={14} />
        </span>
        <span className="text-muted-foreground">Suche nachtest </span>
        <span className="font-medium flex-1 max-w-max truncate">{input.q}</span>
        <span className="text-muted-foreground"> · </span>
        <span className="text-muted-foreground">
          {output.result.results.length} Treffer
        </span>{" "}
      </div>
      {input.keywords && input.keywords.length > 0 && (
        <div className="pb-5 pt-2 flex flex-col gap-2">
          <div className="flex flex-row gap-2 flex-wrap">
            {input.keywords?.map((keyword: string) => (
              <Badge
                key={keyword}
                variant="secondary"
                className="flex flex-row gap-2 text-sm items-center bg-card/60 border border-border"
              >
                <SearchIcon size={14} />
                <span>{keyword}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="p-2 rounded-lg border gap-2 flex flex-col bg-card/60 border-border min-w-full">
          {output?.result?.results && output.result.results.length > 0 ? (
            output.result.results.map((result: DatasetSearchResult) => (
              <Link
                key={result.id}
                className="flex flex-row gap-1"
                href={`https://www.data.gv.at/katalog/dataset/${result.id}`}
                target="_blank"
              >
                <img
                  src={"https://www.data.gv.at/favicon.ico"}
                  alt={"logo"}
                  className="w-6 h-6 rounded-full bg-secondary border p-1 mr-1"
                />
                <span className="text-secondary-foreground font-medium max-w-1/2 truncate">
                  {result.title}
                </span>
                <span className="text-muted-foreground">
                  {result.publisher_link
                    ? new URL(result.publisher_link).hostname
                    : "data.gv.at"}
                </span>
              </Link>
            ))
          ) : (
            <div className="text-muted-foreground w-full text-center">
              Keine Treffer gefunden
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DatasetSearchSkeletonProps {
  toolCallId: string;
}

export function DatasetSearchSkeleton({
  toolCallId,
}: DatasetSearchSkeletonProps) {
  return (
    <div key={toolCallId} className="text-muted-foreground">
      <div className="flex flex-row gap-2 items-center">
        <span className="text-muted-foreground">
          <SparklesIcon size={14} />
        </span>
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="py-5 flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-row gap-2">
          <Skeleton className="h-6 rounded-full w-20" />
          <Skeleton className="h-6 rounded-full w-16" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="bg-card p-2 rounded-lg border gap-2 flex flex-col">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${toolCallId}-${index + 1}`}
              className="flex flex-row gap-1 items-center"
            >
              <Skeleton className="w-6 h-6 rounded-full mr-1" />
              <Skeleton className="h-4 flex-1 max-w-48" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
