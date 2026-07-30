'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';
import { useI18nStore } from '@/stores/i18n-store';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const trustItems = [
  { icon: Shield, text: 'auth.trust_secure' },
  { icon: TrendingUp, text: 'auth.trust_returns' },
  { icon: Star, text: 'auth.trust_support' },
];

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { t } = useI18nStore();

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative flex-col bg-gradient-to-br from-emerald-600 to-emerald-800 p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.1),transparent_50%)]" />

        <div className="relative z-10 flex flex-col h-full">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/" className="inline-flex items-center gap-2.5 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">{t('app.name')}</span>
            </Link>
          </motion.div>

          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                {t('auth.side_title')}
              </h2>
              <p className="text-emerald-100/80 mt-3 text-sm leading-relaxed max-w-sm">
                {t('auth.side_desc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 space-y-4"
            >
              {trustItems.map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <item.icon className="h-4 w-4 text-emerald-200" />
                  </div>
                  <span className="text-sm text-emerald-100/90">{t(item.text)}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-xs text-emerald-300/50"
          >
            &copy; {new Date().getFullYear()} {t('app.name')}. {t('footer.rights')}
          </motion.p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{t('app.name')}</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-8">{subtitle}</p>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
