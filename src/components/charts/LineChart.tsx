import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface LineDataPoint {
  name: string;
  value: number;
  value2?: number;
  value3?: number;
}

interface LineChartProps {
  data: LineDataPoint[];
  title?: string;
  xAxisKey?: string;
  lines?: { key: string; name: string; color?: string }[];
}

export const LineChart = ({ 
  data, 
  title = "Trend Analysis",
  xAxisKey = "name",
  lines = [{ key: "value", name: "Score", color: "hsl(var(--foreground))" }]
}: LineChartProps) => {
  const colors = [
    "hsl(var(--foreground))",
    "hsl(var(--muted-foreground))",
    "hsl(var(--primary))",
  ];

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
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
              <Legend />
              {lines.map((line, index) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color || colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: line.color || colors[index % colors.length] }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};