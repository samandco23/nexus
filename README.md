# Nexus Invest

Plateforme d'investissement et de minage de tokens avec parrainage multicritères.

**Stack :** Next.js 16 (Frontend) · Laravel 11 (API) · MySQL/Redis · Docker

---

## 🚀 Démarrage rapide

```bash
git clone <url>
cd Samandco

# 1. Variables d'environnement
cp nexus-invest-backend/.env.example nexus-invest-backend/.env
cp .env.example .env   # (créer depuis le template ci-dessous)

# 2. Docker
docker compose build && docker compose up -d

# 3. Migrations + seeders
docker compose exec backend php artisan migrate --seed
```

**Accès :**
- Frontend : http://localhost:3000
- API : http://localhost:8000/api/v1
- Admin par défaut : `admin@nexusinvest.com` / `password`

---

## 📦 Architecture

```
Samandco/
├── nexus-invest-frontend/    # Next.js 16 App Router + PWA (Serwist)
│   ├── src/
│   │   ├── app/              # Pages (auth, dashboard, admin, legal)
│   │   ├── components/       # UI + layout
│   │   ├── hooks/            # Hooks personnalisés
│   │   ├── lib/              # API client, i18n, currency, constantes
│   │   └── stores/           # Zustand stores (UI, i18n)
│   └── public/               # Static + PWA
├── nexus-invest-backend/     # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/  # 8 controllers
│   │   ├── Http/Middleware/           # Admin + CheckUserStatus
│   │   ├── Jobs/                      # PayWeeklyGains, ProcessReferralBonus
│   │   ├── Models/                    # 12 modèles
│   │   ├── Services/                  # Mining, Referral, Payment, Currency
│   │   └── Notifications/             # SendEmailOtp, ResetPasswordNotification
│   ├── config/              # CORS, services, logging (audit)
│   ├── database/
│   │   ├── migrations/      # 18 migrations
│   │   └── seeders/         # Admin + packs + settings
│   ├── routes/api.php       # 44 endpoints (v1)
│   ├── routes/console.php   # Scheduler (paiements hebdo, nettoyage OTP)
│   └── tests/Feature/       # 93 tests PHPUnit
├── nginx/default.conf       # Reverse proxy avec CSP/HSTS
└── docker-compose.yml       # 5 services
```

---

## ✨ Fonctionnalités

### Frontend
- Dashboard avec stats en temps réel
- Investissement par packs (9 niveaux : Starter → Titan)
- Minage de tokens NEX avec paliers et pénalités
- Parrainage sur 3 niveaux avec arbre visuel
- Portefeuille FCFA/tokens avec historique des transactions
- Retraits Mobile Money / Virement bancaire
- Chat général + salons de parrainage
- PWA (Service Worker offline)
- **i18n** : 🇫🇷 Français · 🇬🇧 English · 🇪🇸 Español
- **Multi-devise** : FCFA · USD · EUR · GBP
- Thème clair/sombre
- Administration complète (utilisateurs, investissements, retraits)

### Backend
- API RESTful Sanctum (token expiration 7 jours)
- Vérification email par OTP (6 chiffres, 10 min)
- Réinitialisation mot de passe (frontend URL configurable)
- Paiements : Stripe + Flutterwave + wallet interne
- Calcul automatique des gains hebdomadaires
- Bonus de parrainage immédiats (ProcessReferralBonus)
- Rate limiting sur login/register/forgot-password/retraits
- Middleware de vérification statut compte suspendu
- Canal d'audit dédié (logs/audit-*.log)
- Webhook signature verification (Stripe + Flutterwave)
- Contraintes UNIQUE (mining_logs.user_id/mined_date, otp_codes.user_id/code/type)

---

## 🔧 Configuration

### Variables d'environnement (`.env`)

```env
# Backend
APP_NAME=Nexus Invest
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=nexus_invest
DB_USERNAME=nexus_user
DB_PASSWORD=nexus_secret_2026

STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FLUTTERWAVE_SECRET_KEY=FLWSECK-...
FLUTTERWAVE_WEBHOOK_HASH=...

MAIL_PASSWORD=your-sendgrid-api-key
```

### Variables frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🧪 Tests

```bash
# Backend (93 tests, 402 assertions)
cd nexus-invest-backend
php artisan test

# Frontend (build)
cd nexus-invest-frontend
npm run build     # npx next build --webpack
```

---

## 📚 Documentation API

Spécification OpenAPI 3.0 : `openapi.yaml` (dans le dossier backend)

**44 endpoints couvrant :**
- Auth (10) — register, login, logout, password, verify-email, OTP
- Investissements (5) — CRUD + callback + actifs
- Packs (1) — liste
- Minage (4) — status, validate, history, convert
- Parrainage (3) — index, tree, update-code
- Portefeuille (2) — show, transactions
- Retraits (3) — index, store, cancel
- Chat (3) — rooms, messages, send
- Admin (8) — stats, users, investissements, retraits

Format réponse : `{ success: bool, data: mixed, message: string }`

---

## 🔒 Sécurité

| Mesure | Détail |
|--------|--------|
| CORS | Restreint à FRONTEND_URL |
| CSP | `default-src 'self'` + connect-src API |
| HSTS | `max-age=31536000; includeSubDomains` |
| Rate limiting | Login/Register (5/60s), Retraits (5/60s) |
| MDP | Bcrypt 12 rounds + regex (min 8, 1 maj, 1 min, 1 chiffre) |
| Tokens | Sanctum, expiration 7 jours, supprimés au changement MDP |
| Webhooks | Vérification signature Stripe + Flutterwave |
| Audit trail | Canal dédié (logs/audit-*.log) |
| Wallet | `lockForUpdate()` + `decrement()` atomique |
| OTP | Contrainte UNIQUE, 10 min expiration, rate limit 10/60s |
| Timing attack | `Hash::check()` systématique |

---

## 🐳 Docker

```bash
# Build & start
docker compose build
docker compose up -d

# Arrêt
docker compose down

# Logs
docker compose logs -f backend frontend
```

**Services :** frontend (3000) · backend (9000 PHP-FPM) · nginx (8000) · mysql (3306) · redis (6379)

---

## 📋 Roadmap

- [ ] Clés SendGrid/Stripe/Flutterwave réelles
- [ ] CI/CD (GitHub Actions — workflow prêt dans `.github/`)
- [ ] Tests E2E (Playwright)
- [ ] Tests de charge (k6)
- [ ] Monitoring (Sentry + Grafana)
- [ ] KYC (upload documents, niveaux 1/2)
- [ ] Pages statiques (CGU, confidentialité, mentions légales — déjà créées)
- [ ] Hébergement production

---

## 📄 Licence

MIT — projet privé.
# nexus
