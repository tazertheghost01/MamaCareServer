"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


export interface GrowthDataPoint {
  day: string;
  users: number;
}

type UserGrowthChartProps = {
  data: GrowthDataPoint[];
  isLoading?: boolean;
};

export default function UserGrowthChart({ data, isLoading = false }: UserGrowthChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          User Growth 
          <span className="text-sm font-normal text-muted-foreground">
            Last 7 days
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-b-3xl">
            <span className="text-sm font-medium text-pink-600 animate-pulse">
              Loading growth analytics...
            </span>
          </div>
        )}

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }} 
              stroke="hsl(var(--muted-foreground))"
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #f3f4f6", 
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)"
              }} 
            />
            <Line 
              type="natural" 
              dataKey="users" 
              stroke="#db2777" 
              strokeWidth={3} 
              dot={{ fill: "#db2777", r: 4, strokeWidth: 0 }} 
              activeDot={{ r: 6, strokeWidth: 0 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
