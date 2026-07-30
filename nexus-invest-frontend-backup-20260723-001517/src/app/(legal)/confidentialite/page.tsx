import type { Metadata } from 'next';
import { Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
};

const sections = [
  {
    title: '1. Données collectées',
    content: 'Dans le cadre de l\'utilisation de la Plateforme, nous collectons les données suivantes : nom, prénom, adresse email, numéro de téléphone, pays, code de parrainage, données de connexion, historique des transactions, montants investis, et préférences de compte.',
  },
  {
    title: '2. Modalités de collecte',
    content: 'Les données sont collectées directement auprès de l\'Utilisateur lors de l\'inscription, de la souscription à un pack d\'investissement, ou lors des interactions avec le support client. Certaines données techniques (adresse IP, type de navigateur, système d\'exploitation) sont collectées automatiquement via des cookies et technologies similaires.',
  },
  {
    title: '3. Finalités du traitement',
    content: [
      'Gestion et sécurisation du compte Utilisateur.',
      'Exécution des services d\'investissement et de retrait.',
      'Communication liée au fonctionnement du service (notifications, mises à jour).',
      'Prévention de la fraude et respect des obligations légales.',
      'Amélioration de la Plateforme et analyse statistique.',
      'Envoi d\'offres commerciales (avec consentement préalable).',
    ],
  },
  {
    title: '4. Base légale du traitement',
    content: 'Le traitement des données repose sur : (a) l\'exécution du contrat d\'utilisation, (b) le consentement de l\'Utilisateur pour les cookies et communications marketing, (c) l\'obligation légale de conservation des données financières, (d) l\'intérêt légitime de NexusCoin à améliorer ses services et prévenir la fraude.',
  },
  {
    title: '5. Destinataires des données',
    content: 'Les données sont destinées aux services internes de NexusCoin. Elles peuvent être partagées avec des prestataires techniques (hébergement, maintenance, service de paiement) strictement nécessaires au fonctionnement de la Plateforme. Aucune donnée n\'est cédée à des tiers à des fins commerciales sans consentement explicite.',
  },
  {
    title: '6. Durée de conservation',
    content: 'Les données sont conservées pendant toute la durée de vie du compte Utilisateur. Après la fermeture du compte, les données sont archivées pendant 3 ans à des fins probatoires et de respect des obligations légales. Les données financières sont conservées 10 ans conformément à la réglementation comptable en vigueur.',
  },
  {
    title: '7. Droits RGPD',
    content: [
      'Droit d\'accès : obtenir la confirmation que des données sont traitées et y accéder.',
      'Droit de rectification : demander la correction de données inexactes.',
      'Droit à l\'effacement : demander la suppression des données dans les limites légales.',
      'Droit à la limitation : restreindre le traitement des données.',
      'Droit à la portabilité : recevoir les données dans un format structuré.',
      'Droit d\'opposition : s\'opposer au traitement pour motifs légitimes.',
    ],
  },
  {
    title: '8. Exercice des droits',
    content: 'Pour exercer vos droits, contactez notre Délégué à la Protection des Données par email à contact@nexuscoin.com ou par courrier à NexusCoin, Abidjan, Côte d\'Ivoire. Nous nous engageons à répondre sous un mois maximum.',
  },
  {
    title: '9. Cookies',
    content: 'La Plateforme utilise des cookies techniques nécessaires au fonctionnement (session, authentification) et des cookies analytiques (via des services comme Google Analytics) pour améliorer l\'expérience utilisateur. L\'Utilisateur peut configurer ses préférences de cookies via les paramètres de son navigateur. Le refus des cookies techniques peut entraîner un dysfonctionnement de la Plateforme.',
  },
  {
    title: '10. Sécurité des données',
    content: 'NexusCoin met en œuvre des mesures techniques et organisationnelles appropriées pour protéger les données contre tout accès non autorisé, altération, divulgation ou destruction. Ces mesures incluent le chiffrement SSL/TLS, l\'authentification à deux facteurs, et des pare-feu avancés. L\'accès aux données est strictement limité au personnel habilité.',
  },
  {
    title: '11. Transferts internationaux',
    content: 'Les données sont hébergées dans l\'Union Européenne. En cas de recours à des prestataires situés hors UE, NexusCoin s\'assure que des garanties appropriées sont mises en place (clauses contractuelles types, Privacy Shield le cas échéant).',
  },
  {
    title: '12. Modification de la politique',
    content: 'La présente politique de confidentialité peut être modifiée à tout moment. Les Utilisateurs seront informés de toute modification substantielle par email ou via une notification sur la Plateforme. Il est conseillé de consulter régulièrement cette page.',
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
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{content}</p>
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
        Dernière mise à jour : 15 juillet 2026
      </p>

      <div className="space-y-6">
        {sections.map((section) => (
          <SectionCard key={section.title} title={section.title} content={section.content} />
        ))}
      </div>
    </div>
  );
}
