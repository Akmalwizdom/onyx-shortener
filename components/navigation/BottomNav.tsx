'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/', icon: 'dashboard', label: 'Dashboard' },
  { href: '/history', icon: 'history', label: 'Links' },
  { href: '/analytics', icon: 'analytics', label: 'Analytics' },
];

interface BottomNavProps {
  className?: string;
}

/**
 * Fixed bottom navigation with elevated center FAB for creating new links.
 */
export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:hidden',
        'bg-black border-t border-white/10 px-6 py-4 pb-8', // Adjusted px for better spacing
        'flex justify-between items-center z-[100]',
        className
      )}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors p-2',
            pathname === item.href ? 'text-primary' : 'text-white/30 hover:text-white/60'
          )}
          aria-label={item.label}
        >
          <span className="material-symbols-outlined text-2xl">
            {item.icon}
          </span>
        </Link>
      ))}
    </nav>
  );
}

export default BottomNav;
