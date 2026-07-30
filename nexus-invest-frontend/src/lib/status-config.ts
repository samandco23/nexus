import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Wallet, RefreshCw, Gift, ArrowLeftRight, type LucideIcon } from 'lucide-react';

export const STATUS_CONFIG: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  active: { icon: TrendingUp, color: 'text-emerald-500', label: 'Actif' },
  completed: { icon: CheckCircle, color: 'text-blue-500', label: 'Terminé' },
  pending: { icon: Clock, color: 'text-amber-500', label: 'En attente' },
  failed: { icon: XCircle, color: 'text-red-500', label: 'Échoué' },
  cancelled: { icon: XCircle, color: 'text-slate-500', label: 'Annulé' },
  processing: { icon: RefreshCw, color: 'text-indigo-500', label: 'En cours' },
  rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejeté' },
  success: { icon: CheckCircle, color: 'text-emerald-500', label: 'Succès' },
};

export const TYPE_CONFIG: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  deposit: { icon: TrendingDown, color: 'text-emerald-500', label: 'Dépôt' },
  withdrawal: { icon: TrendingUp, color: 'text-red-500', label: 'Retrait' },
  weekly_profit: { icon: TrendingDown, color: 'text-blue-500', label: 'Profit hebdomadaire' },
  referral_bonus: { icon: Gift, color: 'text-purple-500', label: 'Bonus parrainage' },
  token_conversion: { icon: RefreshCw, color: 'text-amber-500', label: 'Conversion tokens' },
  investment: { icon: Wallet, color: 'text-emerald-500', label: 'Investissement' },
  refund: { icon: ArrowLeftRight, color: 'text-orange-500', label: 'Remboursement' },
};
