"use client"

import Link from "next/link";
import { Badge } from "./ui/badge";
import { SparklesIcon } from "./icons";
import { Skeleton } from "./ui/skeleton";
import { SearchIcon, ChevronDown, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./multistep-form";
import { useArtifact } from "@/hooks/use-artifact";
import { ShinyText } from "./shiny-text";

type DatasetSearchResult = {
  id: string;
  title: { de: string };
  publisher?: { homepage?: string };
};

type DatasetSearchOutput = {
  data: DatasetSearchResult[];
  count: number;
};

type DatasetSearchInput = {
  q: string;
  keywords?: string[];
};

type MergedSearchResult = {
  toolCallId: string;
  input: DatasetSearchInput;
  output: DatasetSearchOutput;
};

type MergedDatasetSearchProps = {
  searches: MergedSearchResult[];
  isLoading: boolean;
};

export function MergedDatasetSearch({
  searches,
  isLoading,
}: MergedDatasetSearchProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const { artifact } = useArtifact();

  const allResults: DatasetSearchResult[] = [];
  const allKeywords: string[] = [];
  const queries: string[] = [];
  let _totalCount = 0;

  for (const search of searches) {
    if (search.output?.data) {
      for (const result of search.output.data) {
        if (!allResults.find((existing) => existing.id === result.id)) {
          allResults.push(result);
        }
      }
      _totalCount += search.output.count || 0;
    }

    if (search.input?.keywords) {
      for (const keyword of search.input.keywords) {
        if (!allKeywords.includes(keyword)) {
          allKeywords.push(keyword);
        }
      }
    }

    if (search.input?.q && !queries.includes(search.input.q)) {
      queries.push(search.input.q);
    }
  }


  const originalQuery =
    searches.find((s) => s.input?.q && s.input.q !== "data.gv.at")?.input.q ||
    queries[0] ||
    "Datensätzen";
  const isMultipleSearches = queries.length > 1;

  const RESULTS_PER_PAGE = 10;
  const displayedResults = showAllResults
    ? allResults
    : allResults.slice(0, RESULTS_PER_PAGE);
  const hasMoreResults = allResults.length > RESULTS_PER_PAGE;

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex flex-row items-center gap-2">
          <Search className="h-4 w-4" />
          <ShinyText text={`Suche nach ${originalQuery}...`} />
        </div>

        {allKeywords.length > 0 && (
          <motion.div
            className="flex flex-col gap-2 rounded-lg bg-card/60 p-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex flex-row flex-wrap gap-2">
              {allKeywords.slice(0, 3).map((keyword: string) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="flex flex-row items-center gap-2 border border-border bg-card/60 text-sm"
                >
                  <SearchIcon size={14} />
                  <span>{keyword}</span>
                </Badge>
              ))}
              {allKeywords.length > 3 && (
                <Badge
                  variant="secondary"
                  className="border border-border bg-card/60"
                >
                  +{allKeywords.length - 3}
                </Badge>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          className="flex flex-col gap-2 rounded-lg border bg-card/60 p-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {["skeleton-1", "skeleton-2", "skeleton-3"].map(
            (skeletonId, index) => (
              <motion.div
                key={skeletonId}
                className="flex flex-row items-center gap-1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.2 }}
              >
                <Skeleton className="mr-1 h-6 w-6 rounded-full" />
                <Skeleton className="h-4 max-w-48 flex-1" />
                <Skeleton className="h-4 w-20" />
              </motion.div>
            )
          )}
        </motion.div>
      </motion.div>
    );
  }

  const completedText = isMultipleSearches
    ? `${allResults.length} Datensätze gefunden (${queries.length} Suchen)`
    : `${allResults.length} Datensätze gefunden`;



  return (
    <motion.div
      className={cn("flex flex-col gap-3", {
        "max-w-[400px]": artifact.isVisible,
      })}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="group flex cursor-pointer flex-row items-center gap-2 text-left text-muted-foreground transition-colors hover:text-foreground"
        whileTap={{ scale: 0.99 }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
        <Search className="h-4 w-4" />
        {completedText}
      </motion.button>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-row items-center gap-2 text-muted-foreground text-sm">
                <SparklesIcon size={14} />
                <span>
                  {isMultipleSearches
                    ? `Suche nach "${originalQuery}" (+ ${queries.length - 1
                    } weitere Begriffe)`
                    : `Suche nach "${originalQuery}"`}
                </span>
              </div>

              {/* Keywords */}
              {allKeywords.length > 0 && (
                <div className="flex flex-row flex-wrap gap-2">
                  {allKeywords.map((keyword: string) => (
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
              )}

              {/* Results */}
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-card/60 p-2">
                {allResults.length > 0 ? (
                  <>
                    <AnimatePresence>
                      {displayedResults.map(
                        (result: DatasetSearchResult, index) => (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{
                              duration: 0.2,
                              delay: index * 0.05,
                              ease: "easeOut",
                            }}
                          >
                            <Link
                              className="flex flex-row gap-1 rounded p-1 transition-colors hover:bg-card/80"
                              href={`https://www.data.gv.at/katalog/dataset/${result.id}`}
                              target="_blank"
                            >
                              <img
                                src={
                                  result.publisher?.homepage
                                    ? (() => {
                                      try {
                                        const url = new URL(result.publisher.homepage);
                                        return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
                                      } catch {
                                        return "https://www.data.gv.at/favicon.ico";
                                      }
                                    })()
                                    : "https://www.data.gv.at/assets/datagvat-logo-b60376ea.svg"
                                }
                                alt={"logo"}
                                className="mr-1 h-6 w-6 rounded-full border bg-secondary p-0.5"
                              />
                              <span className="max-w-1/2 truncate font-medium text-secondary-foreground">
                                {result.title.de}
                              </span>
                              <span className="text-muted-foreground">
                                {result.publisher?.homepage
                                  ? (() => {
                                    try {
                                      const url = new URL(result.publisher.homepage);
                                      return url.hostname;
                                    } catch {
                                      return result.publisher.homepage;
                                    }
                                  })()
                                  : "data.gv.at"}
                              </span>
                            </Link>
                          </motion.div>
                        )
                      )}
                    </AnimatePresence>

                    {hasMoreResults && (
                      <motion.button
                        type="button"
                        onClick={() => setShowAllResults(!showAllResults)}
                        className="mt-1 flex items-center justify-center gap-2 border-border/50 border-t px-2 py-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: displayedResults.length * 0.05 + 0.1,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          animate={{ rotate: showAllResults ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                        {showAllResults
                          ? "Weniger anzeigen"
                          : `${allResults.length - RESULTS_PER_PAGE
                          } weitere anzeigen`}
                      </motion.button>
                    )}
                  </>
                ) : (
                  <div className="w-full py-4 text-center text-muted-foreground">
                    Keine Treffer gefunden
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
