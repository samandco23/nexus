# Audit Complet — Nexus Invest (Laravel 13 + Next.js 16)

**Date :** 24 juillet 2026
**Périmètre :** 44 endpoints API, 72 fichiers frontend, 12 modèles, 9 contrôleurs, 4 services, tests (93 PHPUnit + 6 Vitest)

---

## Résumé Exécutif

| Catégorie | Critiques | Hautes | Moyennes | Faibles | Total |
|-----------|-----------|--------|----------|---------|-------|
| Sécurité | 2 | 4 | 3 | 2 | 11 |
| Performance | 1 | 2 | 3 | 2 | 8 |
| Qualité de code | 0 | 3 | 5 | 4 | 12 |
| DevOps/Conf | 0 | 1 | 2 | 2 | 5 |
| **Total** | **3** | **10** | **13** | **10** | **36** |

---

## 1. PROBLÈMES DE SÉCURITÉ

### 🔴 Critique

#### S-CRIT-01 : Token JWT stocké en localStorage (frontend)
- **Fichier :** `nexus-invest-frontend/src/lib/api-client.ts:21`
- **Description :** Le token Sanctum est stocké dans `localStorage` et envoyé via `Authorization: Bearer`. Vulnérable au vol par XSS.
- **Recommandation :** Migrer vers des cookies HTTP-only via Sanctum SPA. Utiliser `/sanctum/csrf-cookie` et `withCredentials: true`. Supprimer `localStorage` pour les tokens.

#### S-CRIT-02 : Webhook callback sans clés mais acceptant les appels (backend)
- **Fichier :** `nexus-invest-backend/app/Http/Controllers/Api/V1/InvestmentController.php:255-257`
- **Description :** Si les clés webhook Stripe/Flutterwave ne sont pas configurées (`.env`), la méthode `callback()` accepte toutes les requêtes sans vérification de signature — « dev mode ».
- **Recommandation :** En production, retourner systématiquement 401 si les clés webhook ne sont pas configurées. Ne jamais accepter de callback non signé.

### 🟠 Haute

#### S-HIGH-01 : Pas de CSRF protection (frontend)
- **Fichiers :** Tous les appels POST/PUT (api-client.ts)
- **Description :** Aucun token CSRF n'est récupéré depuis `/sanctum/csrf-cookie` avant les requêtes mutatives. Cela rend l'API vulnérable aux attaques CSRF via SPA.
- **Recommandation :** Appeler `GET /sanctum/csrf-cookie` au démarrage de l'application et inclure `X-XSRF-TOKEN` dans chaque requête via l'intercepteur Axios.

#### S-HIGH-02 : Autorisation utilisateur basée sur l'ID dans l'URL (backend)
- **Fichier :** `nexus-invest-backend/app/Http/Controllers/Api/V1/Admin/UserController.php:52`
- **Description :** L'endpoint admin `PUT /admin/users/{user}/toggle-status` ne vérifie pas que l'admin ne se suspend pas lui-même (seulement le dernier admin est protégé). Un admin pourrait suspendre un autre admin sans restriction.
- **Recommandation :** Vérifier que `$request->user()->id` n'est pas égal à l'utilisateur cible.

#### S-HIGH-03 : Information disclosure dans `admin/audit-logs`
- **Fichier :** `nexus-invest-backend/app/Http/Controllers/Api/V1/Admin/DashboardController.php:57`
- **Description :** L'endpoint expose les logs d'audit complets via le filesystem. En cas de déni de service (fichier volumineux) ou d'injection, `file_get_contents` peut saturer la mémoire.
- **Recommandation :** Limiter la taille lue (taille fichier, utiliser `fgets` avec buffer), paginer les logs, ne jamais exposer les logs bruts.

#### S-HIGH-04 : Rétention des tokens Sanctum après changement de mot de passe (backend)
- **Fichier :** `nexus-invest-backend/app/Http/Controllers/Api/V1/AuthController.php:318`
- **Description :** Les tokens sont supprimés, mais il manque un revoke explicite par token. La méthode `$user->tokens()->delete()` est correcte mais le `currentAccessToken()` déjà authentifié pourrait subsister jusqu'à la fin de la requête.
- **Recommandation :** Déconnecter la session en cours en ajoutant `$request->user()->currentAccessToken()->delete()` avant `$user->tokens()->delete()`.

### 🟡 Moyenne

#### S-MED-01 : CSP `'unsafe-inline'` et `'unsafe-eval'` dans Nginx
- **Fichier :** `nginx/default.conf:22`
- **Description :** La CSP autorise `'unsafe-inline'` (XSS potentiel) et `'unsafe-eval'` (exécution de code arbitraire). Faible protection contre les attaques XSS.
- **Recommandation :** Utiliser des nonces ou des hashs pour les scripts inline. Remplacer `'unsafe-eval'` si possible.

