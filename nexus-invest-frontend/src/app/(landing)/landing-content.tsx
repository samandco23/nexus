'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Shield, Zap, Users, Wallet, ChevronLeft, ChevronRight,
  ChevronDown, Quote, Sun, Moon, Globe, TrendingUp, Sparkles, BarChart3, Award,
  Star,
} from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import InvestmentPackCard from '@/components/ui/investment-pack-card';
import Footer from '@/components/layout/footer';
import { useI18nStore } from '@/stores/i18n-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuth } from '@/contexts/auth-context';
import { SITE_CONFIG, API_URLS } from '@/lib/constants';
import apiClient from '@/lib/api-client';
import type { InvestmentPack } from '@/hooks/use-investments';
import type { Locale } from '@/lib/i18n';
import { CURRENCIES } from '@/lib/i18n';
import { FadeIn, SlideUp } from '@/components/shared/animations';

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: 'fr', label: 'FR', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'en', label: 'EN', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'es', label: 'ES', flag: '\u{1F1EA}\u{1F1F8}' },
];

const FEATURES = [
  { icon: Zap, titleKey: 'nav.minage', descKey: 'landing.feature_mining_desc', color: '#10b981' },
  { icon: TrendingUp, titleKey: 'nav.invest', descKey: 'landing.feature_invest_desc', color: '#f59e0b' },
  { icon: Users, titleKey: 'nav.referral', descKey: 'landing.feature_referral_desc', color: '#3b82f6' },
  { icon: Wallet, titleKey: 'nav.wallet', descKey: 'landing.feature_withdrawal_desc', color: '#ec4899' },
];

const FALLBACK_PACKS: InvestmentPack[] = [
  { id: 1, name: 'Starter', min_amount: 3500, duration_days: 7, roi_percentage: 100, loyalty_bonus_percentage: 0, color_code: '#10b981', icon_name: 'Rocket', display_order: 1, is_active: true },
  { id: 2, name: 'Bronze', min_amount: 10000, duration_days: 15, roi_percentage: 120, loyalty_bonus_percentage: 0, color_code: '#d97706', icon_name: 'Zap', display_order: 2, is_active: true },
  { id: 3, name: 'Argent', min_amount: 25000, duration_days: 30, roi_percentage: 150, loyalty_bonus_percentage: 0, color_code: '#a3a3a3', icon_name: 'Star', display_order: 3, is_active: true },
  { id: 4, name: 'Or', min_amount: 50000, duration_days: 60, roi_percentage: 180, loyalty_bonus_percentage: 0, color_code: '#f59e0b', icon_name: 'Award', display_order: 4, is_active: true },
  { id: 5, name: 'Platine', min_amount: 100000, duration_days: 90, roi_percentage: 220, loyalty_bonus_percentage: 0, color_code: '#818cf8', icon_name: 'Gem', display_order: 5, is_active: true },
  { id: 6, name: 'Diamant', min_amount: 250000, duration_days: 120, roi_percentage: 260, loyalty_bonus_percentage: 0, color_code: '#06b6d4', icon_name: 'Diamond', display_order: 6, is_active: true },
  { id: 7, name: 'Elite', min_amount: 500000, duration_days: 180, roi_percentage: 320, loyalty_bonus_percentage: 0, color_code: '#ec4899', icon_name: 'Crown', display_order: 7, is_active: true },
  { id: 8, name: 'Ambassadeur', min_amount: 1000000, duration_days: 240, roi_percentage: 400, loyalty_bonus_percentage: 0, color_code: '#8b5cf6', icon_name: 'Fish', display_order: 8, is_active: true },
  { id: 9, name: 'Titan', min_amount: 2000000, duration_days: 270, roi_percentage: 500, loyalty_bonus_percentage: 0, color_code: '#f43f5e', icon_name: 'Flame', display_order: 9, is_active: true },
];

