import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AreaDataPoint {
  name: string;
  value: number;
  value2?: number;
}

interface AreaChartProps {
  data: AreaDataPoint[];
  title?: string;
  xAxisKey?: string;
  areaKey?: string;
  area2Key?: string;
  showGradient?: boolean;
}

export const AreaChart = ({ 
  data, 
  title = "Progress Over Time",
  xAxisKey = "name",
  areaKey = "value",
  area2Key,
  showGradient = true
}: AreaChartProps) => {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.5}
              />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.625rem',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey={areaKey}
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                fillOpacity={1}
                fill={showGradient ? "url(#colorValue)" : "transparent"}
              />
              {area2Key && (
                <Area
                  type="monotone"
                  dataKey={area2Key}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={showGradient ? "url(#colorValue2)" : "transparent"}
                />
              )}
            </RechartsAreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};