#### S-MED-02 : Rate limiting manquant sur plusieurs endpoints sensibles
- **Fichiers :** `nexus-invest-backend/routes/api.php`
- **Description :** Les endpoints `forgot-password`, `reset-password`, `resend-otp` ont du throttling, mais les endpoints `verify-email`, `updateMe`, `chat/send` n'ont pas de rate limiting.
- **Recommandation :** Ajouter `throttle:10,60` sur `verify-email`, `throttle:30,60` sur `chat/send`.

#### S-MED-03 : Données personnelles dans localStorage (frontend)
- **Fichier :** `nexus-invest-frontend/src/app/(auth)/connexion/page.tsx:53`, `inscription/page.tsx:104`
- **Description :** Les données utilisateur (nom, email, téléphone, pays, KYC) sont stockées en JSON dans `localStorage` (`localStorage.setItem('user', JSON.stringify(user))`). Expose des PII.
- **Recommandation :** Stocker seulement les infos non sensibles (nom, rôle) ; le reste doit venir de l'API.

### 🟢 Faible

#### S-LOW-01 : Absence de vérification email dans `updateMe`
- **Fichier :** `nexus-invest-backend/app/Http/Controllers/Api/V1/AuthController.php:276`
- **Description :** `updateMe` ne permet pas de changer l'email (champ non listé). Correct, mais la doc ou le frontend pourrait suggérer le contraire.

#### S-LOW-02 : Script theme-init.js injecte du localStorage dans classList
- **Fichier :** `public/theme-init.js:1`
- **Description :** Le script lit `localStorage.getItem('nexus-ui-store')` et injecte la valeur `theme` dans `document.documentElement.classList`. CSS injection possible.
- **Recommandation :** Valifier que la valeur est strictement `'light'` ou `'dark'`.

---

## 2. PROBLÈMES DE PERFORMANCE

### 🔴 Critique

#### P-CRIT-01 : Polling du chat toutes les 3s
- **Fichier :** `nexus-invest-frontend/src/hooks/use-chat.ts:84-88`
- **Description :** `setInterval` à 3s inconditionnel (même en background). Sur 1000 utilisateurs connectés simultanément, cela génère 20 000 requêtes/minute.
- **Recommandation :** Utiliser WebSockets (Pusher/Laravel Echo) ou SSE. Sinon, utiliser `document.hidden` pour stopper le polling, et passer à 10s minimum en arrière-plan.

### 🟠 Haute

#### P-HIGH-01 : Webhook callback boucle sur les transactions
- **Fichier :** `nexus-invest-backend/app/Http/Controllers/Api/V1/InvestmentController.php:265`
- **Description :** Le callback webhook Stripe/Flutterwave est appelé sur `POST /api/v1/investments/callback` SANS middleware `throttle` configuré. Limité à 10r/s dans Nginx, mais sans limite applicative.
- **Recommandation :** Ajouter un middleware `throttle:10,60` et implémenter un cache Redis pour dédupliquer les callbacks.

#### P-HIGH-02 : N+1 Query potentiel dans PayWeeklyGains
- **Fichier :** `nexus-invest-backend/app/Jobs/PayWeeklyGains.php:25-28`
- **Description :** `Investment::with(['user.wallet', 'pack'])` — mais `pack` est chargé via une relation. Ensuite, chaque itération appelle `$wallet = $investment->user->wallet()->lockForUpdate()`, rechargeant le wallet en base pour chaque investissement.
- **Recommandation :** Récupérer les wallets séparément et les grouper par user_id.

### 🟡 Moyenne

#### P-MED-01 : Pagination sans index composé
- **Fichier :** `nexus-invest-backend/app/Http/Controllers/Api/V1/InvestmentController.php:31-33`
- **Description :** Requêtes fréquentes `WHERE user_id = ? ORDER BY created_at DESC` sans index composé sur `(user_id, created_at)`. Les migrations créent probablement des index séparés.
- **Recommandation :** Ajouter un index composé `INDEX idx_user_created (user_id, created_at)` dans une migration.

#### P-MED-02 : Pas de lazy loading des composants lourds (frontend)
- **Fichier :** Toutes les pages dashboard importent recharts, canvas-confetti, date-fns statiquement.
- **Recommandation :** Utiliser `next/dynamic(() => import('recharts'))` pour le `WalletChart` et les composants lourds.

