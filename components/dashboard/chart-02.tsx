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

// Datenanfrage-Typen für die letzten 12 Monate
const chartData = [
  { month: "Jan 2025", IFG: 25, IWG: 12, DZG: 8 },
  { month: "Feb 2025", IFG: 28, IWG: 15, DZG: 9 },
  { month: "Mar 2025", IFG: 26, IWG: 13, DZG: 9 },
  { month: "Apr 2025", IFG: 32, IWG: 18, DZG: 11 },
  { month: "May 2025", IFG: 29, IWG: 16, DZG: 10 },
  { month: "Jun 2025", IFG: 35, IWG: 20, DZG: 12 },
  { month: "Jul 2025", IFG: 31, IWG: 17, DZG: 10 },
  { month: "Aug 2025", IFG: 38, IWG: 22, DZG: 12 },
  { month: "Sep 2025", IFG: 34, IWG: 19, DZG: 11 },
  { month: "Oct 2025", IFG: 41, IWG: 24, DZG: 13 },
  { month: "Nov 2025", IFG: 37, IWG: 21, DZG: 12 },
  { month: "Dec 2025", IFG: 44, IWG: 25, DZG: 15 },
];

const chartConfig = {
  IFG: {
    label: "IFG",
    color: "var(--chart-1)",
  },
  IWG: {
    label: "IWG",
    color: "var(--chart-6)",
  },
  DZG: {
    label: "DZG",
    color: "var(--chart-4)",
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

export function Chart02() {
  const id = useId();

  const totalIFG = chartData.reduce((sum, item) => sum + item.IFG, 0);
  const totalIWG = chartData.reduce((sum, item) => sum + item.IWG, 0);
  const totalDZG = chartData.reduce((sum, item) => sum + item.DZG, 0);
  const totalRequests = totalIFG + totalIWG + totalDZG;

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle>Anfragetypen</CardTitle>
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">{totalRequests}</div>
              <Badge className="mt-1.5 bg-emerald-500/24 text-emerald-500 border-none">
                +24.7%
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
                IFG
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-6"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">
                IWG
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-xs bg-chart-4"
              />
              <div className="text-[13px]/3 text-muted-foreground/50">
                DZG
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-60 w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--chart-1)/15 [&_.recharts-rectangle.recharts-tooltip-inner-cursor]:fill-white/20"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: -12, right: 12, top: 12 }}
          >
            <defs>
              <linearGradient id={`${id}-gradient-1`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--chart-2)" />
                <stop offset="100%" stopColor="var(--chart-1)" />
              </linearGradient>
              <linearGradient id={`${id}-gradient-2`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--chart-4)" />
                <stop offset="100%" stopColor="var(--chart-6)" />
              </linearGradient>
              <linearGradient id={`${id}-gradient-3`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--chart-1)" />
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
              dataKey="IWG"
              stroke="var(--chart-6)"
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
            <Line
              type="linear"
              dataKey="DZG"
              stroke="var(--chart-4)"
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
            <ChartTooltip
              content={
                <CustomTooltipContent
                  colorMap={{
                    IFG: "var(--chart-1)",
                    IWG: "var(--chart-6)",
                    DZG: "var(--chart-4)",
                  }}
                  labelMap={{
                    IFG: "IFG - Informationsfreiheitsgesetz",
                    IWG: "IWG - Informationsweiterverwendungsgesetz",
                    DZG: "DZG - Datenzugangsgesetz",
                  }}
                  dataKeys={["IFG", "IWG", "DZG"]}
                  valueFormatter={(value) => value.toString()}
                />
              }
              cursor={<CustomCursor fill="var(--chart-1)" />}
            />
            <Line
              type="linear"
              dataKey="IFG"
              stroke={`url(#${id}-gradient-1)`}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--chart-1)",
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
