import Link from "next/link";
import { Badge } from "./ui/badge";
import { SparklesIcon } from "./icons";
import { Skeleton } from "./ui/skeleton";
import { SearchIcon } from "lucide-react";

type DatasetSearchResult = {
  id: string;
  title: string;
  publisher_link?: string;
};

type DatasetSearchOutput = {
  result: {
    results: DatasetSearchResult[];
  };
};

type DatasetSearchInput = {
  q: string;
  keywords?: string[];
};

type DatasetSearchMessageProps = {
  toolCallId: string;
  input: DatasetSearchInput;
  output: DatasetSearchOutput;
};

export function DatasetSearchMessage({
  toolCallId,
  input,
  output,
}: DatasetSearchMessageProps) {
  return (
    <div
      key={toolCallId}
      className="w-full min-w-full max-w-fit overflow-hidden sm:max-w-md md:max-w-full"
    >
      <div className="flex flex-row items-center gap-2">
        <span className="text-muted-foreground">
          <SparklesIcon size={14} />
        </span>
        <span className="text-muted-foreground">Suche nachtest </span>
        <span className="max-w-max flex-1 truncate font-medium">{input.q}</span>
        <span className="text-muted-foreground"> · </span>
        <span className="text-muted-foreground">
          {output.result.results.length} Treffer
        </span>{" "}
      </div>
      {input.keywords && input.keywords.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 pb-5">
          <div className="flex flex-row flex-wrap gap-2">
            {input.keywords?.map((keyword: string) => (
              <Badge
                key={keyword}
                variant="secondary"
                className="flex flex-row items-center gap-2 border border-border bg-card/60 text-sm"
              >
                <SearchIcon size={14} />
                <span>{keyword}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex min-w-full flex-col gap-2 rounded-lg border border-border bg-card/60 p-2">
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
                  className="mr-1 h-6 w-6 rounded-full border bg-secondary p-1"
                />
                <span className="max-w-1/2 truncate font-medium text-secondary-foreground">
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
            <div className="w-full text-center text-muted-foreground">
              Keine Treffer gefunden
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type DatasetSearchSkeletonProps = {
  toolCallId: string;
};

export function DatasetSearchSkeleton({
  toolCallId,
}: DatasetSearchSkeletonProps) {
  return (
    <div key={toolCallId} className="text-muted-foreground">
      <div className="flex flex-row items-center gap-2">
        <span className="text-muted-foreground">
          <SparklesIcon size={14} />
        </span>
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex flex-col gap-2 py-5">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-row gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${toolCallId}-${index + 1}`}
              className="flex flex-row items-center gap-1"
            >
              <Skeleton className="mr-1 h-6 w-6 rounded-full" />
              <Skeleton className="h-4 max-w-48 flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
