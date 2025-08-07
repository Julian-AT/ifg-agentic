import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Database } from "lucide-react";
import { DatasetDetailsWidget } from "./dataset-details-widget";
import { AnimatedShinyText } from "./magicui/animated-shiny-text";
import { DatasetDetailsSkeleton } from "./dataset-skeletons";

interface DatasetResult {
  id: string;
  title: string;
  publisher?: string;
  notes?: string;
  tags?: Array<{ display_name: string; id: string }>;
  num_resources?: number;
  metadata_created?: string;
  metadata_modified?: string;
  license_title?: string;
}

interface MergedDatasetResult {
  toolCallId: string;
  datasetId: string;
  result: DatasetResult;
}

interface MergedDatasetDetailsProps {
  datasets: MergedDatasetResult[];
  isLoading: boolean;
}

export function MergedDatasetDetails({
  datasets,
  isLoading,
}: MergedDatasetDetailsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllDatasets, setShowAllDatasets] = useState(false);

  // Pagination logic
  const DATASETS_PER_PAGE = 3;
  const displayedDatasets = showAllDatasets
    ? datasets
    : datasets.slice(0, DATASETS_PER_PAGE);
  const hasMoreDatasets = datasets.length > DATASETS_PER_PAGE;

  // Loading state with AnimatedShinyText
  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <AnimatedShinyText className="flex flex-row gap-2 items-center">
          <Database className="w-4 h-4" />
          Lade Datensatz-Details...
        </AnimatedShinyText>
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
        <Database className="w-4 h-4" />
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
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-lg bg-card/60 hover:bg-card/40"
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
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                  {showAllDatasets
                    ? "Weniger Datensätze anzeigen"
                    : `${
                        datasets.length - DATASETS_PER_PAGE
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
