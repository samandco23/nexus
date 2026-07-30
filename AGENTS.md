# Nexus Invest — Agent Guide

## Project Structure

```
Samandco/
├── docker-compose.yml          # 5 services: frontend, backend, nginx, mysql, redis
├── nginx/default.conf          # Reverse proxy + CSP + HSTS
├── .env                        # Shared env (prod, Docker)
├── README.md                   # Project documentation
├── AUDIT_NEXUSCOIN_v5.4.7.md   # Full security audit
├── .github/workflows/ci.yml    # CI/CD pipeline
├── nexus-invest-frontend/      # Next.js 16 App Router (src/)
│   ├── src/lib/i18n/           # FR/EN/ES translations + currency engine
│   ├── src/stores/i18n-store.ts # Zustand persist for locale + currency
│   └── src/middleware.ts        # Cache-Control headers
└── nexus-invest-backend/       # Laravel 11 API
    ├── config/cors.php          # CORS restricted to FRONTEND_URL
    ├── config/logging.php       # 'audit' daily channel (90 days)
    └── openapi.yaml             # OpenAPI 3.0 spec (39 endpoints)
```

## Frontend Commands

```bash
# Dev
npm run dev -- --webpack

# Build
npm run build     # npx next build --webpack

# Production
npx next build --webpack && npx next start

# Tests
npm test          # vitest run (6 tests)
npm run test:watch # vitest watch mode
```

**PWA** : Service worker only generated during `--webpack` builds.

## i18n + Multi-devise

- **`useI18nStore()`** from `@/stores/i18n-store` — zustand store with persist
- **`const { t, locale, setLocale, currency, setCurrency } = useI18nStore()`
- Translations in `src/lib/i18n/{fr,en,es}.ts` (~80 keys each)
- **Fallback**: missing keys → French
- **`t('key', { param: value })`** — supports `{param}` interpolation
- **Currency**: `formatCurrency(amountInXAF, 'USD')` in `src/lib/i18n/index.ts`
- **`formatFCFA()`** delegates to user's preferred currency via `setCurrencyGetter`
- Exchange rates: XAF=1, EUR=1/655.957, USD=1/600, GBP=1/700
- Language + currency selectors in `Paramètres` page

## Frontend Architecture

- **Pages**: `(auth)/`, `(dashboard)/`, `(landing)/`, `(legal)/`, `admin/`
- **API client**: `src/lib/api-client.ts` — Axios + Sanctum Bearer token
- **Auth**: localStorage keys `access_token`, `user`
- **Components**: `GlassCard`, `GradientButton` (5 variants), `StatCard`, `CountdownTimer`, `InvestmentPackCard`, `WalletChart`
- **Hooks**: `useUser`, `useWallet`, `useInvestments`, `useMining`, `useReferrals`, `useCountdown`, `useChat`

## Backend Architecture

- **44 endpoints** under `api/v1` in `routes/api.php`
- **Controllers**: `app/Http/Controllers/Api/V1/`
- **Models**: User (auto-creates Wallet on `created`), Wallet, Investment, InvestmentPack, Transaction, MiningLog, ReferralEarning, WithdrawalRequest, SystemSetting, ChatRoom, ChatMessage, OtpCode
- **Middleware**: `admin` (is_admin + status=active), `user.status` (status=active)
- **Response format**: `{ success: bool, data: mixed, message: string }`

## Security

- **Sanctum** tokens expire after 7 days (config/sanctum.php)
- **CORS** restricted to `FRONTEND_URL` (config/cors.php)
- **Rate limiting**: login/register (5/60s), withdrawals (5/60s), password change (5/60s), verify-email (10/60s)
- **Password**: Bcrypt 12 rounds, regex `min:8 + 1 maj + 1 min + 1 digit`
- **Webhook callback**: verifies Stripe signature / Flutterwave hash before processing
- **Wallet ops**: `DB::transaction` + `lockForUpdate()` + `decrement()/increment()`
- **OTP**: UNIQUE(user_id, code, type), 10min expiry, rate-limited
- **Audit trail**: `Log::channel('audit')` — daily rotation, 90 days retention
- **Timing attack**: `Hash::check()` always called (even if email not found)
- **Nginx**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options

## Chat System

- Two room types: `general` (all users), `referral` (referrer + level-1 referrals)
- Referral room hidden from users without referrals
- Frontend polls `GET /chat/rooms/{id}` every 3 seconds (AbortController)
- Auto-creation via `firstOrCreate` when user with referrals accesses chat

## Key Quirks

1. **Registration fields**: `first_name`, `last_name`, `phone`, `country`, `country_code`, `password`, `password_confirmation`, `referral_code`. No French aliases.
2. **Wallet auto-creation** on User `created` event — never create Manually.
3. **PWA build** requires `--webpack` flag.
4. **Admin user**: `admin@nexusinvest.com` / `password`
5. **Investment packs**: 9 seeded packs (Starter→Titan)
6. **SendGrid**: replace `your-sendgrid-api-key` in both `.env` files
7. **Stripe/Flutterwave**: need live keys + webhook secrets configured in `.env`
8. **Docker**: `docker compose build && docker compose up -d`
9. **93 PHPUnit tests**: `php artisan test`
10. **6 frontend tests**: `npm test` (vitest) — i18n store + currency conversion
10. **API documentation**: `openapi.yaml` (39 endpoints documented)

## When Adding New Features

1. Laravel: migration → Model → Controller → API Resource → route
2. Frontend: add nav link in `sidebar.tsx` + `mobile-nav.tsx`
3. Wrap controllers in try-catch with `ValidationException` catch for 422
4. Use `{ success, data, message }` response envelope
5. Use `Log::channel('audit')` for sensitive operations
6. Add i18n keys in all 3 translation files (`fr.ts`, `en.ts`, `es.ts`)
7. Use `{t('key')}` for all user-visible strings
