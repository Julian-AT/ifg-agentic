"use client";

import { useId } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { CustomTooltipContent } from "@/components/dashboard/charts-extra";
import { Badge } from "@/components/ui/badge";

// Datenanfrage-Kategorien für die letzten 12 Monate
const chartData = [
  { month: "Jan 2025", verwaltung: 15, umwelt: 12, wirtschaft: 8 },
  { month: "Feb 2025", verwaltung: 18, umwelt: 14, wirtschaft: 10 },
  { month: "Mar 2025", verwaltung: 16, umwelt: 13, wirtschaft: 9 },
  { month: "Apr 2025", verwaltung: 20, umwelt: 16, wirtschaft: 11 },
  { month: "May 2025", verwaltung: 17, umwelt: 15, wirtschaft: 10 },
  { month: "Jun 2025", verwaltung: 22, umwelt: 18, wirtschaft: 12 },
  { month: "Jul 2025", verwaltung: 19, umwelt: 16, wirtschaft: 11 },
  { month: "Aug 2025", verwaltung: 24, umwelt: 19, wirtschaft: 13 },
  { month: "Sep 2025", verwaltung: 21, umwelt: 17, wirtschaft: 12 },
  { month: "Oct 2025", verwaltung: 26, umwelt: 21, wirtschaft: 14 },
  { month: "Nov 2025", verwaltung: 23, umwelt: 19, wirtschaft: 13 },
  { month: "Dec 2025", verwaltung: 28, umwelt: 22, wirtschaft: 15 },
];

const chartConfig = {
  verwaltung: {
    label: "Verwaltung",
    color: "var(--chart-4)",
  },
  umwelt: {
    label: "Umwelt",
    color: "var(--chart-2)",
  },
  wirtschaft: {
    label: "Wirtschaft",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

interface CustomCursorProps {
  fill?: string;
  pointerEvents?: string;
  height?: number;
  points?: Array<{ x: number; y: number }>;
  className?: string;
}

function CustomCursor(props: CustomCursorProps) {
  const { fill, pointerEvents, height, points, className } = props;

  if (!points || points.length === 0) {
    return null;
  }

  const { x, y } = points[0];
  return (
    <>
      <Rectangle
        x={x - 12}
        y={y}
        fill={fill}
        pointerEvents={pointerEvents}
        width={24}
        height={height}
        className={className}
        type="linear"
      />
      <Rectangle
        x={x - 1}
        y={y}
        fill={fill}
        pointerEvents={pointerEvents}
        width={1}
        height={height}
        className="recharts-tooltip-inner-cursor"
        type="linear"
      />
    </>
  );
}

export function Chart04() {
  const id = useId();

  const totalVerwaltung = chartData.reduce((sum, item) => sum + item.verwaltung, 0);
  const totalUmwelt = chartData.reduce((sum, item) => sum + item.umwelt, 0);
  const totalWirtschaft = chartData.reduce((sum, item) => sum + item.wirtschaft, 0);
  const totalRequests = totalVerwaltung + totalUmwelt + totalWirtschaft;

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle>Anfragekategorien</CardTitle>
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">{totalRequests}</div>
              <Badge className="mt-1.5 bg-rose-500/24 text-rose-500 border-none">
                +3.9%
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
                Verwaltung
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-2"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">
                Umwelt
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-6"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">
                Wirtschaft
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-60 w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--chart-4)/10 [&_.recharts-rectangle.recharts-tooltip-inner-cursor]:fill-white/20"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: -12, right: 12, top: 12 }}
          >
            <defs>
              <linearGradient id={`${id}-gradient`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--chart-5)" />
                <stop offset="100%" stopColor="var(--chart-4)" />
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
              tickFormatter={(value) => value.slice(0, 3)}
              stroke="var(--border)"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value.toString()}
              interval="preserveStartEnd"
            />
            <Line
              type="linear"
              dataKey="umwelt"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
            <Line
              type="linear"
              dataKey="wirtschaft"
              stroke="var(--chart-6)"
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
            <ChartTooltip
              content={
                <CustomTooltipContent
                  colorMap={{
                    verwaltung: "var(--chart-4)",
                    umwelt: "var(--chart-2)",
                    wirtschaft: "var(--chart-6)",
                  }}
                  labelMap={{
                    verwaltung: "Verwaltung & Behörden",
                    umwelt: "Umwelt & Nachhaltigkeit",
                    wirtschaft: "Wirtschaft & Finanzen",
                  }}
                  dataKeys={["verwaltung", "umwelt", "wirtschaft"]}
                  valueFormatter={(value) => value.toString()}
                />
              }
              cursor={<CustomCursor fill="var(--chart-4)" />}
            />
            <Line
              type="linear"
              dataKey="verwaltung"
              stroke={`url(#${id}-gradient)`}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--chart-4)",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
