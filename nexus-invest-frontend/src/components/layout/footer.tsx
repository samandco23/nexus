'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wallet, Mail, Phone, MapPin, ChevronRight, type LucideIcon } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerLinks: FooterColumn[] = [
  {
    title: 'Produits',
    links: [
      { label: 'Packs d\'investissement', href: '/#packs' },
      { label: 'Minage de tokens', href: '/dashboard' },
      { label: 'Parrainage', href: '/dashboard' },
      { label: 'Portefeuille', href: '/dashboard' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Conditions générales', href: '/cgu' },
      { label: 'Confidentialité', href: '/confidentialite' },
      { label: 'Mentions légales', href: '/mentions-legales' },
      { label: 'Cookies', href: '/confidentialite' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Centre d\'aide', href: '/#' },
      { label: 'Nous contacter', href: '/#' },
      { label: 'FAQ', href: '/#' },
      { label: 'Statut du service', href: '/#' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'contact@nexusinvest.com', href: 'mailto:contact@nexusinvest.com', icon: Mail },
      { label: '+237 600 000 001', href: 'tel:+237600000001', icon: Phone },
      { label: 'Douala, Cameroun', href: '#', icon: MapPin },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Nexus Invest</span>
            </motion.div>

            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              Plateforme d&apos;investissement innovante basée au Cameroun. Maximisez vos rendements grâce à nos packs adaptés à tous les budgets.
            </p>

            <div className="flex gap-3">
              {[
                { label: 'Twitter', href: '#' },
                { label: 'LinkedIn', href: '#' },
                { label: 'Telegram', href: '#' },
                { label: 'WhatsApp', href: '#' },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white transition-colors text-xs font-medium"
                  aria-label={social.label}
                >
                  {social.label.charAt(0)}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((column, idx) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h3 className="text-sm font-semibold text-white mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link: FooterLink) => (
                  <li key={link.label}>
                    <Link
                      href={link.href || '#'}
                      className="group inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {link.icon && <link.icon className="h-3.5 w-3.5 flex-shrink-0" />}
                      <span>{link.label}</span>
                      <ChevronRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-slate-800"
        >
          {[
            { value: '10 000+', label: 'Investisseurs' },
            { value: '2,5 Mds', label: 'FCFA investis' },
            { value: '9', label: 'Packs disponibles' },
            { value: '24/7', label: 'Support client' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-bold text-emerald-400">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} Nexus Invest. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Design &amp; Développement</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>v1.0.0</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              En ligne
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
