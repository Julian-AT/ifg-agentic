import Link from "next/link";
import { Badge } from "./ui/badge";
import { SparklesIcon } from "./icons";
import { Skeleton } from "./ui/skeleton";
import { SearchIcon, ChevronDown, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedShinyText } from "./magicui/animated-shiny-text";

interface DatasetSearchResult {
  id: string;
  title: string;
  publisher_link?: string;
}

interface DatasetSearchOutput {
  result: {
    results: DatasetSearchResult[];
    count: number;
  };
  searchInfo?: {
    originalQuery?: string;
    successfulQuery?: string;
    attempts?: number;
  };
}

interface DatasetSearchInput {
  q: string;
  keywords?: string[];
}

interface MergedSearchResult {
  toolCallId: string;
  input: DatasetSearchInput;
  output: DatasetSearchOutput;
}

interface MergedDatasetSearchProps {
  searches: MergedSearchResult[];
  isLoading: boolean;
}

export function MergedDatasetSearch({
  searches,
  isLoading,
}: MergedDatasetSearchProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);

  const allResults: DatasetSearchResult[] = [];
  const allKeywords: string[] = [];
  const queries: string[] = [];
  let totalCount = 0;

  searches.forEach((search) => {
    if (search.output?.result?.results) {
      search.output.result.results.forEach((result) => {
        if (!allResults.find((existing) => existing.id === result.id)) {
          allResults.push(result);
        }
      });
      totalCount += search.output.result.count || 0;
    }

    if (search.input?.keywords) {
      search.input.keywords.forEach((keyword) => {
        if (!allKeywords.includes(keyword)) {
          allKeywords.push(keyword);
        }
      });
    }

    if (search.input?.q && !queries.includes(search.input.q)) {
      queries.push(search.input.q);
    }
  });

  const originalQuery =
    searches.find((s) => s.input?.q && s.input.q !== "data.gv.at")?.input.q ||
    queries[0] ||
    "Datensätzen";
  const isMultipleSearches = queries.length > 1;

  // Pagination logic
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
        <AnimatedShinyText className="flex flex-row gap-2 items-center">
          <Search className="w-4 h-4" />
          Suche nach {originalQuery}...
        </AnimatedShinyText>

        {allKeywords.length > 0 && (
          <motion.div
            className="flex flex-col gap-2 bg-card/60 p-2 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex flex-row gap-2 flex-wrap">
              {allKeywords.slice(0, 3).map((keyword: string) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="flex flex-row gap-2 text-sm items-center bg-card/60 border border-border"
                >
                  <SearchIcon size={14} />
                  <span>{keyword}</span>
                </Badge>
              ))}
              {allKeywords.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-card/60 border border-border"
                >
                  +{allKeywords.length - 3}
                </Badge>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          className="bg-card/60 p-2 rounded-lg border gap-2 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {["skeleton-1", "skeleton-2", "skeleton-3"].map(
            (skeletonId, index) => (
              <motion.div
                key={skeletonId}
                className="flex flex-row gap-1 items-center"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.2 }}
              >
                <Skeleton className="w-6 h-6 rounded-full mr-1" />
                <Skeleton className="h-4 flex-1 max-w-48" />
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
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex flex-row gap-2 items-center text-muted-foreground hover:text-foreground transition-colors text-left group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
        <Search className="w-4 h-4" />
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
              <div className="flex flex-row gap-2 items-center text-muted-foreground text-sm">
                <SparklesIcon size={14} />
                <span>
                  {isMultipleSearches
                    ? `Suche nach "${originalQuery}" (+ ${
                        queries.length - 1
                      } weitere Begriffe)`
                    : `Suche nach "${originalQuery}"`}
                </span>
              </div>

              {/* Keywords */}
              {allKeywords.length > 0 && (
                <div className="flex flex-row gap-2 flex-wrap">
                  {allKeywords.map((keyword: string) => (
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
              )}

              {/* Results */}
              <div className="p-2 rounded-lg border gap-2 flex flex-col bg-card/60 border-border">
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
                              className="flex flex-row gap-1 hover:bg-card/80 p-1 rounded transition-colors"
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
                          </motion.div>
                        )
                      )}
                    </AnimatePresence>

                    {hasMoreResults && (
                      <motion.button
                        type="button"
                        onClick={() => setShowAllResults(!showAllResults)}
                        className="flex items-center justify-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors border-t border-border/50 mt-1"
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
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                        {showAllResults
                          ? "Weniger anzeigen"
                          : `${
                              allResults.length - RESULTS_PER_PAGE
                            } weitere anzeigen`}
                      </motion.button>
                    )}
                  </>
                ) : (
                  <div className="text-muted-foreground w-full text-center py-4">
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
