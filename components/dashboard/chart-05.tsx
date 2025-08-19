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
  { month: "Jan 2025", privatperson: 20, journalisten: 12, forscher: 8 },
  { month: "Feb 2025", privatperson: 18, journalisten: 15, forscher: 10 },
  { month: "Mar 2025", privatperson: 22, journalisten: 13, forscher: 9 },
  { month: "Apr 2025", privatperson: 25, journalisten: 16, forscher: 11 },
  { month: "May 2025", privatperson: 20, journalisten: 14, forscher: 10 },
  { month: "Jun 2025", privatperson: 28, journalisten: 18, forscher: 12 },
  { month: "Jul 2025", privatperson: 24, journalisten: 16, forscher: 11 },
  { month: "Aug 2025", privatperson: 30, journalisten: 20, forscher: 13 },
  { month: "Sep 2025", privatperson: 26, journalisten: 17, forscher: 12 },
  { month: "Oct 2025", privatperson: 32, journalisten: 22, forscher: 14 },
  { month: "Nov 2025", privatperson: 29, journalisten: 19, forscher: 13 },
  { month: "Dec 2025", privatperson: 35, journalisten: 24, forscher: 15 },
];

const chartConfig = {
  privatperson: {
    label: "Privatpersonen",
    color: "var(--chart-4)",
  },
  journalisten: {
    label: "Journalisten",
    color: "var(--chart-1)",
  },
  forscher: {
    label: "Forscher",
    color: "var(--chart-6)",
  },
} satisfies ChartConfig;

export function Chart05() {
  const id = useId();

  // Get first and last month with type assertions
  const firstMonth = chartData[0]?.month as string;
  const lastMonth = chartData[chartData.length - 1]?.month as string;

  const totalPrivatperson = chartData.reduce((sum, item) => sum + item.privatperson, 0);
  const totalJournalisten = chartData.reduce((sum, item) => sum + item.journalisten, 0);
  const totalForscher = chartData.reduce((sum, item) => sum + item.forscher, 0);
  const totalUsers = totalPrivatperson + totalJournalisten + totalForscher;

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle>Anfragende Benutzer</CardTitle>
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">{totalUsers}</div>
              <Badge className="mt-1.5 bg-emerald-500/24 text-emerald-500 border-none">
                +11.9%
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-4"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">
                Privatpersonen
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-1"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">Journalisten</div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-6"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">
                Forscher
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
                    privatperson: "var(--chart-4)",
                    journalisten: "var(--chart-1)",
                    forscher: "var(--chart-6)",
                  }}
                  labelMap={{
                    privatperson: "Privatpersonen",
                    journalisten: "Journalisten & Medien",
                    forscher: "Forscher & Akademiker",
                  }}
                  dataKeys={["privatperson", "journalisten", "forscher"]}
                  valueFormatter={(value) => value.toString()}
                />
              }
            />
            <Bar dataKey="privatperson" fill="var(--chart-4)" stackId="a" />
            <Bar dataKey="journalisten" fill={`url(#${id}-gradient)`} stackId="a" />
            <Bar dataKey="forscher" fill="var(--chart-6)" stackId="a" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
