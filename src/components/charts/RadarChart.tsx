import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RadarDataPoint {
  subject: string;
  score: number;
  fullMark?: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  title?: string;
  dataKey?: string;
}

export const RadarChart = ({ 
  data, 
  title = "Subject Performance",
  dataKey = "score"
}: RadarChartProps) => {
  const chartData = data.map(item => ({
    ...item,
    fullMark: item.fullMark || 100
  }));

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.5}
              />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ 
                  fill: 'hsl(var(--muted-foreground))', 
                  fontSize: 12 
                }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]}
                tick={{ 
                  fill: 'hsl(var(--muted-foreground))', 
                  fontSize: 10 
                }}
              />
              <Radar
                name="Performance"
                dataKey={dataKey}
                stroke="hsl(var(--foreground))"
                fill="hsl(var(--foreground))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px',
                }}
              />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};