#### P-MED-03 : IntersectionObserver multiple sur chaque GlassCard
- **Fichier :** `nexus-invest-frontend/src/components/ui/glass-card.tsx:42-58`
- **Description :** Chaque instance crée son propre `IntersectionObserver`. 20 cartes = 20 observateurs.
- **Recommandation :** Utiliser un seul `IntersectionObserver` partagé ou `IntersectionObserver` avec `rootMargin`.

### 🟢 Faible

#### P-LOW-01 : Import * depuis lucide-react
- **Fichier :** `nexus-invest-frontend/src/components/ui/investment-pack-card.tsx:4`
- **Description :** `import * as Icons from 'lucide-react'` importe TOUS les icônes, augmentant le bundle.
- **Recommandation :** Imports nommés uniquement.

#### P-LOW-02 : `after_commit` désactivé dans la config queue
- **Fichier :** `nexus-invest-backend/config/queue.php:44`
- **Description :** `'after_commit' => false` — les jobs sont dispatchés immédiatement, même si la transaction échoue plus tard.
- **Recommandation :** Passer à `'after_commit' => true` pour les jobs financiers (PayWeeklyGains, ProcessReferralBonus).

---

## 3. PROBLÈMES DE QUALITÉ DE CODE

### 🟠 Hautes

#### Q-HIGH-01 : Race condition dans le système de parrainage
- **Fichier :** `nexus-invest-backend/app/Services/ReferralService.php:22-81`
- **Description :** `distributeBonuses()` est appelée dans `DB::transaction` mais les opérations sur `$wallet->fiat_balance` utilisent `+=` au lieu de `increment()`. Aucun `lockForUpdate()` sur le wallet. En cas d'accès concurrent, les bonus peuvent être perdus ou dupliqués.
- **Recommandation :** Remplacer les affectations directes par `$wallet->increment('fiat_balance', $amount)`.

#### Q-HIGH-02 : Gestion d'erreur excessive (try-catch générique)
- **Fichiers :** 44 endpoints API, 100% des méthodes utilisent `catch (\Exception $e)` avec retour 500 générique. Les erreurs réelles sont avalées (pas de `$e->getMessage()` dans la réponse), rendant le debugging difficile en staging.
- **Recommandation :** Ajouter un middleware global qui capture les exceptions et les logge. N'avoir `try-catch` que dans les cas où une gestion spécifique est nécessaire. Le message d'erreur réel doit être loggé.

#### Q-HIGH-03 : Traductions EN et ES incomplètes
- **Fichiers :** `src/lib/i18n/fr.ts` (~462 clés), `en.ts` et `es.ts` (~289 clés chacun, -37%)
- **Description :** 173 clés manquantes par fichier. Les utilisateurs EN/ES verront des textes français partout.
- **Recommandation :** Compléter les fichiers ou implémenter un outil CI qui vérifie la parité des clés.

### 🟡 Moyennes

#### Q-MED-01 : Constantes dupliquées 3×
- **Fichiers :** `historique/page.tsx`, `historique/[id]/page.tsx`, `portefeuille/page.tsx`
- **Description :** `typeIcons`, `typeLabels`, `typeColors`, `statusConfig` définis 3 fois.
- **Recommandation :** Extraire dans `src/lib/constants.ts`.

#### Q-MED-02 : Hardcoded French strings mélangés aux clés i18n
- **Fichiers :** `investir/page.tsx:31`, `investir/[packId]/page.tsx:99`, `chat/page.tsx:168-169`, `parametres/page.tsx:89-257`, `reinitialiser-mot-de-passe/page.tsx:108-171`
- **Description :** ~25 chaînes françaises en dur utilisent `t('texte français')` au lieu d'une clé symbolique.
- **Recommandation :** Ajouter les clés dans les fichiers de traduction et utiliser des clés comme `t('invest.finalize')`.

#### Q-MED-03 : Fichier proxy.ts inutilisé
- **Fichier :** `src/proxy.ts`
- **Description :** Définit une fonction `proxy()` qui n'est jamais importée. Aucun `middleware.ts` à la racine de `src/`.
- **Recommandation :** Soit déplacer dans `src/middleware.ts` pour le proxy API, soit supprimer.

#### Q-MED-04 : Pas d'exposition des schémas Zod
- **Fichiers :** `connexion/page.tsx:15-18`, `inscription/page.tsx:15-33`
- **Recommandation :** Extraire les schémas dans `src/lib/schemas/`.

#### Q-MED-05 : Cache-Control non défini via middleware
- **Fichier :** `AGENTS.md` mentionne un middleware `Cache-Control` mais aucun `middleware.ts` n'existe dans `src/`. Le fichier `src/proxy.ts` n'est pas actif.
- **Recommandation :** Créer `src/middleware.ts` avec les headers Cache-Control.