const TESTIMONIALS = [
  { name: 'Kouam\u00e9 Jean', location: 'Abidjan', text: "J'ai investi dans le pack Platine il y a 3 mois. Les rendements sont conformes aux promesses. Je recommande !", rating: 5 },
  { name: 'Diallo Aminata', location: 'Dakar', text: 'Le syst\u00e8me de parrainage est incroyable. En 2 mois j\'ai d\u00e9j\u00e0 g\u00e9n\u00e9r\u00e9 plus de 200 000 FCFA de bonus.', rating: 5 },
  { name: 'Tour\u00e9 Moussa', location: 'Bamako', text: 'Plateforme fiable et support r\u00e9actif. Les retraits sont rapides, jamais eu de probl\u00e8me.', rating: 4 },
  { name: 'Kon\u00e9 Fatou', location: 'Ouagadougou', text: 'J\'ai commenc\u00e9 avec le pack Starter pour tester. Maintenant je suis \u00e0 Diamant. Une vraie r\u00e9volution.', rating: 5 },
];

const HERO_STATS = [
  { value: '+500 %', labelKey: 'landing.max_return' },
  { value: '10 000+', labelKey: 'landing.investors' },
  { value: '2,5 Mds', labelKey: 'landing.invested_amount' },
  { value: '24/7', labelKey: 'landing.support' },
];

