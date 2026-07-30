'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, CreditCard, Building2, Check, AlertTriangle } from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';
import { toast } from 'sonner';
import { z } from 'zod';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import { formatFCFA, parseFCFA } from '@/lib/currency';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

const getWithdrawSchema = (t: (key: string) => string) => z.object({
  amount: z.number().min(5000, t('Le montant minimum est de 5 000 FCFA')),
  method: z.enum(['stripe', 'flutterwave_mobile', 'flutterwave_bank'], t('Sélectionnez un mode de retrait')),
  recipient: z.string().min(1, t('Les informations du bénéficiaire sont requises')),
  recipient_name: z.string().min(1, t('Le nom du bénéficiaire est requis')),
});

type WithdrawMethod = 'stripe' | 'flutterwave_mobile' | 'flutterwave_bank';

const methods: { id: WithdrawMethod; labelKey: string; descKey: string; icon: typeof CreditCard }[] = [
  { id: 'stripe', labelKey: 'wallet.stripe', descKey: 'Carte bancaire internationale', icon: CreditCard },
  { id: 'flutterwave_mobile', labelKey: 'wallet.mobile_money', descKey: 'Orange Money, MTN, Moov, Wave', icon: Smartphone },
  { id: 'flutterwave_bank', labelKey: 'wallet.bank_transfer', descKey: 'Virement bancaire local', icon: Building2 },
];

export default function WithdrawPage() {
  const router = useRouter();
  const { t } = useI18nStore();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WithdrawMethod | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [network, setNetwork] = useState('MTN');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const parsedAmount = parseFCFA(amount);

  const handleSubmit = () => {
    const result = getWithdrawSchema(t).safeParse({
      amount: parsedAmount,
      method,
      recipient,
      recipient_name: recipientName,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!method) return;
    setLoading(true);
    try {
      const recipient_details: Record<string, string> = {
        account_name: recipientName,
      };
      if (method === 'flutterwave_mobile') {
        recipient_details.phone = recipient;
        recipient_details.network = network;
      } else if (method === 'flutterwave_bank') {
        recipient_details.account_number = recipient;
        recipient_details.bank_code = '';
      } else {
        recipient_details.account_number = recipient;
      }

      await apiClient.post(API_URLS.withdrawals.create, {
        amount: parsedAmount,
        method: method === 'flutterwave_mobile' ? 'flutterwave_mobile_money' : method === 'flutterwave_bank' ? 'flutterwave_bank_transfer' : method,
        recipient_details,
      });
      toast.success(t('withdrawal.success'));
      router.push('/dashboard/portefeuille');
    } catch {
      toast.error(t('withdrawal.error'));
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full rounded-xl border py-2.5 px-4 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
      errors[field] ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
    }`;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </button>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('withdrawal.title')}</h1>

      <GlassCard variant="default" padding="lg">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('withdrawal.amount')}
            </label>
            <div className="relative">
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('withdrawal.placeholder_amount')}
                className={inputClass('amount') + ' text-2xl font-bold h-14'}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">{t('currency.xaf')}</span>
            </div>
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            {parsedAmount > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('withdrawal.fee')} : {formatFCFA(Math.round(parsedAmount * 0.01))} (1%)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('withdrawal.method')}</label>
            <div className="flex flex-col gap-2">
              {methods.map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => { setMethod(m.id); setErrors((prev) => ({ ...prev, method: '' })); }}
                    className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-700'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">{t(m.labelKey)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t(m.descKey)}</p>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
            {errors.method && <p className="text-xs text-red-500 mt-1">{errors.method}</p>}
          </div>

          <div>
            <label htmlFor="recipient_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('withdrawal.recipient_name')}
            </label>
            <input
              id="recipient_name"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder={t('withdrawal.placeholder_name')}
              className={inputClass('recipient_name')}
            />
            {errors.recipient_name && <p className="text-xs text-red-500 mt-1">{errors.recipient_name}</p>}
          </div>

          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('withdrawal.recipient_details')}
            </label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={t('withdrawal.placeholder_recipient')}
              className={inputClass('recipient')}
            />
            {errors.recipient && <p className="text-xs text-red-500 mt-1">{errors.recipient}</p>}
          </div>

          {method === 'flutterwave_mobile' && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('withdrawal.network')}</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white"
              >
                <option value="MTN">MTN</option>
                <option value="ORANGE">Orange</option>
                <option value="WAVE">Wave</option>
                <option value="MOOV">Moov</option>
              </select>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-700 dark:text-amber-400">
              {t('withdrawal.info')}
            </p>
          </div>

          <GradientButton variant="primary" size="lg" fullWidth onClick={handleSubmit}>
            {t('withdrawal.submit')}
          </GradientButton>
        </div>
      </GlassCard>

      <ConfirmDialog
        open={showConfirm}
        title={t('withdrawal.confirm_title')}
        message={t('withdrawal.confirm_message', { amount: formatFCFA(parsedAmount) })}
        variant="danger"
        confirmLabel={t('withdrawal.confirm_btn')}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        loading={loading}
      />
    </div>
  );
}
