'use client';

import { ReactNode } from 'react';
import { Navbar } from '@/components/navigation/Navbar';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string; // Allow passing className for additional styling hooks
}

export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      {/* Desktop Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      {/* Added pt-20 to account for fixed navbar height */}
      <main className={`flex-1 w-full transition-all duration-300 md:pt-20 ${className}`}>
        <div className="mx-auto w-full max-w-[430px] md:max-w-7xl h-full flex flex-col md:px-8 md:py-8">
           {children}
        </div>
      </main>
    </div>
  );
}
