"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as PieChartIcon, BarChart as BarChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface CategoryData {
  name: string;
  value: number;
  icon?: string;
}

interface SpendingChartsProps {
  categoryData: CategoryData[];
  totalExpense: number;
}

const COLORS = [
  "#005f73",
  "#3a86ff",
  "#fb5607",
  "#ffbe0b",
  "#ff006e",
  "#94d2bd",
];

const chartConfig = {
  value: {
    label: "Amount",
  },
  // Add your categories here if needed for tooltip customization
};

export function SpendingCharts({ categoryData, totalExpense }: SpendingChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      {/* Spending by Category (Pie Chart) */}
      <Card className="flex flex-col hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            Spending by Category
          </CardTitle>
          <CardDescription>Breakdown of expenses</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 pb-0">
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChartIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                No expense data available yet
              </p>
            </div>
          ) : (
            <div className="w-full h-full">
              <ChartContainer
                config={chartConfig}
                className="w-full h-full mx-auto aspect-square max-h-[500px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const percent = (data.value / totalExpense) * 100;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] text-muted-foreground">
                                  Category
                                </span>
                                <span className="font-medium">{data.name}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] text-muted-foreground">
                                  Amount
                                </span>
                                <span className="font-medium">${data.value.toFixed(2)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] text-muted-foreground">
                                  Percentage
                                </span>
                                <span className="font-medium">{percent.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={120}
                    outerRadius={220}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            Total: ${totalExpense.toFixed(2)}
          </div>
          <div className="text-muted-foreground leading-none">
            Showing breakdown for all categories
          </div>
        </CardFooter>
      </Card>



      {/* Top Categories (Bar-like Progress) */}
      <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChartIcon className="h-4 w-4 text-primary" />
            Top Spending Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChartIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                No expense data available yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryData.map((cat: CategoryData, index: number) => {
                // Find the maximum value in categoryData
                const maxValue = Math.max(...categoryData.map((item) => item.value));
                // Calculate the percentage of the current category relative to the max value
                const relativePercentage = maxValue > 0 ? (cat.value / maxValue) * 100 : 0;
                // Scale to 80% of the container width
                const scaledPercentage = (relativePercentage / 100) * 90;


                const percentage = totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0;
                return (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-foreground">{cat.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        ${cat.value.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${scaledPercentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% of total
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
