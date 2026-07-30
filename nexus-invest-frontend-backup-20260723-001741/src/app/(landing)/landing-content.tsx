'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Users, Wallet, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import InvestmentPackCard from '@/components/ui/investment-pack-card';
import Footer from '@/components/layout/footer';
import { useI18nStore } from '@/stores/i18n-store';
import { SITE_CONFIG } from '@/lib/constants';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import type { InvestmentPack } from '@/hooks/use-investments';

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

const features = [
  {
    icon: Zap,
    titleKey: 'nav.minage',
    descKey: 'landing.feature_mining_desc',
    color: '#10b981',
  },
  {
    icon: TrendingUpIcon,
    titleKey: 'nav.invest',
    descKey: 'landing.feature_invest_desc',
    color: '#f59e0b',
  },
  {
    icon: Users,
    titleKey: 'nav.referral',
    descKey: 'landing.feature_referral_desc',
    color: '#3b82f6',
  },
  {
    icon: Wallet,
    titleKey: 'nav.wallet',
    descKey: 'landing.feature_withdrawal_desc',
    color: '#ec4899',
  },
];

const FALLBACK_PACKS: InvestmentPack[] = [
  { id: 1, name: 'Starter', min_amount: 5000, duration_days: 30, roi_percentage: 5, loyalty_bonus_percentage: 0, color_code: '#10b981', icon_name: 'Rocket', display_order: 1, is_active: true },
  { id: 2, name: 'Basic', min_amount: 10000, duration_days: 45, roi_percentage: 7, loyalty_bonus_percentage: 0, color_code: '#34d399', icon_name: 'Zap', display_order: 2, is_active: true },
  { id: 3, name: 'Silver', min_amount: 25000, duration_days: 60, roi_percentage: 10, loyalty_bonus_percentage: 0, color_code: '#a3a3a3', icon_name: 'Star', display_order: 3, is_active: true },
  { id: 4, name: 'Gold', min_amount: 50000, duration_days: 90, roi_percentage: 12, loyalty_bonus_percentage: 0, color_code: '#f59e0b', icon_name: 'Award', display_order: 4, is_active: true },
  { id: 5, name: 'Platinum', min_amount: 100000, duration_days: 120, roi_percentage: 15, loyalty_bonus_percentage: 0, color_code: '#818cf8', icon_name: 'Gem', display_order: 5, is_active: true },
  { id: 6, name: 'Diamond', min_amount: 250000, duration_days: 180, roi_percentage: 18, loyalty_bonus_percentage: 0, color_code: '#06b6d4', icon_name: 'Diamond', display_order: 6, is_active: true },
  { id: 7, name: 'Elite', min_amount: 500000, duration_days: 240, roi_percentage: 22, loyalty_bonus_percentage: 0, color_code: '#ec4899', icon_name: 'Crown', display_order: 7, is_active: true },
  { id: 8, name: 'Whale', min_amount: 1000000, duration_days: 300, roi_percentage: 28, loyalty_bonus_percentage: 0, color_code: '#8b5cf6', icon_name: 'Fish', display_order: 8, is_active: true },
  { id: 9, name: 'Titan', min_amount: 2000000, duration_days: 365, roi_percentage: 35, loyalty_bonus_percentage: 0, color_code: '#f43f5e', icon_name: 'Flame', display_order: 9, is_active: true },
];

const testimonials = [
  { name: 'Kouamé Jean', location: 'Abidjan', text: "J'ai investi dans le pack Platinum il y a 3 mois. Les rendements sont conformes aux promesses. Je recommande !", rating: 5 },
  { name: 'Diallo Aminata', location: 'Dakar', text: 'Le système de parrainage est incroyable. En 2 mois j\'ai déjà généré plus de 200 000 FCFA de bonus.', rating: 5 },
  { name: 'Touré Moussa', location: 'Bamako', text: 'Plateforme fiable et support réactif. Les retraits sont rapides, jamais eu de problème.', rating: 4 },
  { name: 'Koné Fatou', location: 'Ouagadougou', text: 'J\'ai commencé avec le pack Starter pour tester. Maintenant je suis à Diamond. Une vraie révolution.', rating: 5 },
];