export default function LandingContent() {
  const { t, locale, setLocale, currency, setCurrency } = useI18nStore();
  const { theme, toggleTheme } = useUIStore();
  const { isAuthenticated } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const [packs, setPacks] = useState<InvestmentPack[]>(FALLBACK_PACKS);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [testDir, setTestDir] = useState(0);

  useEffect(() => {
    apiClient.get(API_URLS.investments.packs).then((res) => {
      const data = res.data.data ?? res.data;
      if (Array.isArray(data) && data.length > 0) setPacks(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestDir(1);
      setTestimonialIdx((c) => (c === TESTIMONIALS.length - 1 ? 0 : c + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePackSelect = useCallback((pack: InvestmentPack) => {
    window.location.href = isAuthenticated
      ? `/dashboard/investir/${pack.id}`
      : `/connexion?redirect=/dashboard/investir/${pack.id}`;
  }, [isAuthenticated]);

  const goToTestimonial = (idx: number) => {
    setTestDir(idx > testimonialIdx ? 1 : -1);
    setTestimonialIdx(idx);
  };

  const prevTestimonial = () => {
    setTestDir(-1);
    setTestimonialIdx((c) => (c === 0 ? TESTIMONIALS.length - 1 : c - 1));
  };

  const nextTestimonial = () => {
    setTestDir(1);
    setTestimonialIdx((c) => (c === TESTIMONIALS.length - 1 ? 0 : c + 1));
  };

  const tItem = TESTIMONIALS[testimonialIdx];

  const carouselVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{SITE_CONFIG.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t('nav.features')}</Link>
            <Link href="#packs" className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t('nav.packs')}</Link>
            <Link href="#testimonials" className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t('nav.reviews')}</Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div ref={langRef} className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-xl animate-in fade-in">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLocale(lang.code); setLangOpen(false); }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                          locale === lang.code
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.label}</span>
                        {locale === lang.code && <span className="ml-auto text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div ref={currencyRef} className="relative">
                <button
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {currencyOpen && (
                  <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-xl animate-in fade-in">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                          currency === c.code
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span>{c.symbol}</span>
                        <span>{t(c.labelKey)}</span>
                        {currency === c.code && <span className="ml-auto text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard"><GradientButton variant="primary" size="sm">{t('nav.dashboard')}</GradientButton></Link>
              ) : (
                <>
                  <Link href="/connexion" className="hidden sm:inline"><GradientButton variant="ghost" size="sm">{t('auth.login')}</GradientButton></Link>
                  <Link href="/inscription"><GradientButton variant="primary" size="sm">{t('auth.register')}</GradientButton></Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 text-sm text-emerald-700 dark:text-emerald-400">
                <Shield className="h-4 w-4" />
                <span>{t('landing.secure_platform')}</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('landing.hero_title')}{' '}
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">{t('landing.hero_highlight')}</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
                {t('landing.hero_description')}
              </p>
            </FadeIn>

            <FadeIn delay={0.45}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={isAuthenticated ? '/dashboard' : '/inscription'}>
                  <GradientButton variant="primary" size="xl" iconComponent={ArrowRight} iconPosition="right">
                    {t('landing.start_investing')}
                  </GradientButton>
                </Link>
                <Link href="#packs">
                  <GradientButton variant="secondary" size="xl">{t('landing.view_packs')}</GradientButton>
                </Link>
              </div>
            </FadeIn>

            <SlideUp delay={0.6}>
              <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto w-full">
                {HERO_STATS.map((stat, i) => (
                  <div key={i} className="rounded-2xl bg-slate-900 dark:bg-slate-800 p-4 text-center border border-slate-700">
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{t(stat.labelKey)}</p>
                  </div>
                ))}
              </div>
            </SlideUp>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 sm:py-28 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-4 py-1.5 text-sm text-emerald-600 dark:text-emerald-400 mb-4">
                <Sparkles className="h-4 w-4" />
                <span>{t('nav.features')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">{t('landing.why_choose')}</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t('landing.why_choose_desc')}</p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <FadeIn key={feature.titleKey} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 text-center h-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl mx-auto mb-4"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon className="h-7 w-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t(feature.descKey)}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="packs" className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/30 px-4 py-1.5 text-sm text-amber-600 dark:text-amber-400 mb-4">
                <BarChart3 className="h-4 w-4" />
                <span>{t('landing.our_packs')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">{t('landing.our_packs')}</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t('landing.our_packs_desc')}</p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.filter((p) => p.is_active).map((pack, i) => (
              <FadeIn key={pack.id} delay={i * 0.08}>
                <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                  <InvestmentPackCard pack={pack} onSelect={handlePackSelect} />
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 sm:py-28 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-4 py-1.5 text-sm text-emerald-600 dark:text-emerald-400 mb-4">
                <Award className="h-4 w-4" />
                <span>{t('landing.testimonials_title')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">{t('landing.testimonials_title')}</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t('landing.testimonials_desc')}</p>
            </div>
          </FadeIn>

          <SlideUp>
            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/40 dark:border-emerald-800/30 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
                <AnimatePresence mode="wait" custom={testDir}>
                  <motion.div
                    key={testimonialIdx}
                    custom={testDir}
                    variants={carouselVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex flex-col items-center text-center gap-4"
                  >
                    <Quote className="h-8 w-8 text-emerald-500" />
                    <p className="text-lg text-slate-700 dark:text-slate-300 italic leading-relaxed">&ldquo;{tItem.text}&rdquo;</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < tItem.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{tItem.name}</p>
                      <p className="text-sm text-slate-500">{tItem.location}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-3 mt-6 justify-center">
                  <button onClick={prevTestimonial} className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm" aria-label={t('landing.testimonial_prev')}>
                    <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <div className="flex items-center gap-2">
                    {TESTIMONIALS.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToTestimonial(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === testimonialIdx ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-300 dark:bg-slate-600'}`}
                      />
                    ))}
                  </div>
                  <button onClick={nextTestimonial} className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm" aria-label={t('landing.testimonial_next')}>
                    <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </SlideUp>
        </div>
      </section>

      <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <SlideUp>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{t('landing.cta_title')}</h2>
            <p className="text-emerald-100/80 text-lg mb-10 max-w-xl mx-auto">{t('landing.cta_desc')}</p>
            <Link href={isAuthenticated ? '/dashboard' : '/inscription'}>
              <GradientButton variant="gold" size="xl" iconComponent={ArrowRight} iconPosition="right" className="text-lg shadow-2xl shadow-amber-500/30">
                {t('landing.create_free_account')}
              </GradientButton>
            </Link>
          </SlideUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
