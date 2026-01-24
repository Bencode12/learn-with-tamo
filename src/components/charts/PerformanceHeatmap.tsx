import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

interface PerformanceHeatmapProps {
  data: HeatmapData[];
  title?: string;
  maxValue?: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const PerformanceHeatmap = ({ 
  data, 
  title = "Activity Heatmap",
  maxValue = 100 
}: PerformanceHeatmapProps) => {
  const heatmapMatrix = useMemo(() => {
    const matrix: Record<string, Record<number, number>> = {};
    DAYS.forEach(day => {
      matrix[day] = {};
      HOURS.forEach(hour => {
        matrix[day][hour] = 0;
      });
    });
    
    data.forEach(item => {
      if (matrix[item.day] !== undefined) {
        matrix[item.day][item.hour] = item.value;
      }
    });
    
    return matrix;
  }, [data]);

  const getColor = (value: number) => {
    const intensity = Math.min(value / maxValue, 1);
    if (intensity === 0) return 'bg-muted/30';
    if (intensity < 0.25) return 'bg-primary/20';
    if (intensity < 0.5) return 'bg-primary/40';
    if (intensity < 0.75) return 'bg-primary/60';
    return 'bg-primary/90';
  };

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-2 ml-12">
              {HOURS.filter(h => h % 4 === 0).map(hour => (
                <div 
                  key={hour} 
                  className="text-xs text-muted-foreground"
                  style={{ width: `${100/6}%` }}
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-2 mb-1">
                <span className="w-10 text-xs text-muted-foreground font-medium">{day}</span>
                <div className="flex-1 flex gap-0.5">
                  {HOURS.map(hour => (
                    <Tooltip key={`${day}-${hour}`}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`flex-1 h-5 rounded-sm cursor-pointer transition-colors hover:ring-1 hover:ring-foreground/20 ${getColor(heatmapMatrix[day][hour])}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {day} {hour.toString().padStart(2, '0')}:00 - {heatmapMatrix[day][hour]} activities
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-sm bg-muted/30" />
                <div className="w-4 h-4 rounded-sm bg-primary/20" />
                <div className="w-4 h-4 rounded-sm bg-primary/40" />
                <div className="w-4 h-4 rounded-sm bg-primary/60" />
                <div className="w-4 h-4 rounded-sm bg-primary/90" />
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};