function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const prev = useCallback(() => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1)), []);
  const next = useCallback(() => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1)), []);
  const { t } = useI18nStore();
  const item = testimonials[current];

  return (
    <GlassCard variant="highlight" padding="lg" className="max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center gap-4">
        <Quote className="h-8 w-8 text-emerald-500" />
        <p className="text-lg text-slate-700 dark:text-slate-300 italic leading-relaxed">&ldquo;{item.text}&rdquo;</p>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} className={`h-5 w-5 ${i < item.rating ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
          <p className="text-sm text-slate-500">{item.location}</p>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={prev} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label={t('landing.testimonial_prev')}><ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" /></button>
          <button onClick={next} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label={t('landing.testimonial_next')}><ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" /></button>
        </div>
      </div>
    </GlassCard>
  );
}

export default function LandingContent() {
  const { t } = useI18nStore();
  const [packs, setPacks] = useState<InvestmentPack[]>(FALLBACK_PACKS);

  useEffect(() => {
    apiClient.get(API_URLS.investments.packs).then((res) => {
      const data = res.data.data ?? res.data;
      if (Array.isArray(data) && data.length > 0) {
        setPacks(data);
      }
    }).catch(() => {});
  }, []);

  const handlePackSelect = useCallback((pack: InvestmentPack) => {
    window.location.href = `/connexion?redirect=/dashboard/investir/${pack.id}`;
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{SITE_CONFIG.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Fonctionnalités</Link>
            <Link href="#packs" className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Packs</Link>
            <Link href="#testimonials" className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Avis</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/connexion"><GradientButton variant="ghost" size="sm">{t('auth.login')}</GradientButton></Link>
            <Link href="/inscription"><GradientButton variant="primary" size="sm">{t('auth.register')}</GradientButton></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-200/30 via-transparent to-transparent dark:from-emerald-900/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 text-sm text-emerald-700 dark:text-emerald-400">
              <Shield className="h-4 w-4" /> {t('landing.secure_platform')}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('landing.hero_title')}{' '}
              <span className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-gold-400 bg-clip-text text-transparent">{t('landing.hero_highlight')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
              {t('landing.hero_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/inscription"><GradientButton variant="primary" size="xl" iconComponent={ArrowRight} iconPosition="right">{t('landing.start_investing')}</GradientButton></Link>
              <Link href="#packs"><GradientButton variant="secondary" size="xl">{t('landing.view_packs')}</GradientButton></Link>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <GlassCard variant="dark" padding="sm" className="text-center"><p className="text-2xl font-bold text-emerald-400">+500%</p><p className="text-xs text-slate-400">{t('landing.max_return')}</p></GlassCard>
            <GlassCard variant="dark" padding="sm" className="text-center"><p className="text-2xl font-bold text-white">10 000+</p><p className="text-xs text-slate-400">{t('landing.investors')}</p></GlassCard>
            <GlassCard variant="dark" padding="sm" className="text-center"><p className="text-2xl font-bold text-emerald-400">2,5 Mds</p><p className="text-xs text-slate-400">{t('landing.invested_amount')}</p></GlassCard>
            <GlassCard variant="dark" padding="sm" className="text-center"><p className="text-2xl font-bold text-white">24/7</p><p className="text-xs text-slate-400">{t('landing.support')}</p></GlassCard>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('landing.why_choose')}</h2><p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t('landing.why_choose_desc')}</p></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <GlassCard key={feature.titleKey} variant="default" hover className="text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl mx-auto mb-4" style={{ backgroundColor: `${feature.color}15` }}>
                  <feature.icon className="h-7 w-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t(feature.titleKey)}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t(feature.descKey)}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section id="packs" className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('landing.our_packs')}</h2><p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t('landing.our_packs_desc')}</p></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{packs.filter((p) => p.is_active).map((pack) => (<InvestmentPackCard key={pack.id} pack={pack} onSelect={handlePackSelect} />))}</div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('landing.testimonials_title')}</h2><p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t('landing.testimonials_desc')}</p></div>
          <TestimonialsCarousel />
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-500">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('landing.cta_title')}</h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">{t('landing.cta_desc')}</p>
          <Link href="/inscription"><GradientButton variant="gold" size="xl" iconComponent={ArrowRight} iconPosition="right">{t('landing.create_free_account')}</GradientButton></Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