### 🟢 Faibles

#### Q-LOW-01 : `env('APP_URL')` utilisé sans fallback dans Flutterwave
- **Fichier :** `nexus-invest-backend/app/Services/PaymentGatewayService.php:124`
- **Description :** `config('app.url') . '/api/v1/investments/callback'` peut pointer vers `localhost` si APP_URL mal configuré en production.
- **Recommandation :** Utiliser une config dédiée `services.flutterwave.redirect_url`.

#### Q-LOW-02 : `uniqid()` pour tx_ref Flutterwave
- **Fichier :** `nexus-invest-backend/app/Services/PaymentGatewayService.php:121`
- **Description :** `uniqid()` est basé sur le timestamp et peut générer des collisions.
- **Recommandation :** Utiliser `Str::uuid()` ou `Str::random(32)`.

#### Q-LOW-03 : Champs `client_secret` et `payment_link` exposés en clair
- **Fichier :** `nexus-invest-backend/app/Http/Controllers/Api/V1/InvestmentController.php:175-178, 210-213`
- **Description :** Le `client_secret` Stripe est renvoyé côté client (normal) mais aussi stocké en base dans `transaction.metadata`.
- **Recommandation :** Utiliser une colonne dédiée cryptée ou ne pas stocker le `client_secret`.

#### Q-LOW-04 : Pas de validation des contraintes uniques composites
- **Fichiers de migration :** `*_create_mining_logs_table.php`, `*_create_otp_codes_table.php`
- **Description :** La contrainte UNIQUE sur `(user_id, mined_date)` dans mining_logs et `(user_id, code, type)` dans otp_codes existe mais pourrait être renforcée.
- **Recommandation :** Vérifier que les index uniques sont bien créés dans les migrations.

---

## 4. CONFIGURATION & DEVOPS

### 🟠 Haute

#### D-HIGH-01 : .env.example contient des clés API "dummy" commitées
- **Fichier :** `.env` (et potentiellement `.env.example`)
- **Description :** Les clés Stripe `sk_test_xxxxxxxxxxxxx`, Flutterwave `FLWPUBK-xxxxxxxxxxxxx`, SendGrid API key sont présentes. Même si ce sont des valeurs factices, cela encourage les mauvaises pratiques. Les clés réelles risquent d'être commitées.
- **Recommandation :** Ajouter `*.env` à `.gitignore` (déjà fait), mais aussi supprimer les clés factices de `.env.example` ou les remplacer par des commentaires.

### 🟡 Moyenne

#### D-MED-01 : Ressources CPU/memory limites basses en production
- **Fichier :** `docker-compose.yml:23-27`
- **Description :** Frontend limité à 512M RAM / 1 CPU, backend à 512M RAM / 1 CPU pour du PHP + Laravel + queue worker en production.
- **Recommandation :** Augmenter backend à 1G RAM / 2 CPU en production, surtout si le queue worker tourne dans le même container.

#### D-MED-02 : Pas de healthcheck backend/health dédié
- **Fichier :** `docker-compose.yml:48`
- **Description :** Nginx utilise `curl --fail http://localhost:8000/up`. L'endpoint `/up` est généré par Laravel (fichier `public/up`) mais il n'y a pas d'endpoint `/health` dédié.
- **Recommandation :** L'endpoint `GET /api/v1/health` existe dans les routes, utiliser celui-ci pour le healthcheck.

### 🟢 Faible

#### D-LOW-01 : `mysql:8.4` sans volume de backup
- **Fichier :** `docker-compose.yml`
- **Description :** Le volume mysql-data n'est pas sauvegardé automatiquement.
- **Recommandation :** Ajouter un cron job de dump SQL quotidien.

#### D-LOW-02 : Pas de monitoring des jobs échoués
- **Fichier :** `config/queue.php`
- **Description :** `'failed' => ['driver' => 'database-uuids']` stocke les jobs échoués en base mais aucune notification/alerte n'est configurée.
- **Recommandation :** Ajouter une notification email quand un job échoue (ex: via `App\Notifications\JobFailed`).

---

## 5. POINTS FORTS

### Backend
- **Transactions DB + locks :** Toutes les opérations financières utilisent `DB::transaction` avec `lockForUpdate()` — wallet, withdrawal, callback
- **Piste d'audit :** Canal `audit` daily avec 90 jours de rétention, utilisé systématiquement pour les opérations sensibles
- **Timing attack protection :** `Hash::check()` toujours appelée même si email non trouvé (`AuthController.php:184-186`)
- **Validation robuste :** Règles de mot de passe strictes (8+ chars, maj, min, chiffre), validation côté serveur complète
- **Modèle Wallet auto-créé :** Pas de création manuelle possible (event `created`)
- **Pagination systématique :** Tous les endpoints de liste utilisent `paginate()`
- **93 tests PHPUnit :** Couverture complète de l'API
- **Rate limiting Nginx :** Login (5r/m), API (30r/s), webhook (10r/s)

