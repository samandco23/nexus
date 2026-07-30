import type { Metadata } from 'next';
import { Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mentions Légales',
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
          <Scale className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
          Mentions Légales
        </h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 ml-13">
        Dernière mise à jour : 25 juillet 2026
      </p>

      <div className="space-y-6">
        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">1. Éditeur de la Plateforme</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Raison sociale :</span> Nexus Invest SARL</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Forme juridique :</span> Société à Responsabilité Limitée</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Capital social :</span> 10 000 000 FCFA</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Siège social :</span> Abidjan, Cocody, Côte d&rsquo;Ivoire</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Registre du commerce :</span> RCCM Abidjan N° CI-ABJ-2026-B-12345</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Numéro d&rsquo;identification fiscale :</span> 1234567P</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Numéro TVA intracommunautaire :</span> CI-1234567P</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Directeur de la publication :</span> M. Kouamé Philippe, Président-directeur général</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Responsable du traitement des données :</span> M. Kouamé Philippe, Délégué à la Protection des Données (DPO)</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">2. Hébergeur</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Raison sociale :</span> Scaleway SA</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Forme juridique :</span> Société Anonyme</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Siège social :</span> 8 rue de la Ville &rsquo;Œuvre, 75011 Paris, France</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Téléphone :</span> +33 1 80 98 00 00</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Site web :</span> https://www.scaleway.com</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Numéro RCS :</span> Paris B 501 830 631</p>
            <p className="mt-2">Les serveurs sont situés dans des datacenters certifiés ISO 27001, SOC 1 et SOC 2, au sein de l&rsquo;Union Européenne (région Paris, France). Aucune donnée n&rsquo;est hébergée en dehors de l&rsquo;Espace Économique Européen sans garanties contractuelles appropriées.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">3. Contacts</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Support technique :</span> support@nexusinvest.com</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Délégué à la Protection des Données :</span> dpo@nexusinvest.com</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Service juridique :</span> legal@nexusinvest.com</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Téléphone :</span> +225 01 02 03 04 05</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Adresse postale :</span> Nexus Invest SARL, 01 BP 1234 Abidjan 01, Côte d&rsquo;Ivoire</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Horaires du support :</span> Lundi au Vendredi, 08h00 - 18h00 (UTC+0)</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">4. Propriété intellectuelle</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            L&rsquo;ensemble du contenu de la Plateforme Nexus Invest (textes, logos, marques, designs, codes sources,
            graphismes, images, vidéos, bases de données, charte graphique) est protégé par le droit d&rsquo;auteur,
            le droit des marques et le droit des brevets. Toute reproduction, représentation, modification,
            exploitation, adaptation ou distribution sans autorisation écrite préalable de Nexus Invest SARL est
            strictement interdite et constitue une contrefaçon passible de poursuites judiciaires conformément
            à la législation ivoirienne, au droit OHADA et aux conventions internationales applicables.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Les marques, noms commerciaux, logos et signes distinctifs apparaissant sur la Plateforme sont la
            propriété exclusive de Nexus Invest SARL ou de ses partenaires. Leur utilisation sans autorisation
            préalable expose le contrevenant à des poursuites civiles et pénales.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Les licences logicielles utilisées (Next.js, Laravel et autres bibliothèques open source) sont
            utilisées conformément aux termes de leurs licences respectives (MIT, Apache 2.0, etc.).
            Le code source propriétaire développé spécifiquement pour Nexus Invest reste la propriété exclusive
            de Nexus Invest SARL.
          </p>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">5. Protection des données personnelles</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Conformément au Règlement Général sur la Protection des Données (RGPD) (UE) 2016/679 du 27 avril 2016
            et à la loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel en
            Côte d&rsquo;Ivoire, Nexus Invest SARL, en qualité de responsable de traitement, collecte et traite des
            données à caractère personnel dans le cadre de la fourniture de ses services.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Données collectées :</span> nom, prénom,
            adresse email, numéro de téléphone, pays, adresse IP, données de connexion, historique des transactions,
            montants investis, préférences de compte, et toute information fournie volontairement par l&rsquo;Utilisateur.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Finalités :</span> gestion des comptes,
            exécution des services d&rsquo;investissement, prévention de la fraude, respect des obligations légales
            et règlementaires, communication commerciale (avec consentement), amélioration de la Plateforme.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Durée de conservation :</span> les données
            sont conservées pendant toute la durée de vie du compte et jusqu&rsquo;à 3 ans après la dernière activité
            pour les données personnelles, et 10 ans pour les données financières conformément aux obligations
            comptables. Pour plus de détails, consultez notre <a href="/confidentialite" className="text-emerald-600 hover:underline">Politique de Confidentialité</a>.
          </p>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">6. Cookies et traceurs</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            La Plateforme utilise des cookies et technologies similaires (localStorage, sessionStorage, tokens)
            pour assurer son fonctionnement, améliorer l&rsquo;expérience utilisateur et réaliser des statistiques
            d&rsquo;audience. Les cookies suivants sont utilisés :
          </p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
            <li className="flex gap-2"><span className="text-emerald-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /><span><span className="font-semibold">Cookies strictement nécessaires :</span> session Laravel, XSRF-TOKEN, token d&rsquo;authentification Sanctum. Durée : session.</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /><span><span className="font-semibold">Cookies fonctionnels :</span> préférences de thème (clair/sombre), langue sélectionnée, devise choisie. Durée : 1 an.</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /><span><span className="font-semibold">Cookies analytiques :</span> mesure d&rsquo;audience, pages visitées, parcours utilisateur. Durée : 13 mois.</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /><span><span className="font-semibold">Google reCAPTCHA :</span> protection anti-spam et anti-bot. Soumis aux conditions d&rsquo;utilisation de Google.</span></li>
          </ul>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            L&rsquo;Utilisateur peut configurer ses préférences de cookies via le bandeau d&rsquo;information
            affiché lors de sa première visite, ou à tout moment via les paramètres de son navigateur.
            Le refus des cookies techniques peut entraîner un dysfonctionnement de la Plateforme.
          </p>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">7. Conditions d&rsquo;utilisation</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            L&rsquo;accès et l&rsquo;utilisation de la Plateforme sont soumis aux Conditions Générales d&rsquo;Utilisation
            consultables à la page <a href="/cgu" className="text-emerald-600 hover:underline">cgu</a>.
            En accédant à la Plateforme, l&rsquo;Utilisateur reconnaît avoir pris connaissance et accepté
            sans réserve l&rsquo;intégralité des présentes mentions légales et des CGU.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Nexus Invest SARL se réserve le droit de modifier les présentes mentions légales à tout moment.
            Les modifications prennent effet dès leur publication sur la Plateforme. Il est conseillé aux
            Utilisateurs de consulter régulièrement cette page.
          </p>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">8. Litiges et droit applicable</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Les présentes mentions légales sont soumises au droit ivoirien et au droit OHADA (Organisation pour
            l&rsquo;Harmonisation en Afrique du Droit des Affaires). En cas de litige, une solution amiable sera
            recherchée préalablement à toute action judiciaire.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Conformément à la réglementation en vigueur, l&rsquo;Utilisateur dispose d&rsquo;un délai de 30 jours
            à compter de la survenance du litige pour saisir le service client de Nexus Invest. À défaut d&rsquo;accord
            amiable, les tribunaux compétents sont ceux d&rsquo;Abidjan (Côte d&rsquo;Ivoire).
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Pour les litiges transfrontaliers au sein de l&rsquo;Union Européenne, l&rsquo;Utilisateur peut recourir
            à la plateforme de règlement en ligne des litiges (RLL) accessible à l&rsquo;adresse
            https://ec.europa.eu/consumers/odr/.
          </p>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">9. Crédits</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Conception et développement : Équipe technique Nexus Invest.<br />
            Framework frontend : Next.js 16 (React 19).<br />
            Framework backend : Laravel 11 (PHP).<br />
            Base de données : MySQL 8.<br />
            Cache : Redis 7.<br />
            Hébergement : Scaleway (Paris, France).<br />
            Icônes : Lucide (https://lucide.dev).<br />
            Polices : Inter &amp; JetBrains Mono (Google Fonts, licence SIL Open Font 1.1).<br />
            Paiement : Stripe, Flutterwave.<br />
            CAPTCHA : Google reCAPTCHA v2.
          </p>
        </div>
      </div>
    </div>
  );
}
