'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Check,
  AlertTriangle,
  Loader2,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { useI18nStore } from '@/stores/i18n-store';
import type { InvestmentPack } from '@/lib/constants';

type PackForm = Omit<InvestmentPack, 'id'>;

const emptyForm: PackForm = {
  name: '',
  min_amount: 0,
  duration_days: 0,
  roi_percentage: 0,
  loyalty_bonus_percentage: 0,
  color_code: '#10b981',
  icon_name: 'TrendingUp',
  display_order: 1,
  is_active: true,
};

export default function AdminPacksPage() {
  const { t } = useI18nStore();
  const [packs, setPacks] = useState<InvestmentPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPack, setEditingPack] = useState<InvestmentPack | null>(null);
  const [form, setForm] = useState<PackForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(API_URLS.admin.packs);
      setPacks(res.data.data ?? []);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return packs;
    const q = search.toLowerCase();
    return packs.filter((p) => p.name.toLowerCase().includes(q));
  }, [search, packs]);

  const openCreate = () => {
    setEditingPack(null);
    setForm({ ...emptyForm, display_order: packs.length + 1 });
    setShowModal(true);
  };

  const openEdit = (pack: InvestmentPack) => {
    setEditingPack(pack);
    setForm({
      name: pack.name,
      min_amount: pack.min_amount,
      duration_days: pack.duration_days,
      roi_percentage: pack.roi_percentage,
      loyalty_bonus_percentage: pack.loyalty_bonus_percentage ?? 0,
      color_code: pack.color_code,
      icon_name: pack.icon_name,
      display_order: pack.display_order,
      is_active: pack.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error(t('admin.pack_name_required'));
      return;
    }
    setSaving(true);
    try {
      if (editingPack) {
        await apiClient.put(API_URLS.admin.packDetail(editingPack.id), form);
        toast.success(t('admin.pack_updated'));
      } else {
        await apiClient.post(API_URLS.admin.packs, form);
        toast.success(t('admin.pack_created'));
      }
      setShowModal(false);
      fetchPacks();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(axiosErr.response?.data?.message || t('common.error'));
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pack: InvestmentPack) => {
    if (deletingId === pack.id) return;
    setDeletingId(pack.id);
    try {
      await apiClient.delete(API_URLS.admin.packDetail(pack.id));
      toast.success(t('admin.pack_deleted'));
      setPacks((prev) => prev.filter((p) => p.id !== pack.id));
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(axiosErr.response?.data?.message || t('common.error'));
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const availableIcons = [
    'TrendingUp', 'Wallet', 'Zap', 'Shield', 'Award',
    'Diamond', 'Star', 'Rocket', 'Crown', 'Sparkles',
  ];

  const colorPresets = [
    '#10b981', '#059669', '#3b82f6', '#8b5cf6',
    '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
    '#f97316', '#6366f1', '#84cc16', '#06b6d4',
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.pack_management')}</h1>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          {!loading && !error && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('admin.packs_found', { count: filtered.length })}
            </p>
          )}
        </div>
        <GradientButton variant="primary" size="md" onClick={openCreate} iconComponent={Plus}>
          {t('admin.add_pack')}
        </GradientButton>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <GlassCard variant="default" padding="sm" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider w-8">#</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.pack_name')}</th>
                  <th className="text-right py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.pack_capital')}</th>
                  <th className="text-right py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.pack_duration')}</th>
                  <th className="text-right py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.pack_roi')}</th>
                  <th className="text-center py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider hidden md:table-cell">{t('admin.pack_status')}</th>
                  <th className="text-right py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.user_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pack, index) => (
                  <motion.tr
                    key={pack.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${
                      index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'
                    } hover:bg-slate-100 dark:hover:bg-slate-800`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                        <span className="font-mono text-xs text-slate-400">{pack.display_order}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                          style={{ backgroundColor: pack.color_code }}
                        >
                          {pack.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">{pack.name}</span>
                          {!pack.is_active && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                              {t('admin.pack_inactive')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium tabular-nums text-slate-900 dark:text-white">
                      {pack.min_amount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {pack.duration_days} {t('common.days')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                        {pack.roi_percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center hidden md:table-cell">
                      <div className={`inline-flex h-5 w-5 rounded-full items-center justify-center ${
                        pack.is_active ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        {pack.is_active ? (
                          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <X className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(pack)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          aria-label={t('common.edit')}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pack)}
                          disabled={deletingId === pack.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          aria-label={t('common.delete')}
                        >
                          {deletingId === pack.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <Package className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p>{search ? t('admin.pack_no_search') : t('admin.pack_no_packs')}</p>
            </div>
          )}
        </GlassCard>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingPack ? t('admin.pack_edit') : t('admin.pack_create')}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('admin.pack_name')}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Ex: Pack Starter"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('admin.pack_capital')} (FCFA)</label>
                    <input
                      type="number"
                      value={form.min_amount}
                      onChange={(e) => setForm((f) => ({ ...f, min_amount: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('admin.pack_duration')} ({t('common.days')})</label>
                    <input
                      type="number"
                      value={form.duration_days}
                      onChange={(e) => setForm((f) => ({ ...f, duration_days: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('admin.pack_roi')} (%)</label>
                    <input
                      type="number"
                      value={form.roi_percentage}
                      onChange={(e) => setForm((f) => ({ ...f, roi_percentage: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('admin.pack_loyalty')} (%)</label>
                    <input
                      type="number"
                      value={form.loyalty_bonus_percentage}
                      onChange={(e) => setForm((f) => ({ ...f, loyalty_bonus_percentage: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('admin.pack_order')}</label>
                    <input
                      type="number"
                      value={form.display_order}
                      onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('admin.pack_icon')}</label>
                    <select
                      value={form.icon_name}
                      onChange={(e) => setForm((f) => ({ ...f, icon_name: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                    >
                      {availableIcons.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('admin.pack_color')}</label>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, color_code: color }))}
                        className={`h-8 w-8 rounded-lg border-2 transition-all ${
                          form.color_code === color
                            ? 'border-slate-900 dark:border-white scale-110 shadow-md'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={color}
                      />
                    ))}
                    <input
                      type="color"
                      value={form.color_code}
                      onChange={(e) => setForm((f) => ({ ...f, color_code: e.target.value }))}
                      className="h-8 w-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 rounded-full bg-slate-300 dark:bg-slate-600 peer-checked:bg-emerald-500 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow peer-checked:translate-x-4 transition-transform" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('admin.pack_is_active')}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <GradientButton variant="primary" size="md" loading={saving} onClick={handleSave}>
                  {editingPack ? t('admin.pack_save') : t('admin.pack_create_btn')}
                </GradientButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
