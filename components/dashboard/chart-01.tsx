"use client";

import { useId, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { CustomTooltipContent } from "@/components/dashboard/charts-extra";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const requestData = [
  { month: "Jan 2025", eingegangen: 45, genehmigt: 38 },
  { month: "Feb 2025", eingegangen: 52, genehmigt: 44 },
  { month: "Mar 2025", eingegangen: 48, genehmigt: 41 },
  { month: "Apr 2025", eingegangen: 61, genehmigt: 53 },
  { month: "May 2025", eingegangen: 55, genehmigt: 47 },
  { month: "Jun 2025", eingegangen: 67, genehmigt: 58 },
  { month: "Jul 2025", eingegangen: 58, genehmigt: 49 },
  { month: "Aug 2025", eingegangen: 72, genehmigt: 63 },
  { month: "Sep 2025", eingegangen: 65, genehmigt: 56 },
  { month: "Oct 2025", eingegangen: 78, genehmigt: 68 },
  { month: "Nov 2025", eingegangen: 71, genehmigt: 62 },
  { month: "Dec 2025", eingegangen: 84, genehmigt: 73 },
];

const responseData = [
  { month: "Jan 2025", durchschnitt: 12, schnellste: 3 },
  { month: "Feb 2025", durchschnitt: 11, schnellste: 2 },
  { month: "Mar 2025", durchschnitt: 13, schnellste: 4 },
  { month: "Apr 2025", durchschnitt: 10, schnellste: 2 },
  { month: "May 2025", durchschnitt: 12, schnellste: 3 },
  { month: "Jun 2025", durchschnitt: 9, schnellste: 1 },
  { month: "Jul 2025", durchschnitt: 11, schnellste: 2 },
  { month: "Aug 2025", durchschnitt: 10, schnellste: 2 },
  { month: "Sep 2025", durchschnitt: 12, schnellste: 3 },
  { month: "Oct 2025", durchschnitt: 9, schnellste: 1 },
  { month: "Nov 2025", durchschnitt: 11, schnellste: 2 },
  { month: "Dec 2025", durchschnitt: 10, schnellste: 2 },
];

const chartConfig = {
  eingegangen: {
    label: "Eingegangen",
    color: "var(--chart-1)",
  },
  genehmigt: {
    label: "Genehmigt",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const responseChartConfig = {
  durchschnitt: {
    label: "Durchschnitt",
    color: "var(--chart-1)",
  },
  schnellste: {
    label: "Schnellste",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function Chart01() {
  const id = useId();
  const [selectedValue, setSelectedValue] = useState("off");

  const chartData = selectedValue === "on" ? responseData : requestData;
  const chartConfigToUse = selectedValue === "on" ? responseChartConfig : chartConfig;

  const firstMonth = chartData[0]?.month as string;
  const lastMonth = chartData[chartData.length - 1]?.month as string;

  const totalRequests = requestData.reduce((sum, item) => sum + item.eingegangen, 0);
  const totalApproved = requestData.reduce((sum, item) => sum + item.genehmigt, 0);
  const approvalRate = ((totalApproved / totalRequests) * 100).toFixed(1);

  const avgResponseTime = responseData.reduce((sum, item) => sum + item.durchschnitt, 0) / responseData.length;
  const fastestResponse = Math.min(...responseData.map(item => item.schnellste));

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle>Datenanfragen</CardTitle>
            <div className="flex items-start gap-2">
              <div className="font-semibold text-2xl">
                {selectedValue === "off" ? `${totalRequests}` : `${avgResponseTime.toFixed(1)} Tage`}
              </div>
              <Badge className="mt-1.5 bg-emerald-500/24 text-emerald-500 border-none">
                {selectedValue === "off" ? `${approvalRate}% Genehmigt` : `Schnellste: ${fastestResponse} Tag`}
              </Badge>
            </div>
          </div>
          <div className="dark:bg-black/50 bg-secondary inline-flex h-7 rounded-lg p-0.5 shrink-0">
            <RadioGroup
              value={selectedValue}
              onValueChange={setSelectedValue}
              className="group text-xs after:border after:border-border after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] data-[state=off]:after:translate-x-0 data-[state=on]:after:translate-x-full"
              data-state={selectedValue}
            >
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="group-data-[state=on]:text-muted-foreground/50 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-2 whitespace-nowrap transition-colors select-none">
                Anfragen
                <RadioGroupItem
                  id={`${id}-1`}
                  value="off"
                  className="sr-only"
                />
              </label>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="group-data-[state=off]:text-muted-foreground/50 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-2 whitespace-nowrap transition-colors select-none">
                Antwortzeit
                <RadioGroupItem id={`${id}-2`} value="on" className="sr-only" />
              </label>
            </RadioGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfigToUse}
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
              tickFormatter={(value) => {
                if (selectedValue === "on") {
                  return `${value} Tag${value !== 1 ? 'e' : ''}`;
                }
                return value.toString();
              }}
            />
            <ChartTooltip
              content={
                <CustomTooltipContent
                  colorMap={{
                    eingegangen: "var(--chart-1)",
                    genehmigt: "var(--chart-6)",
                    durchschnitt: "var(--chart-1)",
                    schnellste: "var(--chart-6)",
                  }}
                  labelMap={{
                    eingegangen: "Eingegangen",
                    genehmigt: "Genehmigt",
                    durchschnitt: "Durchschnitt",
                    schnellste: "Schnellste",
                  }}
                  dataKeys={selectedValue === "on" ? ["durchschnitt", "schnellste"] : ["eingegangen", "genehmigt"]}
                  valueFormatter={(value) => selectedValue === "on" ? `${value} Tag${value !== 1 ? 'e' : ''}` : value.toString()}
                />
              }
            />
            <Bar
              dataKey={selectedValue === "on" ? "durchschnitt" : "eingegangen"}
              fill={`url(#${id}-gradient)`}
              stackId="a"
            />
            <Bar
              dataKey={selectedValue === "on" ? "schnellste" : "genehmigt"}
              fill="var(--chart-6)"
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
