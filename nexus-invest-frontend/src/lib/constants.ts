export interface InvestmentPack {
  id: number;
  name: string;
  min_amount: number;
  duration_days: number;
  roi_percentage: number;
  loyalty_bonus_percentage: number;
  color_code: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
}

export const API_URLS = {
  base: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  sanctumCsrfCookie: `${process.env.NEXT_PUBLIC_SANCTUM_URL || 'http://localhost:8000'}/sanctum/csrf-cookie`,
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    password: '/auth/password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendOtp: '/auth/resend-otp',
    verifyPhone: '/auth/verify-phone',
    resendPhoneOtp: '/auth/resend-phone-otp',
  },
  investments: {
    list: '/investments',
    create: '/investments',
    active: '/investments/active',
    packs: '/investment-packs',
    detail: (id: number) => `/investments/${id}`,
  },
  wallet: {
    show: '/wallet',
    transactions: '/wallet/transactions',
  },
  referrals: {
    list: '/referrals',
    tree: '/referrals/tree',
    code: '/referrals/code',
  },
  mining: {
    status: '/mining/status',
    start: '/mining/start',
    claim: '/mining/claim',
    history: '/mining/history',
    convert: '/mining/convert',
  },
  withdrawals: {
    list: '/withdrawals',
    create: '/withdrawals',
    cancel: (id: number) => `/withdrawals/${id}/cancel`,
  },
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },
  chat: {
    rooms: '/chat/rooms',
    messages: (id: number) => `/chat/rooms/${id}`,
    send: (id: number) => `/chat/rooms/${id}`,
  },
  kyc: {
    status: '/kyc/status',
    upload: '/kyc/upload',
  },
  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    userDetail: (id: number) => `/admin/users/${id}`,
    toggleUserStatus: (id: number) => `/admin/users/${id}/toggle-status`,
    investments: '/admin/investments',
    withdrawals: '/admin/withdrawals',
    approveWithdrawal: (id: number) => `/admin/withdrawals/${id}/approve`,
    rejectWithdrawal: (id: number) => `/admin/withdrawals/${id}/reject`,
    packs: '/admin/packs',
    packDetail: (id: number) => `/admin/packs/${id}`,
  },
};

export const SITE_CONFIG = {
  name: 'Nexus Invest',
  tagline: 'Investissez dans votre avenir',
  description:
    'Plateforme d\'investissement innovante pour maximiser vos rendements en FCFA.',
  email: 'contact@nexusinvest.com',
  phone: '+225 01 02 03 04 05',
  address: 'Abidjan, Côte d\'Ivoire',
  social: {
    facebook: 'https://facebook.com/nexusinvest',
    twitter: 'https://twitter.com/nexusinvest',
    instagram: 'https://instagram.com/nexusinvest',
    telegram: 'https://t.me/nexusinvest',
  },
  support_hours: 'Lun-Ven 08:00-18:00',
  maintenance_mode: false,
  min_withdrawal: 5000,
  referral_bonus_percent: 5,
  referral_levels: 3,
};
