"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig, 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import { TrendingUp, Clock } from "lucide-react";

interface LogEntry {
  id: number;
  timestamp: string;
  action: string;
  new_value: number;
}

interface ChartSectionProps {
  refreshTrigger: number;
}

export function ChartSection({ refreshTrigger }: ChartSectionProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Define chart configuration with SGPJ brand colors
  const chartConfig: ChartConfig = {
    value: {
      label: "Aantal aanmeldingen",
      color: "hsl(var(--sgpj-blue))",
    }
  };

  // Fetch logs and update chart when component mounts or refreshTrigger changes
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/logs");
        const logs: LogEntry[] = await response.json();
        
        if (logs.length > 0) {
          // Group logs by hours for a cleaner chart
          const hourlyData = processLogData(logs);
          setChartData(hourlyData);
        }
      } catch (error) {
        console.error("Error fetching logs for chart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [refreshTrigger]);

  // Process log data to group by hours
  const processLogData = (logs: LogEntry[]) => {
    // Sort logs by timestamp (oldest first)
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Group by hour
    const hourMap = new Map();
    
    sortedLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const hour = new Date(
        date.getFullYear(), 
        date.getMonth(), 
        date.getDate(), 
        date.getHours()
      ).toISOString();
      
      hourMap.set(hour, log.new_value);
    });

    // Create array of chart data
    return Array.from(hourMap.entries()).map(([hour, value]) => {
      const date = new Date(hour);
      return {
        hour: date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
        timestamp: date,
        value: value
      };
    });
  };

  // Format the x-axis tick labels
  const formatXAxis = (tickItem: string) => {
    return tickItem;
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-sgpj-blue/20 shadow-lg">
          <p className="text-sgpj-blue font-medium">{label}</p>
          <p className="text-white font-bold text-lg">
            {payload[0].value} <span className="text-xs opacity-70">aanmeldingen</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-none shadow-xl overflow-hidden relative group">
      {/* Animated gradient border effect */}
      <div className="absolute inset-px z-0 rounded-lg p-[1px] bg-gradient-to-r from-sgpj-blue via-sgpj-orange to-sgpj-blue opacity-50 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]"></div>
      
      <div className="absolute inset-0 bg-gray-800 rounded-lg m-[1px] z-0"></div>
      
      <CardHeader className="bg-gradient-to-r from-sgpj-orange to-sgpj-orange/90 rounded-t-lg relative z-10">
        <div className="absolute top-0 left-0 w-16 h-16 bg-sgpj-blue/20 rounded-full blur-xl -ml-8 -mt-8"></div>
        <CardTitle className="text-white flex items-center justify-center gap-2">
          <TrendingUp className="h-5 w-5 text-sgpj-blue" />
          <span>Aanmeldingen over tijd</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sgpj-blue"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-white/60">
            <Clock className="h-5 w-5 mr-2" />
            <span>Geen data beschikbaar</span>
          </div>
        ) : (
          <div className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--sgpj-blue))" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="hsl(var(--sgpj-blue))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="hour" 
                  tickLine={false} 
                  tickMargin={10} 
                  axisLine={false}
                  stroke="#fff"
                  tick={{ fill: '#fff', fontSize: 12 }}
                  tickFormatter={formatXAxis}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--sgpj-blue))" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}