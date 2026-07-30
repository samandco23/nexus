import type { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation',
};

const sections = [
  {
    title: '1. Présentation',
    content: 'Les présentes Conditions Générales d\'Utilisation (ci-après "CGU") régissent l\'accès et l\'utilisation de la plateforme NexusCoin, accessible depuis le site web https://nexuscoin.com. La plateforme permet aux utilisateurs d\'investir dans des packs financiers, de générer des revenus via le minage virtuel et de bénéficier d\'un système de parrainage.',
  },
  {
    title: '2. Définitions',
    content: [
      '"Plateforme" : le site NexusCoin et l\'ensemble de ses fonctionnalités.',
      '"Utilisateur" : toute personne physique majeure inscrite sur la Plateforme.',
      '"Pack" : produit d\'investissement proposé sur la Plateforme avec un montant minimum, une durée et un rendement définis.',
      '"Compte" : espace personnel de l\'Utilisateur lui permettant d\'accéder aux services.',
      '"RGPD" : Règlement Général sur la Protection des Données (UE) 2016/679.',
    ],
  },
  {
    title: '3. Accès au service',
    content: 'L\'accès à la Plateforme est ouvert à toute personne majeure (18 ans ou plus) disposant de la capacité juridique nécessaire. L\'inscription est gratuite et nécessite la fourniture d\'informations exactes et complètes. NexusCoin se réserve le droit de refuser l\'accès à tout utilisateur ne respectant pas les présentes CGU.',
  },
  {
    title: '4. Inscription et compte',
    content: 'Lors de l\'inscription, l\'Utilisateur s\'engage à fournir des informations exactes (nom, prénom, email, numéro de téléphone, pays). Chaque Utilisateur est responsable de la confidentialité de ses identifiants. Toute activité réalisée depuis le compte est réputée émaner de l\'Utilisateur. En cas d\'utilisation frauduleuse, l\'Utilisateur doit en informer immédiatement le support.',
  },
  {
    title: '5. Services financiers',
    content: 'NexusCoin propose des packs d\'investissement avec des durées et rendements variables. Les investissements sont effectués en FCFA via Mobile Money ou virement bancaire. Les rendements sont crédités automatiquement à l\'échéance. L\'Utilisateur reconnaît que les performances passées ne garantissent pas les résultats futurs. Les retraits sont soumis à un montant minimum de 5 000 FCFA et traités sous 24 à 72 heures ouvrées.',
  },
  {
    title: '6. Responsabilités',
    content: 'NexusCoin met en œuvre tous les moyens techniques pour assurer le bon fonctionnement de la Plateforme. Cependant, la responsabilité de NexusCoin ne saurait être engagée en cas d\'interruption du service due à des opérations de maintenance, des cas de force majeure, ou des actes de tiers. L\'Utilisateur est seul responsable de ses décisions d\'investissement.',
  },
  {
    title: '7. Propriété intellectuelle',
    content: 'L\'ensemble des contenus de la Plateforme (textes, logos, marques, graphismes, codes sources) est la propriété exclusive de NexusCoin ou de ses partenaires. Toute reproduction, distribution ou utilisation sans autorisation préalable est interdite et constitutive de contrefaçon.',
  },
  {
    title: '8. Protection des données (RGPD)',
    content: 'Conformément au Règlement Général sur la Protection des Données (RGPD), les données personnelles collectées sont traitées de manière licite, loyale et transparente. L\'Utilisateur dispose d\'un droit d\'accès, de rectification, d\'effacement et de portabilité de ses données. Pour exercer ces droits, contactez-nous à contact@nexuscoin.com. Les données sont conservées pendant la durée de validité du compte et jusqu\'à 3 ans après la dernière activité.',
  },
  {
    title: '9. Loi applicable et juridiction',
    content: 'Les présentes CGU sont soumises au droit ivoirien. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut d\'accord, les tribunaux compétents sont ceux d\'Abidjan, Côte d\'Ivoire.',
  },
  {
    title: '10. Contact',
    content: 'Pour toute question relative aux présentes CGU, contactez-nous par email à contact@nexuscoin.com ou par téléphone au +225 01 02 03 04 05.',
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

export default function CguPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
          Conditions Générales d&rsquo;Utilisation
        </h1>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 ml-13">
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
