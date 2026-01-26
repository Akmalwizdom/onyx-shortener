'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: 'dashboard', label: 'DASHBOARD', path: '/' },
    { icon: 'history', label: 'HISTORY', path: '/history' },
    { icon: 'analytics', label: 'ANALYTICS', path: '/analytics' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-xl border-b border-white/5 z-50 items-center justify-between px-8"
    >
      {/* Examples of "Cyber" aesthetics: distinct separation, monospace fonts, neon accents */}
      
      {/* LOGO */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors relative overflow-hidden">
            <span className="material-symbols-outlined text-primary text-lg animate-pulse-slow">bolt</span>
            <div className="absolute inset-0 bg-primary/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
        </div>
        <div className="flex flex-col">
            <h1 className="text-white font-bold tracking-tighter italic font-display leading-none">
            XYNO<span className="text-primary">.APP</span>
            </h1>
        </div>
      </Link>

      {/* CENTER NAV */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "relative px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300",
                isActive ? "text-primary bg-primary/5" : "text-white/40 hover:text-white"
              )}
            >
              <span className={cn(
                "material-symbols-outlined text-[18px]",
                isActive ? "fill-current" : ""
              )}>
                {item.icon}
              </span>
              <span className="text-xs font-mono font-bold tracking-wider">
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeNavTab"
                  className="absolute inset-0 rounded-full border border-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></div>
            <span className="text-[10px] text-white/40 font-mono">Online</span>
        </div>


      </div>
    </motion.nav>
  );
}
