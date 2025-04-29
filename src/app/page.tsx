"use client";

import { useState } from "react";
import { CounterSection } from "@/components/counter-section";
import { TeamCounterSection } from "@/components/team-counter-section";
import { ChartSection } from "@/components/chart-section";
import { LogsSection } from "@/components/logs-section";

export default function Home() {
  // Use a counter as a simple way to trigger refreshes of logs and chart
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger refresh of logs and chart
  const handleUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] z-0 pointer-events-none"></div>
      <div className="container mx-auto p-4 sm:p-6 md:p-8 relative z-10">
        <header className="text-center mb-12 pt-8 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-sgpj-purple via-sgpj-orange to-sgpj-blue rounded-full blur-sm"></div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sgpj-orange via-white to-sgpj-blue mb-3">
            Volleybalavond aanmeldingen
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            #behoudrilanainob
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
          <div className="transform transition-all duration-300 hover:scale-[1.02] hover:-rotate-1">
            <CounterSection onUpdate={handleUpdate} />
          </div>
          <div className="transform transition-all duration-300 hover:scale-[1.02] hover:rotate-1">
            <TeamCounterSection onUpdate={handleUpdate} />
          </div>
          <div className="md:col-span-2 transform transition-all duration-300 hover:scale-[1.02]">
            <ChartSection refreshTrigger={refreshTrigger} />
          </div>
          <div className="md:col-span-2 transform transition-all duration-300 hover:scale-[1.01]">
            <LogsSection refreshTrigger={refreshTrigger} />
          </div>
        </div>
        
        <footer className="mt-16 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} SGPJ. Alle rechten voorbehouden.</p>
        </footer>
      </div>
    </main>
  );
}

// Add this export for static generation
export const dynamic = 'force-static';
