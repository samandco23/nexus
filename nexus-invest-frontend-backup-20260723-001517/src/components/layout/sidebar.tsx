'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Pickaxe,
  Users,
  Wallet,
  History,
  User,
  MessageCircle,
  X,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import apiClient from '@/lib/api-client';

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/investir', label: 'Investir', icon: TrendingUp },
  { href: '/dashboard/minage', label: 'Minage', icon: Pickaxe },
  { href: '/dashboard/parrainage', label: 'Parrainage', icon: Users },
  { href: '/dashboard/portefeuille', label: 'Portefeuille', icon: Wallet },
  { href: '/dashboard/historique', label: 'Historique', icon: History },
  { href: '/dashboard/chat', label: 'Discussion', icon: MessageCircle },
  { href: '/dashboard/profil', label: 'Profil', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
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

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 h-full w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation principale"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <WalletIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              NexusCoin
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3 mt-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <link.icon
                  className={`h-5 w-5 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4">
            <p className="text-xs text-emerald-100 mb-1">Solde disponible</p>
            <p className="text-lg font-bold text-white">{walletBalance.toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>
      </aside>
    </>
  );
}
