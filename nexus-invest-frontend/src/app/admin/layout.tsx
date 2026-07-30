'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  ArrowLeftRight,
  ScrollText,
  Settings,
  Menu,
  X,
  LogOut,
  Wallet,
  Loader2,
  Send,
  Shield,
  Package,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { useI18nStore } from '@/stores/i18n-store';
import NotificationDropdown from '@/components/ui/notification-dropdown';

interface AdminLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18nStore();
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  const adminLinks: AdminLink[] = [
    { href: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard },
    { href: '/admin/utilisateurs', label: t('admin.users'), icon: Users },
    { href: '/admin/investissements', label: t('admin.investments'), icon: TrendingUp },
    { href: '/admin/packs', label: t('admin.packs'), icon: Package },
    { href: '/admin/kyc', label: t('admin.kyc'), icon: Shield },
    { href: '/admin/retraits', label: t('admin.withdrawals'), icon: ArrowLeftRight },
    { href: '/admin/audit', label: t('admin.audit'), icon: ScrollText },
    { href: '/admin/parametres', label: t('admin.settings'), icon: Settings },
    { href: '/admin/notifications', label: t('admin.notifications'), icon: Send },
  ];

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      router.push('/connexion');
      return;
    }

    const checkAdmin = async () => {
      try {
        const res = await apiClient.get(API_URLS.auth.me);
        const user = res.data.data;
        if (user?.is_admin) {
          setAuthorized(true);
          return;
        }
      } catch {
        // API check failed — redirect to dashboard
      }
      router.push('/dashboard');
    };

    checkAdmin().finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    router.push('/connexion');
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-transform duration-300 ease-out lg:translate-x-0 lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Nexus Invest
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700 hidden lg:block">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Nexus Invest
              </span>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {t('app.admin')}
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {adminLinks.map((link) => {
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

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
                aria-label={t('admin.open_menu')}
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">
                {t('app.admin')} Nexus Invest
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={t('admin.back_to_dashboard')}
              >
                <LayoutDashboard className="h-5 w-5" />
              </Link>
              <NotificationDropdown />
            </div>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
