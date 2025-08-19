"use client";

import { useId } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { CustomTooltipContent } from "@/components/dashboard/charts-extra";
import { Badge } from "@/components/ui/badge";

const chartData = [
  { month: "Jan 2025", bearbeitet: 38, abgelehnt: -7 },
  { month: "Feb 2025", bearbeitet: 44, abgelehnt: -8 },
  { month: "Mar 2025", bearbeitet: 41, abgelehnt: -7 },
  { month: "Apr 2025", bearbeitet: 53, abgelehnt: -8 },
  { month: "May 2025", bearbeitet: 47, abgelehnt: -8 },
  { month: "Jun 2025", bearbeitet: 58, abgelehnt: -9 },
  { month: "Jul 2025", bearbeitet: 49, abgelehnt: -9 },
  { month: "Aug 2025", bearbeitet: 63, abgelehnt: -9 },
  { month: "Sep 2025", bearbeitet: 56, abgelehnt: -8 },
  { month: "Oct 2025", bearbeitet: 68, abgelehnt: -10 },
  { month: "Nov 2025", bearbeitet: 62, abgelehnt: -9 },
  { month: "Dec 2025", bearbeitet: 73, abgelehnt: -11 },
];

const chartConfig = {
  bearbeitet: {
    label: "Bearbeitet",
    color: "var(--chart-1)",
  },
  abgelehnt: {
    label: "Abgelehnt",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function Chart03() {
  const id = useId();

  // Get first and last month with type assertions
  const firstMonth = chartData[0]?.month as string;
  const lastMonth = chartData[chartData.length - 1]?.month as string;

  const totalProcessed = chartData.reduce((sum, item) => sum + item.bearbeitet, 0);
  const totalRejected = Math.abs(chartData.reduce((sum, item) => sum + item.abgelehnt, 0));
  const successRate = ((totalProcessed / (totalProcessed + totalRejected)) * 100).toFixed(1);

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle>Anfrageverarbeitung</CardTitle>
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">{totalProcessed}</div>
              <Badge className="mt-1.5 bg-emerald-500/24 text-emerald-500 border-none">
                {successRate}% Erfolg
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-1"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">
                Bearbeitet
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-4"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">
                Abgelehnt
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-60 w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-[var(--chart-1)]/15"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            stackOffset="sign"
            maxBarSize={20}
            margin={{ left: -12, right: 12, top: 12 }}
          >
            <defs>
              <linearGradient id={`${id}-gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" />
                <stop offset="100%" stopColor="var(--chart-2)" />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 2"
              stroke="var(--border)"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={12}
              ticks={[firstMonth, lastMonth]}
              stroke="var(--border)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toString()}
            />
            <ChartTooltip
              content={
                <CustomTooltipContent
                  colorMap={{
                    bearbeitet: "var(--chart-1)",
                    abgelehnt: "var(--chart-4)",
                  }}
                  labelMap={{
                    bearbeitet: "Bearbeitet",
                    abgelehnt: "Abgelehnt",
                  }}
                  dataKeys={["bearbeitet", "abgelehnt"]}
                  valueFormatter={(value) => value.toString()}
                />
              }
            />
            <Bar dataKey="bearbeitet" fill={`url(#${id}-gradient)`} stackId="a" />
            <Bar dataKey="abgelehnt" fill="var(--chart-4)" stackId="a" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
