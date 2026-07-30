'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Wallet,
  User,
} from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';

interface MobileNavLink {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mobileLinks: MobileNavLink[] = [
  { href: '/dashboard', labelKey: 'nav.home', icon: LayoutDashboard },
  { href: '/dashboard/investir', labelKey: 'nav.invest_short', icon: TrendingUp },
  { href: '/dashboard/portefeuille', labelKey: 'nav.wallet', icon: Wallet },
  { href: '/dashboard/parrainage', labelKey: 'nav.referral', icon: Users },
  { href: '/dashboard/profil', labelKey: 'nav.profile', icon: User },
];

export default function MobileNav() {
  const { t } = useI18nStore();
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl lg:hidden"
      aria-label={t('nav.mobile_navigation')}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-0 relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-emerald-500"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ duration: 0.15 }}
              >
                <link.icon className="h-5 w-5" />
              </motion.div>
              <span className="text-[10px] font-medium truncate max-w-full">
                {t(link.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
