import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { AnimatedShinyText } from "@/components/animated-shiny-text";
import { motion, AnimatePresence } from "framer-motion";
import { ShinyText } from "./shiny-text";

interface ToolAccordionProps {
  icon: ReactNode;
  loadingText: string;
  completedText: string;
  isLoading: boolean;
  children: ReactNode;
  toolCallId: string;
}

export const ToolAccordion = ({
  icon,
  loadingText,
  completedText,
  isLoading,
  children,
  toolCallId,
}: ToolAccordionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex flex-row items-center gap-2">
          {icon}
          <ShinyText text={loadingText} />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {children}
        </motion.div>
      </motion.div>
    );
  }

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
        className="group flex flex-row items-center gap-2 text-left text-muted-foreground transition-colors hover:text-foreground"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
        {icon}
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
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
