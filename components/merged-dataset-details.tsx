import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Database } from "lucide-react";
import { DatasetDetailsWidget, type DatasetResult } from "./dataset-details-widget";
import { DatasetDetailsSkeleton } from "./dataset-skeletons";
import { ShinyText } from "./shiny-text";

type MergedDatasetResult = {
  toolCallId: string;
  datasetId: string;
  result: DatasetResult;
};

type MergedDatasetDetailsProps = {
  datasets: MergedDatasetResult[];
  isLoading: boolean;
};

export function MergedDatasetDetails({
  datasets,
  isLoading,
}: MergedDatasetDetailsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllDatasets, setShowAllDatasets] = useState(false);

  const DATASETS_PER_PAGE = 3;
  const displayedDatasets = showAllDatasets
    ? datasets
    : datasets.slice(0, DATASETS_PER_PAGE);
  const hasMoreDatasets = datasets.length > DATASETS_PER_PAGE;

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex flex-row items-center gap-2">
          <Database className="h-4 w-4" />
          <ShinyText text="Lade Datensatz-Details..." />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {[1, 2, 3].map((skeletonId) => (
            <motion.div
              key={skeletonId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: skeletonId * 0.1, duration: 0.3 }}
              className="mb-4 last:mb-0"
            >
              <DatasetDetailsSkeleton />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  const completedText =
    datasets.length === 1
      ? "Datensatz-Details geladen"
      : `${datasets.length} Datensatz-Details geladen`;

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
        className="group flex cursor-pointer flex-row items-center gap-2 text-left text-muted-foreground transition-colors hover:text-foreground"
        whileTap={{ scale: 0.99 }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
        <Database className="h-4 w-4" />
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
              className="flex flex-col gap-4"
            >
              <AnimatePresence>
                {displayedDatasets.map((dataset, index) => (
                  <motion.div
                    key={dataset.toolCallId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <DatasetDetailsWidget result={dataset.result} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {hasMoreDatasets && (
                <motion.button
                  type="button"
                  onClick={() => setShowAllDatasets(!showAllDatasets)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/60 px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-card/40 hover:text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: displayedDatasets.length * 0.05 + 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    animate={{ rotate: showAllDatasets ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                  {showAllDatasets
                    ? "Weniger Datensätze anzeigen"
                    : `${datasets.length - DATASETS_PER_PAGE
                    } weitere Datensätze anzeigen`}
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
