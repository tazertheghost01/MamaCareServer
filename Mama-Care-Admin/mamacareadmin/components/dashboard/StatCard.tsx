import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: number | string; 
  icon: LucideIcon;
  change: string;
};

export default function StatCard({ label, value, icon: Icon, change }: StatCardProps) {
  const isNegative = change.startsWith("-");
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-5 w-5 text-pink-600" /> 
      </CardHeader>
      
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        
        <p className={`text-xs mt-1 font-medium ${
          isNegative 
            ? "text-red-600 dark:text-red-400" 
            : "text-emerald-600 dark:text-emerald-400"
        }`}>
          {isNegative ? "↓" : "↑"} {change.replace("-", "")} from last week
        </p>
      </CardContent>
    </Card>
  );
}
