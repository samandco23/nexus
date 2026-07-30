'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Pickaxe,
  Users,
  Wallet,
  History,
  User,
  MessageCircle,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useI18nStore } from '@/stores/i18n-store';
import apiClient from '@/lib/api-client';

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navLinkKeys: (Omit<NavLink, 'label'> & { labelKey: string })[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/dashboard/investir', labelKey: 'nav.invest', icon: TrendingUp },
  { href: '/dashboard/minage', labelKey: 'nav.minage', icon: Pickaxe },
  { href: '/dashboard/parrainage', labelKey: 'nav.referral', icon: Users },
  { href: '/dashboard/portefeuille', labelKey: 'nav.wallet', icon: Wallet },
  { href: '/dashboard/historique', labelKey: 'nav.history', icon: History },
  { href: '/dashboard/kyc', labelKey: 'nav.kyc', icon: Shield },
  { href: '/dashboard/chat', labelKey: 'nav.chat', icon: MessageCircle },
  { href: '/dashboard/profil', labelKey: 'nav.profile', icon: User },
];

const sidebarEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: sidebarEase },
  }),
};

export default function Sidebar() {
  const { t } = useI18nStore();
  const pathname = usePathname();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleSidebarCollapsed } = useUIStore();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    apiClient.get('/wallet').then(res => setWalletBalance(res.data.data?.fiat_balance ?? 0)).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        window.innerWidth < 1024
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSidebarOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const widthClass = sidebarCollapsed ? 'w-16' : 'w-64';

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 h-full ${widthClass} border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
        aria-label={t('nav.main_navigation')}
      >
        <div className={`flex h-16 items-center border-b border-slate-200 dark:border-slate-700 ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          {sidebarCollapsed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600"
            >
              <WalletIcon className="h-4 w-4 text-white" />
            </motion.div>
          ) : (
            <>
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <WalletIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('app.name')}
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
                aria-label={t('nav.close_menu')}
              >
                <X className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <nav className={`flex-1 flex flex-col gap-1 overflow-y-auto ${sidebarCollapsed ? 'p-2 items-center' : 'p-3'}`}>
          {navLinkKeys.map((link, i) => {
            const isActive = pathname === link.href;
            const label = t(link.labelKey);
            return (
              <motion.div
                key={link.href}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href={link.href}
                  className={`group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                    sidebarCollapsed
                      ? 'justify-center h-10 w-10'
                      : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  title={sidebarCollapsed ? label : undefined}
                >
                  <link.icon
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400 group-hover:scale-110'
                        : 'text-slate-400 dark:text-slate-500 group-hover:scale-110'
                    }`}
                  />
                  {!sidebarCollapsed && label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-emerald-500"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className={`border-t border-slate-200 dark:border-slate-700 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          {sidebarCollapsed ? (
            <button
              onClick={toggleSidebarCollapsed}
              className="flex items-center justify-center h-10 w-full rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={t('nav.expand_sidebar')}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4"
              >
                <p className="text-xs text-emerald-100 mb-1">{t('wallet.available_balance')}</p>
                <p className="text-lg font-bold text-white">{walletBalance.toLocaleString('fr-FR')} FCFA</p>
              </motion.div>
              <button
                onClick={toggleSidebarCollapsed}
                className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={t('nav.collapse_sidebar')}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{t('nav.collapse_sidebar')}</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
