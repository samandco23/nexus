import type { Metadata } from 'next';
import { Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
};

const sections = [
  {
    title: '1. Introduction et responsable du traitement',
    content: `La présente Politique de Confidentialité (ci-après la "Politique") décrit la manière dont Nexus Invest SARL, société de droit ivoirien immatriculée au RCCM d'Abidjan sous le numéro CI-ABJ-2026-B-12345, dont le siège social est situé à Abidjan, Cocody, Côte d'Ivoire, collecte, utilise, stocke, partage et protège les données à caractère personnel des Utilisateurs de sa plateforme d'investissement accessible à l'adresse https://nexusinvest.com (ci-après la "Plateforme"). Nexus Invest SARL agit en qualité de responsable de traitement au sens du Règlement Général sur la Protection des Données (RGPD) (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016, ainsi que de la loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel en Côte d'Ivoire. La présente Politique s'applique à toutes les données à caractère personnel collectées via la Plateforme, les communications électroniques (email, chat, formulaire de contact), les cookies et technologies de suivi, ainsi que les interactions avec le support client. Elle s'applique également aux données collectées lors de l'utilisation de services tiers intégrés à la Plateforme (paiement Stripe/Flutterwave, Google reCAPTCHA, SendGrid). Nexus Invest s'engage à traiter les données personnelles conformément aux principes de licéité, loyauté, transparence, minimisation, exactitude, limitation de conservation, intégrité, confidentialité et responsabilité.`,
  },
  {
    title: '2. Identité et coordonnées du responsable de traitement',
    content: [
      'Raison sociale : Nexus Invest SARL',
      'Forme juridique : Société à Responsabilité Limitée',
      'Capital social : 10 000 000 FCFA',
      'Siège social : Abidjan, Cocody, Côte d\'Ivoire',
      'RCCM : CI-ABJ-2026-B-12345',
      'Numéro fiscal : 1234567P',
      'Email DPO : dpo@nexusinvest.com',
      'Email support : support@nexusinvest.com',
      'Téléphone : +225 01 02 03 04 05',
      'Adresse postale : Nexus Invest SARL, 01 BP 1234 Abidjan 01, Côte d\'Ivoire',
      'Représentant UE (conformité RGPD) : NexData Europe GmbH, Marienstraße 23, 10117 Berlin, Allemagne. Email : eu-rep@nexusinvest.com',
    ],
  },
  {
    title: '3. Catégories de données collectées - Description détaillée',
    content: `Dans le cadre de l'utilisation de la Plateforme, Nexus Invest collecte les catégories de données suivantes :

A. Données d'identification et d'inscription (fournies volontairement par l'Utilisateur) : nom, prénom, adresse email, numéro de téléphone, pays de résidence, code de parrainage, mot de passe (chiffré), pièce d'identité (passeport, carte d'identité nationale, permis de conduire) dans le cadre de la vérification KYC, justificatif de domicile, date de naissance, sexe, nationalité, profession, photographie d'identité.

B. Données de transaction et financières : montants investis, packs souscrits, durée des investissements, rendements perçus, historique des transactions (dépôts, retraits, conversions), soldes des comptes, méthodes de paiement utilisées, identifiants de transaction Stripe/Flutterwave, numéros de compte bancaire ou Mobile Money, IBAN, BIC/SWIFT, nom du titulaire du compte.

C. Données de connexion et techniques (collectées automatiquement) : adresse IP (conservée de manière pseudonymisée), type et version de navigateur, système d'exploitation, résolution d'écran, langues préférées du navigateur, pages visitées sur la Plateforme, date et heure de visite, durée de la session, URL de provenance (referrer), identifiant d'appareil mobile, empreinte numérique du navigateur (browser fingerprint), cookies et identifiants de session, logs serveur incluant les requêtes HTTP.

D. Données d'utilisation et de préférences : préférences de compte (langue, devise, thème clair/sombre), paramètres de notification (email, SMS, push), historique de navigation sur la Plateforme, interactions avec les fonctionnalités (clics, téléchargements, visualisations), réponses aux enquêtes de satisfaction, participation aux programmes de parrainage.

E. Données de communication : messages échangés via le système de chat intégré, tickets de support, correspondance email, enregistrements téléphoniques (le cas échéant, avec consentement préalable), échanges avec le service client, commentaires et avis laissés sur la Plateforme.

F. Données de géolocalisation : adresse IP permettant une localisation approximative au niveau du pays ou de la ville (géolocalisation IP). Aucune donnée de géolocalisation GPS précise n'est collectée sans consentement explicite.

G. Données de sécurité : historique des connexions, tentatives de connexion échouées, réinitialisations de mot de passe, blocages de compte, logs d'accès administrateur, données de validation CAPTCHA (Google reCAPTCHA), détection d'anomalies et de fraudes.`,
  },
  {
    title: '4. Modalités de collecte des données',
    content: `Les données personnelles sont collectées selon les modalités suivantes :

(1) Collecte directe : lors de l'inscription sur la Plateforme (formulaire d'inscription), lors de la souscription à un pack d'investissement, lors d'un dépôt ou retrait de fonds, lors de l'utilisation du système de chat, lors de la soumission d'un ticket de support, lors de la participation au programme de parrainage, lors de la modification des préférences de compte, lors de la soumission de documents KYC.

(2) Collecte automatique : lors de la navigation sur la Plateforme via des cookies, pixels espions, balises web et autres technologies de suivi, lors de l'interaction avec les emails transactionnels (ouverture, clics), via les logs serveur, via les empreintes numériques d'appareil.

(3) Collecte via des tiers : informations de transaction fournies par Stripe et Flutterwave (identifiants de paiement, statut, montant), validation CAPTCHA fournie par Google reCAPTCHA (adresse IP, comportement de navigation), données d'emailing fournies par SendGrid (délivrabilité, ouvertures, clics), données analytiques fournies par des services de mesure d'audience.

(4) Collecte indirecte : lors de l'utilisation d'un code de parrainage (le parrain est informé que le filleul a utilisé son code), via des sources accessibles au public (registres du commerce, annuaires professionnels) dans le cadre de la vérification KYC.

Le caractère obligatoire ou facultatif de la fourniture des données est indiqué au moment de la collecte. Les données marquées comme obligatoires sont nécessaires à la fourniture des services. Le défaut de fourniture de ces données peut entraîner l'impossibilité de créer un compte ou d'utiliser certains services.`,
  },
  {
    title: '5. Base légale des traitements',
    content: `Conformément à l'article 6 du RGPD, les traitements de données effectués par Nexus Invest reposent sur les bases légales suivantes :

A. Exécution du contrat (article 6.1.b) : création et gestion du compte Utilisateur, exécution des services d'investissement, traitement des dépôts et retraits, gestion du système de parrainage, distribution des gains et bonus, envoi des notifications transactionnelles (confirmation d'investissement, notification de retrait, alertes de sécurité).

B. Consentement (article 6.1.a) : dépôt de cookies non essentiels, envoi de communications marketing et promotionnelles, participation à des enquêtes de satisfaction, collecte de données de géolocalisation précise, partage de données avec des partenaires commerciaux, utilisation de données pour la personnalisation avancée.

C. Obligation légale (article 6.1.c) : conservation des données financières et comptables (10 ans), déclarations aux autorités fiscales et réglementaires, lutte anti-blanchiment et financement du terrorisme (LAB/FT), réponse aux demandes des autorités judiciaires, respect des obligations KYC, déclarations à la CENTIF.

D. Intérêt légitime (article 6.1.f) : prévention de la fraude et des abus, sécurisation de la Plateforme et des transactions, amélioration et optimisation des services, analyse statistique et mesure d'audience, gestion des litiges et contentieux, prospection de clientèle similaire (avec droit d'opposition), formation du personnel à partir des interactions support.

L'Utilisateur peut à tout moment retirer son consentement, s'opposer à un traitement fondé sur l'intérêt légitime, ou demander la limitation d'un traitement, sous réserve des obligations légales de conservation.`,
  },
  {
    title: '6. Finalités du traitement - Liste exhaustive',
    content: [
      'Création, gestion et sécurisation du compte Utilisateur : inscription, authentification, gestion de session, récupération de mot de passe, notifications de sécurité.',
      'Exécution des services d\'investissement : souscription aux packs, traitement des investissements, calcul et distribution des rendements, gestion des échéances, conversion des gains.',
      'Traitement des transactions financières : dépôts, retraits, conversions de tokens, virements, remboursements, gestion des frais.',
      'Lutte contre la fraude et sécurisation de la Plateforme : détection des connexions suspectes, analyse comportementale, vérification CAPTCHA, blocage des comptes frauduleux, enquêtes internes.',
      'Respect des obligations légales et réglementaires : KYC (Know Your Customer), LAB/FT, déclarations fiscales, conservation des données, réponse aux réquisitions judiciaires.',
      'Communication et support client : réponse aux demandes d\'assistance, gestion des réclamations, information sur les modifications de service, notifications transactionnelles.',
      'Marketing et prospection commerciale (avec consentement) : envoi d\'offres promotionnelles, newsletter, alertes sur nouveaux produits, invitations à des événements, enquêtes de satisfaction.',
      'Amélioration et optimisation de la Plateforme : analyse d\'utilisation, tests A/B, études de performance, développement de nouvelles fonctionnalités, correction de bugs.',
      'Personnalisation de l\'expérience utilisateur : adaptation de la langue et de la devise, recommandations de packs, historique personnalisé, interface adaptée au profil.',
      'Gestion du programme de parrainage : attribution des codes, suivi des filleuls, calcul et distribution des commissions, affichage de l\'arbre de parrainage.',
      'Gestion des litiges et contentieux : médiation, procédures judiciaires, recouvrement de créances, conservation des preuves.',
      'Fiscalité et comptabilité : facturation, déclarations fiscales, audits comptables, obligations des autorités fiscales.',
      'Sécurité des systèmes d\'information : surveillance des accès, détection d\'intrusion, gestion des vulnérabilités, sauvegardes, plan de continuité.',
    ],
  },
  {
    title: '7. Destinataires des données et sous-traitants',
    content: `Les données personnelles collectées sont destinées aux services internes habilités de Nexus Invest SARL (équipes technique, support client, conformité, juridique, comptabilité). L'accès aux données est strictement limité aux personnes qui en ont besoin dans le cadre de leurs fonctions, sur la base du principe du moindre privilège. Les données peuvent également être communiquées aux catégories de destinataires suivantes :

A. Sous-traitants techniques : Scaleway SA (hébergement et infrastructure, France), SendGrid / Twilio (envoi d'emails transactionnels, États-Unis), Stripe Inc. (paiement par carte bancaire, États-Unis/Irlande), Flutterwave Inc. (paiement Mobile Money, Nigeria/États-Unis), Google LLC (reCAPTCHA et services analytiques, États-Unis).

B. Partenaires financiers : banques partenaires pour les virements bancaires, opérateurs de Mobile Money (Orange Money, MTN Money, Moov Money), prestataires de services de paiement.

C. Autorités légales et réglementaires : autorités judiciaires sur réquisition, CENTIF (Cellule Nationale de Traitement des Informations Financières), administration fiscale, autorités de protection des données (CNIL, ARTCI).

D. Prestataires professionnels : experts-comptables, commissaires aux comptes, conseils juridiques, assurances, huissiers de justice.

Chaque destinataire n'a accès qu'aux données strictement nécessaires à l'accomplissement de sa mission. Les sous-traitants sont contractuellement tenus de respecter des obligations de confidentialité, de sécurité et de conformité au RGPD équivalentes à celles de Nexus Invest. Les transferts de données vers des pays tiers (hors UE) sont encadrés par des clauses contractuelles types (CCT) approuvées par la Commission Européenne ou par des décisions d'adéquation.`,
  },
  {
    title: '8. Transferts internationaux de données',
    content: `Certaines données personnelles peuvent être transférées vers des pays situés en dehors de l'Espace Économique Européen (EEE), notamment vers les États-Unis (hébergement de services complémentaires, services de paiement, services d'emailing). Ces transferts sont encadrés par les garanties appropriées suivantes :

(1) Clauses Contractuelles Types (CCT) adoptées par la Commission Européenne (décision d'exécution 2021/914 du 4 juin 2021), signées entre Nexus Invest et ses sous-traitants concernés.

(2) Décision d'adéquation de la Commission Européenne pour les transferts vers des pays reconnus comme offrant un niveau de protection adéquat.

(3) Pour les transferts vers les États-Unis : certification Data Privacy Framework (DPF) le cas échéant, ou application des CCT.

(4) Pour les transferts vers des pays africains : application des dispositions de l'Acte Uniforme OHADA et des lois nationales de protection des données.

L'Utilisateur peut obtenir une copie des garanties applicables en contactant le DPO à dpo@nexusinvest.com. Nexus Invest s'engage à ne transférer aucune donnée vers un pays tiers sans garanties appropriées. Les données sont principalement hébergées dans l'Union Européenne (datacenters Scaleway à Paris, France).`,
  },
  {
    title: '9. Durée de conservation des données - Tableau détaillé',
    content: `Les données personnelles sont conservées pour des durées limitées en fonction de leur nature et des obligations légales applicables :

A. Données de compte (nom, email, téléphone, mot de passe) : durée de vie du compte actif. En cas d'inactivité de 3 ans, le compte est considéré comme inactif et les données sont archivées. Après suppression du compte, les données sont conservées 3 ans à des fins probatoires (prescription civile), puis supprimées ou anonymisées.

B. Données financières et transactions (montants, méthodes de paiement, historiques) : 10 ans à compter de la fin de l'exercice comptable (obligation légale de conservation des documents comptables - article L123-22 du Code de commerce et droit OHADA).

C. Documents KYC et pièces d'identité : 5 ans après la clôture du compte (obligation LAB/FT), puis suppression sécurisée.

D. Logs de connexion et données techniques (IP, user-agent) : 1 an (intérêt légitime de sécurité), puis anonymisation.

E. Cookies et traceurs : cookies strictement nécessaires (session), cookies fonctionnels (1 an), cookies analytiques (13 mois maximum).

F. Communications support et chat : 3 ans après la résolution du ticket ou le dernier échange.

G. Données de parrainage : durée de vie du compte + 3 ans après clôture.

H. Données de prospection commerciale : 3 ans après le dernier contact (droit d'opposition applicable à tout moment).

I. Enregistrements téléphoniques : 6 mois (avec consentement).

J. Données de cookies et préférences de consentement : durée de validité du consentement + 1 an.

À l'issue de ces durées, les données sont soit définitivement supprimées de manière sécurisée (effacement cryptographique), soit anonymisées de façon irréversible. L'anonymisation est effectuée selon des méthodes conformes à l'avis 05/2014 du CEPD.`,
  },
  {
    title: '10. Droits des Utilisateurs - Guide détaillé d\'exercice',
    content: `Conformément aux articles 15 à 22 du RGPD, l'Utilisateur dispose des droits suivants sur ses données personnelles :

(1) Droit d'accès (article 15 RGPD) : l'Utilisateur peut obtenir la confirmation que ses données sont ou non traitées, et, lorsqu'elles le sont, l'accès auxdites données ainsi qu'aux informations suivantes : finalités du traitement, catégories de données, destinataires, durée de conservation, existence de droits de rectification/effacement/limitation/opposition, droit d'introduire une réclamation auprès d'une autorité de contrôle, source des données si elles ne sont pas collectées directement, existence d'une prise de décision automatisée. Une copie des données est fournie gratuitement (des frais raisonnables peuvent être facturés pour des copies supplémentaires).

(2) Droit de rectification (article 16 RGPD) : l'Utilisateur peut demander la correction de données inexactes ou le complément de données incomplètes, en fournissant les justificatifs nécessaires.

(3) Droit à l'effacement / droit à l'oubli (article 17 RGPD) : l'Utilisateur peut demander la suppression de ses données lorsque : les données ne sont plus nécessaires aux finalités, le consentement est retiré, opposition légitime, traitement illicite, obligation légale de suppression. Ce droit est limité lorsque le traitement est nécessaire au respect d'une obligation légale (conservation financière 10 ans) ou à la constatation/exercice/défense de droits en justice.

(4) Droit à la limitation du traitement (article 18 RGPD) : l'Utilisateur peut demander le gel temporaire du traitement de ses données en cas de contestation de l'exactitude, de caractère illicite du traitement, d'opposition, ou de besoin de conservation pour l'exercice de droits en justice.

(5) Droit à la portabilité des données (article 20 RGPD) : l'Utilisateur peut recevoir ses données dans un format structuré, couramment utilisé et lisible par machine (JSON ou CSV), et peut demander la transmission directe à un autre responsable de traitement lorsque cela est techniquement possible.

(6) Droit d'opposition (article 21 RGPD) : l'Utilisateur peut s'opposer à tout moment au traitement de ses données à des fins de prospection commerciale (y compris le profilage). Pour les traitements fondés sur l'intérêt légitime, l'Utilisateur peut s'opposer moyennant des motifs tenant à sa situation particulière.

(7) Droit de ne pas faire l'objet d'une décision automatisée (article 22 RGPD) : l'Utilisateur peut demander une intervention humaine pour toute décision individuelle automatisée, notamment en matière de détection de fraude.

(8) Droit de retirer son consentement à tout moment, sans porter atteinte à la licéité du traitement fondé sur le consentement effectué avant le retrait.

(9) Droit d'introduire une réclamation auprès d'une autorité de contrôle : CNIL en France (https://www.cnil.fr), ARTCI en Côte d'Ivoire (https://www.artci.ci), ou l'autorité de protection des données compétente du pays de résidence.

Pour exercer ces droits, l'Utilisateur peut : (i) utiliser les fonctionnalités dédiées dans son espace personnel (export de données, modification de profil) ; (ii) contacter le DPO par email à dpo@nexusinvest.com ; (iii) envoyer un courrier à Nexus Invest SARL, 01 BP 1234 Abidjan 01, Côte d'Ivoire. Toute demande doit être accompagnée d'une pièce d'identité et contenir les informations nécessaires à son traitement. Nexus Invest s'engage à répondre sous un mois maximum (deux mois en cas de demande complexe).`,
  },
  {
    title: '11. Procédure d\'exercice des droits et réponse',
    content: `Nexus Invest a mis en place une procédure interne pour traiter les demandes d'exercice des droits dans les meilleurs délais. La procédure est la suivante :

Étape 1 - Réception de la demande : la demande est reçue par email (dpo@nexusinvest.com) ou par courrier postal. Un accusé de réception est envoyé sous 2 jours ouvrés.

Étape 2 - Vérification de l'identité : Nexus Invest peut demander la communication d'une pièce d'identité en cours de validité pour vérifier l'identité du demandeur. La pièce d'identité est conservée le temps nécessaire à la vérification, puis supprimée.

Étape 3 - Analyse de la demande : le DPO analyse la demande au regard des dispositions du RGPD et des obligations légales applicables. Si la demande est complexe ou concerne des données conservées pour des motifs légaux, une analyse juridique approfondie est réalisée.

Étape 4 - Traitement de la demande : Nexus Invest procède à l'opération demandée (accès, rectification, effacement, limitation, portabilité, opposition) dans les limits légales.

Étape 5 - Information du demandeur : Nexus Invest informe le demandeur des mesures prises dans un délai maximum d'un mois (prolongeable à deux mois pour les demandes complexes, avec information du demandeur).

Étape 6 - Refus motivé : en cas de refus de faire droit à la demande (notamment pour motif légal), Nexus Invest fournit une réponse motivée indiquant les raisons du refus et les voies de recours disponibles.

Étape 7 - Registre des demandes : toutes les demandes sont enregistrées dans un registre interne des demandes de droits, incluant la date, la nature de la demande, la réponse apportée et la date de clôture.

Nexus Invest s'engage à répondre gratuitement à toutes les demandes. Des frais raisonnables peuvent être facturés en cas de demandes manifestement infondées, excessives ou répétitives (article 12.5 RGPD).`,
  },
  {
    title: '12. Cookies et technologies de suivi - Description détaillée',
    content: `La Plateforme utilise différentes technologies de suivi pour assurer son fonctionnement, améliorer l'expérience utilisateur et réaliser des analyses statistiques. Un cookie est un petit fichier texte déposé sur le terminal (ordinateur, smartphone, tablette) de l'Utilisateur lors de la visite de la Plateforme. Les cookies ne causent pas de dommages et ne contiennent pas de virus.

A. Cookies strictement nécessaires (exemptés de consentement) : ces cookies sont essentiels au fonctionnement de la Plateforme et ne peuvent pas être désactivés dans nos systèmes. Ils permettent la navigation, l'authentification, la protection CSRF et la gestion de session. Sans ces cookies, la Plateforme ne peut pas fonctionner correctement.

B. Cookies fonctionnels : ces cookies permettent à la Plateforme de mémoriser les choix de l'Utilisateur (langue, devise, thème d'affichage) afin de fournir une expérience personnalisée. Ils ne collectent aucune donnée personnelle à des fins de suivi.

C. Cookies analytiques et de performance : ces cookies collectent des informations anonymes sur la façon dont les Utilisateurs utilisent la Plateforme : pages visitées, durée de visite, taux de rebond, origine du trafic. Ces données sont utilisées pour améliorer les performances et l'ergonomie du site.

D. Cookies tiers : la Plateforme utilise Google reCAPTCHA pour la protection anti-bot. Ce service peut déposer des cookies Google et collecter des données (adresse IP, comportement de navigation) conformément à la politique de confidentialité de Google (https://policies.google.com/privacy). Les services de paiement Stripe et Flutterwave peuvent également déposer des cookies nécessaires au traitement des transactions.

E. Technologies assimilées : la Plateforme utilise également le localStorage et le sessionStorage du navigateur pour stocker les tokens d'authentification (sessionStorage) et les préférences (localStorage). Ces données ne sont pas automatiquement transmises aux serveurs. La Plateforme utilise des pixels de suivi dans les emails transactionnels pour mesurer les taux d'ouverture et de clics.

Liste exhaustive des cookies utilisés, leur finalité, leur durée de conservation et leur caractère propriétaire/tiers est disponible sur demande auprès du DPO.`,
  },
  {
    title: '13. Sécurité des données - Mesures techniques et organisationnelles',
    content: `Nexus Invest met en œuvre un ensemble de mesures techniques et organisationnelles conformes à l'état de l'art et aux recommandations de l'ENISA (European Union Agency for Cybersecurity) et de l'ANSSI (Agence Nationale de la Sécurité des Systèmes d'Information) pour protéger les données personnelles contre tout accès non autorisé, altération, divulgation, destruction ou perte accidentelle.

Mesures techniques : (a) chiffrement SSL/TLS (TLS 1.3 minimum) pour toutes les communications entre le client et le serveur, avec certificats renouvelés automatiquement ; (b) chiffrement AES-256-GCM pour les données sensibles au repos (bases de données, sauvegardes) ; (c) hachage bcrypt (12 rounds) pour les mots de passe ; (d) tokens d'authentification Sanctum avec expiration à 7 jours ; (e) pare-feu applicatif (WAF) avec règles OWASP Top 10 ; (f) système de détection d'intrusion (IDS) et système de prévention d'intrusion (IPS) ; (g) segmentation réseau avec zones DMZ, zones applicatives et zones de données isolées ; (h) sauvegardes chiffrées quotidiennes avec rétention de 30 jours et sauvegardes hebdomadaires avec rétention de 12 mois ; (i) gestion centralisée des logs (SIEM) avec corrélation d'événements ; (j) authentification multi-facteurs (MFA) pour l'accès à l'administration ; (k) rate limiting et protection contre les attaques par force brute ; (l) headers de sécurité HTTP (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) ; (m) mises à jour de sécurité appliquées dans les 48 heures suivant leur publication ; (n) tests d'intrusion externes réalisés au minimum une fois par an.

Mesures organisationnelles : (a) politique de protection des données et de sécurité des systèmes d'information formalisée ; (b) nomination d'un Délégué à la Protection des Données (DPO) ; (c) registre des activités de traitement tenu à jour ; (d) analyses d'impact relatives à la protection des données (AIPD) réalisées pour les traitements à risque ; (e) formation obligatoire du personnel à la protection des données et à la cybersécurité ; (f) clauses de confidentialité et de conformité RGPD dans les contrats des sous-traitants ; (g) gestion des incidents de sécurité avec procédure de notification (72h) ; (h) principe de minimisation des données appliqué par défaut (data minimization by design) ; (i) revue périodique des accès aux données ; (j) procédure d'exercice des droits des personnes formalisée.`,
  },
  {
    title: '14. Notification des violations de données',
    content: `En cas de violation de données à caractère personnel susceptible d'engendrer un risque pour les droits et libertés des personnes physiques, Nexus Invest s'engage à respecter les obligations de notification suivantes, conformément aux articles 33 et 34 du RGPD :

(1) Notification à l'autorité de contrôle : Nexus Invest notifie la violation à l'autorité de contrôle compétente (CNIL ou ARTCI) dans les 72 heures suivant sa découverte, sauf si la violation n'est pas susceptible d'engendrer un risque pour les droits et libertés. La notification inclut : la nature de la violation, les catégories et nombre de personnes concernées, les coordonnées du DPO, les conséquences probables, les mesures prises ou envisagées.

(2) Communication à la personne concernée : lorsque la violation est susceptible d'engendrer un risque élevé pour les droits et libertés, Nexus Invest communique la violation à la personne concernée sans retard excessif, en décrivant la nature de la violation et en fournissant des conseils pour atténuer les effets négatifs potentiels.

(3) Registre des violations : Nexus Invest tient un registre interne de toutes les violations de données, incluant les faits, les effets et les mesures correctives prises.

(4) Analyse post-incident : après chaque incident, une analyse approfondie est réalisée pour déterminer les causes racines et mettre en œuvre les mesures correctives afin d'éviter la récurrence.

(5) Information des sous-traitants : en cas de violation chez un sous-traitant, celui-ci est contractuellement tenu d'informer Nexus Invest dans les meilleurs délais, et au plus tard dans les 24 heures suivant la découverte.`,
  },
  {
    title: '15. Données des mineurs',
    content: `La Plateforme est destinée exclusivement aux personnes majeures (18 ans ou plus). Nexus Invest ne collecte pas sciemment de données personnelles de personnes mineures. Si un parent ou tuteur légal découvre que son enfant mineur a fourni des données personnelles sans son consentement, il est invité à contacter immédiatement le DPO à dpo@nexusinvest.com. Nexus Invest s'engage à supprimer toutes les données personnelles d'un mineur dès qu'il en a connaissance, sans délai, sauf obligation légale de conservation contraire.

Conformément à l'article 8 du RGPD, pour les mineurs de moins de 16 ans, le consentement au traitement des données doit être donné ou autorisé par le titulaire de l'autorité parentale. Nexus Invest ne traite pas les données des mineurs et n'utilise pas de mécanismes de collecte de consentement parental. En cas de doute sur l'âge de l'Utilisateur, Nexus Invest se réserve le droit de demander un justificatif d'identité.`,
  },
  {
    title: '16. Prise de décision automatisée et profilage',
    content: `Nexus Invest utilise des mécanismes de traitement automatisé et de profilage pour les finalités suivantes :

(1) Détection et prévention de la fraude : analyse automatisée des comportements suspects (connexions depuis des IP inhabituelles, tentatives de connexion multiples, schémas de transaction anormaux). En cas de détection d'une activité suspecte, le compte peut être temporairement bloqué et une vérification manuelle est effectuée par l'équipe conformité.

(2) Notation de risque (scoring) : attribution d'un score de risque basé sur le profil de l'Utilisateur, son historique de transactions, son comportement de navigation. Ce score peut influencer les limites de transaction, les contrôles de sécurité applicables et la fréquence des vérifications KYC.

(3) Recommandations de packs : suggestion automatisée de packs d'investissement basée sur le profil d'investissement de l'Utilisateur (montant disponible, historique, préférences). L'Utilisateur reste libre de choisir le pack de son choix.

(4) Vérification KYC automatisée : analyse automatisée des documents d'identité fournis (vérification de l'authenticité, comparaison avec la photographie). En cas de doute, une vérification manuelle est effectuée.

L'Utilisateur dispose du droit d'obtenir une intervention humaine de la part de Nexus Invest, d'exprimer son point de vue et de contester la décision automatisée, conformément à l'article 22 du RGPD. Pour exercer ce droit, l'Utilisateur peut contacter le DPO à dpo@nexusinvest.com.`,
  },
  {
    title: '17. Modifications de la politique de confidentialité',
    content: `La présente Politique de Confidentialité peut être modifiée à tout moment par Nexus Invest pour tenir compte des évolutions législatives, réglementaires, jurisprudentielles, techniques ou commerciales. Les modifications sont notifiées aux Utilisateurs selon les modalités suivantes :

(a) Modifications substantielles : notification par email à l'adresse de contact de l'Utilisateur au moins 30 jours avant l'entrée en vigueur, avec un résumé des principales modifications et un lien vers la version complète mise à jour. Un bandeau d'information est également affiché sur la Plateforme lors de la connexion suivante.

(b) Modifications mineures (corrections typographiques, mises à jour de coordonnées, précisions rédactionnelles) : mise à jour de la page avec indication de la date de dernière modification. Aucune notification individuelle n'est envoyée.

(c) En cas de modification substantielle nécessitant un nouveau consentement (nouvelle finalité de traitement, nouveau partage de données avec des tiers), le consentement de l'Utilisateur est recueilli explicitement avant l'entrée en vigueur.

Il est conseillé à l'Utilisateur de consulter régulièrement cette page pour prendre connaissance des éventuelles modifications. La date de dernière mise à jour est indiquée en haut de la page. L'utilisation continue de la Plateforme après l'entrée en vigueur des modifications vaut acceptation de la version modifiée de la Politique.`,
  },
  {
    title: '18. Contact du Délégué à la Protection des Données (DPO)',
    content: `Le Délégué à la Protection des Données (DPO) de Nexus Invest est le point de contact principal pour toutes les questions relatives à la protection des données personnelles et à l'exercice des droits. Le DPO peut être contacté aux coordonnées suivantes :

Email : dpo@nexusinvest.com
Adresse postale : Nexus Invest SARL, À l'attention du DPO, 01 BP 1234 Abidjan 01, Côte d'Ivoire
Téléphone : +225 01 02 03 04 05 (demander le DPO)

Le DPO est indépendant dans l'exercice de ses missions et ne reçoit aucune instruction quant à l'exercice de ses fonctions. Il dispose des ressources nécessaires pour mener à bien ses missions et est consulté en amont sur tout nouveau traitement de données.

Pour les questions générales sur la Plateforme, merci de contacter le support à support@nexusinvest.com. Pour les demandes relatives aux données personnelles, merci de contacter directement le DPO afin de garantir un traitement rapide et conforme.

L'Utilisateur peut également introduire une réclamation auprès de l'autorité de contrôle compétente de son pays. En France : CNIL, 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, France (https://www.cnil.fr). En Côte d'Ivoire : ARTCI, Abidjan, Côte d'Ivoire (https://www.artci.ci).`,
  },
];

function SectionCard({ title, content }: { title: string; content: string | string[] }) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
      {Array.isArray(content) ? (
        <ul className="space-y-2">
          {content.map((item, i) => (
            <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
              <span className="text-emerald-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{content}</p>
      )}
    </div>
  );
}

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
          <Lock className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
          Politique de Confidentialité
        </h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">
        Dernière mise à jour : 25 juillet 2026
      </p>

      <div className="space-y-6">
        {sections.map((section) => (
          <SectionCard key={section.title} title={section.title} content={section.content} />
        ))}
      </div>
    </div>
  );
}