### Frontend
- **Architecture Next.js App Router :** Organisation claire par groupes de routes `(auth)`, `(dashboard)`, `(landing)`...
- **TypeScript strict :** `strict: true` dans `tsconfig.json`
- **Validation Zod :** Tous les formulaires validés côté client
- **Gestion d'état :** 3 états systématiques (loading, error, data) via hooks personnalisés
- **PWA :** Service worker complet avec fallback offline
- **SEO :** Sitemap, robots.txt, metadata Next.js complète, OpenGraph
- **Déconnexion robuste :** Même si l'appel API échoue, le logout local s'exécute
- **Intercepteur Axios :** Retry automatique (408, 429, 500, 502, 503, 504) avec backoff
- **Thème sans flash :** theme-init.js en `beforeInteractive`

---

## 6. RECOMMANDATIONS PRIORITAIRES

### 🔴 Faire immédiatement

1. **S-CRIT-01** → Migrer les tokens du localStorage vers des cookies HTTP-only via Sanctum SPA
2. **S-CRIT-02** → Bloquer les callbacks webhook non signés (retourner 401 si clés non configurées)
3. **P-CRIT-01** → Remplacer le polling REST du chat par WebSockets (Pusher ou SSE)

### 🟠 Faire rapidement (sprint en cours)

4. **S-HIGH-01** → Ajouter le CSRF token via `GET /sanctum/csrf-cookie` au démarrage
5. **S-HIGH-04** → Revoke explicite du token courant après changement de mot de passe
6. **Q-HIGH-01** → Remplacer `+=` par `increment()` dans ReferralService avec `lockForUpdate()`
7. **Q-HIGH-03** → Compléter les fichiers de traduction EN et ES (173 clés manquantes chacun)
8. **D-HIGH-01** → Nettoyer les clés API factices du `.env` et `.env.example`
9. **Q-HIGH-02** → Implémenter un middleware global d'exception au lieu de 44 try-catch redondants

### 🟡 Faire cette semaine

10. **S-MED-01** → Renforcer la CSP (nonces, retirer `unsafe-eval`)
11. **S-MED-02** → Ajouter rate limiting sur `verify-email`, `chat/send`
12. **S-MED-03** → Supprimer les PII du localStorage
13. **P-HIGH-02** → Optimiser PayWeeklyGains (requêtes en lot)
14. **P-MED-01** → Index composé `(user_id, created_at)` sur investments
15. **Q-MED-01** → Centraliser les constantes dans `src/lib/constants.ts`
16. **Q-MED-02** → Remplacer les ~25 chaînes françaises en dur par des clés i18n
17. **P-MED-02** → Ajouter `next/dynamic` pour recharts, canvas-confetti

### 🟢 Faire ce mois-ci

18. **P-MED-03** → Mutualiser les IntersectionObserver
19. **Q-MED-03** → Supprimer ou activer `proxy.ts`
20. **Q-MED-04** → Extraire les schémas Zod dans `src/lib/schemas/`
21. **D-MED-02** → Healthcheck sur `/api/v1/health` au lieu de `/up`
22. **D-MED-01** → Ajuster les limites mémoire Docker pour le backend

---

## 7. STATISTIQUES CLÉS

| Métrique | Valeur |
|----------|--------|
| Endpoints API | 44 (dont 9 admin) |
| Pages frontend | 19 |
| Composants UI | 10 |
| Hooks custom | 7 |
| Stores Zustand | 2 (i18n, ?) |
| Tests PHPUnit | 93 |
| Tests Vitest | 6 |
| Traductions FR | 462 clés |
| Traductions EN | 289 clés (-37%) |
| Traductions ES | 289 clés (-37%) |
| Modèles | 12 |
| Migrations | 18 |
| Services | 4 (Currency, Mining, PaymentGateway, Referral) |
| Middleware | 2 (Admin, CheckUserStatus) |
| Jobs | 2 (PayWeeklyGains, ProcessReferralBonus) |
| Notifications | 4 |
| Conteneurs Docker | 5 |
| Fichiers scannés | ~84 (backend) + ~72 (frontend) |

---

*Fin du rapport. 36 points d'attention identifiés, dont 3 critiques et 10 hautes priorités.*
