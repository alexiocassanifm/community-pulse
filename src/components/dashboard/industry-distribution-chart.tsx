"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartTooltip } from "./chart-primitives";

interface IndustryEntry {
  category: string;
  count: number;
  percentage: number;
}

interface IndustryDistributionChartProps {
  data: IndustryEntry[];
  totalDistinctIndustries?: number;
}

export function IndustryDistributionChart({
  data,
  totalDistinctIndustries,
}: IndustryDistributionChartProps) {
  const height = Math.max(data.length * 48 + 16, 150);

  // Calculate summary statistics
  const nonOtherIndustries = data.filter((d) => d.category !== "Other");
  const topIndustry =
    nonOtherIndustries.length > 0 ? nonOtherIndustries[0].category : "N/A";
  const industriesRepresented = totalDistinctIndustries ?? data.length;
  const top3Concentration =
    nonOtherIndustries
      .slice(0, 3)
      .reduce((sum, entry) => sum + entry.percentage, 0)
      .toFixed(1) + "%";
  const otherEntry = data.find((d) => d.category === "Other");
  const otherCount = otherEntry ? otherEntry.count : 0;

  return (
    <div>
      <div
        role="img"
        aria-label={`Bar chart showing industry distribution: ${data.map((d) => `${d.category} ${d.count}`).join(", ")}`}
      >
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
          >
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={150}
            />
            <Tooltip
              content={
                <ChartTooltip<IndustryEntry>
                  labelKey="category"
                  formatter={(entry) => (
                    <>
                      <p className="font-medium">{entry.category}</p>
                      <p className="text-muted-foreground">
                        {entry.count} {entry.count === 1 ? "participant" : "participants"} (
                        {entry.percentage}%)
                      </p>
                      {entry.category === "Other" && (
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Combined count from remaining industries
                        </p>
                      )}
                    </>
                  )}
                />
              }
              cursor={{ fill: "hsl(var(--muted))" }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={40}>
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={entry.category === "Other" ? "#9ca3af" : "#8b5cf6"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div>
          <p className="text-xs text-muted-foreground">Top Industry</p>
          <p className="font-bold text-sm mt-0.5">{topIndustry}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Industries Represented</p>
          <p className="font-bold text-sm mt-0.5">{industriesRepresented}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Top 3 Concentration</p>
          <p className="font-bold text-sm mt-0.5">{top3Concentration}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Other Count</p>
          <p className="font-bold text-sm mt-0.5">{otherCount}</p>
        </div>
      </div>
    </div>
  );
}
