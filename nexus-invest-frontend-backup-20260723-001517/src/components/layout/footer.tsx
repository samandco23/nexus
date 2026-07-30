import Link from 'next/link';
import { Wallet } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              NexusCoin
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/cgu" className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Conditions générales
            </Link>
            <Link href="/confidentialite" className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Confidentialité
            </Link>
            <Link href="/mentions-legales" className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Mentions légales
            </Link>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {currentYear} NexusCoin. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
