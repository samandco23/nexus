'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Pickaxe,
  Users,
  Wallet,
  History,
  MessageCircle,
  User,
} from 'lucide-react';

interface MobileNavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mobileLinks: MobileNavLink[] = [
  { href: '/dashboard', label: 'Accueil', icon: LayoutDashboard },
  { href: '/dashboard/investir', label: 'Investir', icon: TrendingUp },
  { href: '/dashboard/minage', label: 'Minage', icon: Pickaxe },
  { href: '/dashboard/parrainage', label: 'Parrainage', icon: Users },
  { href: '/dashboard/portefeuille', label: 'Portefeuille', icon: Wallet },
  { href: '/dashboard/historique', label: 'Historique', icon: History },
  { href: '/dashboard/chat', label: 'Discussion', icon: MessageCircle },
  { href: '/dashboard/profil', label: 'Profil', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl lg:hidden"
      aria-label="Navigation mobile"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-0 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium truncate max-w-full">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
