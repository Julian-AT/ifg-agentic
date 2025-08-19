"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DatePicker from "@/components/dashboard/date-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowRightFromLineIcon, PlusIcon } from "lucide-react";

export function ActionButtons() {
  const isMobile = useIsMobile();

  return (
    <div className="flex gap-3">
      <DatePicker />
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="aspect-square max-lg:p-0">
              <ArrowRightFromLineIcon
                className="lg:-ms-1 opacity-40 size-5"
                size={20}
                aria-hidden="true"
              />
              <span className="max-lg:sr-only">Exportieren</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="lg:hidden" hidden={isMobile}>
            Exportieren
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="aspect-square max-lg:p-0">
              <PlusIcon
                className="lg:-ms-1 opacity-40 size-5"
                size={20}
                aria-hidden="true"
              />
              <span className="max-lg:sr-only">Neue Anfrage</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="lg:hidden" hidden={isMobile}>
            Neue Anfrage
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
