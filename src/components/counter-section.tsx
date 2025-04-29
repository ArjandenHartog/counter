"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, RotateCcw, Users } from "lucide-react";

interface CounterSectionProps {
  onUpdate: () => void;
}

export function CounterSection({ onUpdate }: CounterSectionProps) {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [animateCount, setAnimateCount] = useState<boolean>(false);

  // Fetch initial count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/count');
        const data = await response.json();
        return data.count;
      } catch (error) {
        console.error('Error fetching count:', error);
        return 0;
      }
    };

    fetchCount().then(setCount);
  }, []);

  // Handle increment
  const handleIncrement = async () => {
    try {
      const response = await fetch('/api/increment', {
        method: 'POST',
      });
      const data = await response.json();
      setCount(data.count);
    } catch (error) {
      console.error('Error incrementing count:', error);
    }
  };

  // Handle decrement
  const handleDecrement = async () => {
    try {
      const response = await fetch('/api/decrement', {
        method: 'POST',
      });
      const data = await response.json();
      setCount(data.count);
    } catch (error) {
      console.error('Error decrementing count:', error);
    }
  };

  // Handle reset
  const handleReset = async () => {
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
      });
      const data = await response.json();
      setCount(data.count);
    } catch (error) {
      console.error('Error resetting count:', error);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-none shadow-xl overflow-hidden relative group">
      {/* Animated gradient border effect */}
      <div className="absolute inset-px z-0 rounded-lg p-[1px] bg-gradient-to-r from-sgpj-purple via-sgpj-orange to-sgpj-blue opacity-50 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]"></div>
      
      <div className="absolute inset-0 bg-gray-800 rounded-lg m-[1px] z-0"></div>
      
      <CardHeader className="bg-gradient-to-r from-sgpj-purple to-sgpj-purple/90 rounded-t-lg relative z-10">
        <div className="absolute top-0 right-0 w-16 h-16 bg-sgpj-orange/20 rounded-full blur-xl -mr-8 -mt-8"></div>
        <CardTitle className="text-center text-white text-2xl flex items-center justify-center gap-2">
          <Users className="h-5 w-5 text-sgpj-orange" />
          <span>Aantal aanmeldingen:</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-8 pb-6 relative z-10">
        <div className="flex flex-col items-center">
          <div className="relative mb-8">
            <p className={`text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-sgpj-orange transition-all duration-500 ${animateCount ? 'scale-125' : 'scale-100'}`}>
              {count}
            </p>
            <div className="absolute -inset-4 bg-sgpj-orange/5 rounded-full blur-xl z-[-1]"></div>
          </div>
          
          <div className="flex gap-4 flex-wrap justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-br from-sgpj-orange to-sgpj-orange/80 hover:from-sgpj-orange/90 hover:to-sgpj-orange text-white font-medium shadow-lg shadow-sgpj-orange/20 border-0 relative overflow-hidden group"
              onClick={handleIncrement}
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 rounded-md transition-transform duration-300"></div>
              <Plus className="mr-2 h-5 w-5" /> Toevoegen
            </Button>
            
            <Button
              size="lg"
              className="bg-gradient-to-br from-sgpj-purple to-sgpj-purple/80 hover:from-sgpj-purple/90 hover:to-sgpj-purple text-white font-medium shadow-lg shadow-sgpj-purple/20 border-0 relative overflow-hidden group"
              onClick={handleDecrement}
              disabled={isLoading || count === 0}
            >
              <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 rounded-md transition-transform duration-300"></div>
              <Minus className="mr-2 h-5 w-5" /> Afhalen
            </Button>
          </div>
          
          <Button
            variant="outline"
            className="mt-8 text-white hover:bg-red-900/20 border-red-700/50 hover:border-red-700 transition-all duration-300"
            onClick={handleReset}
            disabled={isLoading || count === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset naar 0
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 