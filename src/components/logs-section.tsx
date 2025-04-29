"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, ArrowUpCircle, ArrowDownCircle, RefreshCw, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface LogEntry {
  id: number;
  timestamp: string;
  action: string;
  new_value: number;
}

interface LogsSectionProps {
  refreshTrigger: number;
}

export function LogsSection({ refreshTrigger }: LogsSectionProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latestLogId, setLatestLogId] = useState<number | null>(null);

  // Fetch logs when component mounts or refreshTrigger changes
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/logs');
        const data = await response.json();
        return data.logs || [];
      } catch (error) {
        console.error('Error fetching logs:', error);
        return [];
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs().then((data) => {
      setLogs(data);
      if (data.length > 0) {
        const newestLogId = Math.max(...data.map((log: LogEntry) => log.id));
        setLatestLogId(newestLogId);
      }
    });
  }, [refreshTrigger]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get the proper icon for each action type
  const getActionIcon = (action: string) => {
    switch (action) {
      case "verhoogd":
        return <ArrowUpCircle className="h-5 w-5 text-sgpj-orange" />;
      case "verlaagd":
        return <ArrowDownCircle className="h-5 w-5 text-sgpj-purple" />;
      case "reset":
        return <RefreshCw className="h-5 w-5 text-red-500" />;
      case "team_added":
        return <ArrowUpCircle className="h-5 w-5 text-sgpj-blue" />;
      case "team_removed":
        return <ArrowDownCircle className="h-5 w-5 text-sgpj-blue" />;
      default:
        return <Clock className="h-5 w-5 text-sgpj-blue" />;
    }
  };

  // Get appropriate text for log action
  const getActionText = (action: string) => {
    switch (action) {
      case "verhoogd":
        return "Individuele aanmelding verhoogd naar:";
      case "verlaagd":
        return "Individuele aanmelding verlaagd naar:";
      case "reset":
        return "Teller gereset naar:";
      case "team_added":
        return "Team aanmelding verhoogd naar:";
      case "team_removed":
        return "Team aanmelding verlaagd naar:";
      default:
        return `${action} naar:`;
    }
  };

  // Get color for action
  const getActionColor = (action: string) => {
    switch (action) {
      case "verhoogd":
        return "text-sgpj-orange";
      case "verlaagd":
        return "text-sgpj-purple";
      case "reset":
        return "text-red-400";
      case "team_added":
      case "team_removed":
        return "text-sgpj-blue";
      default:
        return "text-sgpj-blue";
    }
  };

  // Get background color for log item
  const getLogBackground = (action: string) => {
    switch (action) {
      case "verhoogd":
        return "bg-sgpj-orange/10 hover:bg-sgpj-orange/20 border-l-4 border-sgpj-orange";
      case "verlaagd":
        return "bg-sgpj-purple/10 hover:bg-sgpj-purple/20 border-l-4 border-sgpj-purple";
      case "reset":
        return "bg-red-900/10 hover:bg-red-900/20 border-l-4 border-red-700";
      case "team_added":
      case "team_removed":
        return "bg-sgpj-blue/10 hover:bg-sgpj-blue/20 border-l-4 border-sgpj-blue";
      default:
        return "bg-sgpj-blue/10 hover:bg-sgpj-blue/20 border-l-4 border-sgpj-blue";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-none shadow-xl overflow-hidden relative group">
      {/* Animated gradient border effect */}
      <div className="absolute inset-px z-0 rounded-lg p-[1px] bg-gradient-to-r from-sgpj-blue via-sgpj-purple to-sgpj-blue opacity-50 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]"></div>
      
      <div className="absolute inset-0 bg-gray-800 rounded-lg m-[1px] z-0"></div>
      
      <CardHeader className="bg-gradient-to-r from-sgpj-blue to-sgpj-blue/90 rounded-t-lg relative z-10">
        <div className="absolute top-0 right-0 w-16 h-16 bg-sgpj-purple/20 rounded-full blur-xl -mr-8 -mt-8"></div>
        <CardTitle className="text-white flex items-center justify-center gap-2">
          <ClipboardList className="h-5 w-5 text-white" />
          <span>Logboek</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 relative z-10">
        <ScrollArea className="h-[350px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sgpj-blue"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-white/60 gap-2">
              <ClipboardList className="h-8 w-8 mb-2 opacity-50" />
              <span>Geen loggegevens beschikbaar</span>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={log.id === latestLogId ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-md backdrop-blur-sm ${getLogBackground(log.action)}`}
                >
                  <div className="flex items-center gap-3">
                    {getActionIcon(log.action)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white flex flex-wrap items-center gap-x-2">
                        <span className="text-xs opacity-70 font-mono whitespace-nowrap">{formatDate(log.timestamp)}</span>
                        <span className="hidden sm:inline opacity-70">|</span> 
                        <span>{getActionText(log.action)}</span>
                        <span className={`text-base font-bold ${getActionColor(log.action)}`}>{log.new_value}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 