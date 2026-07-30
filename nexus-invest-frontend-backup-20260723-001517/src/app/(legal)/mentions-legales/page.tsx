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
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">
        Dernière mise à jour : 15 juillet 2026
      </p>

      <div className="space-y-6">
        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">1. Éditeur de la Plateforme</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Raison sociale :</span> NexusCoin SARL</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Forme juridique :</span> Société à Responsabilité Limitée</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Capital social :</span> 10 000 000 FCFA</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Siège social :</span> Abidjan, Cocody, Côte d&rsquo;Ivoire</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Registre du commerce :</span> RCCM Abidjan N° CI-ABJ-2026-B-12345</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Numéro fiscal :</span> 1234567P</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Directeur de publication :</span> M. Kouamé Philippe</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">2. Hébergeur</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Raison sociale :</span> Scaleway SA</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Adresse :</span> 8 rue de la Ville &rsquo;Œuvre, 75011 Paris, France</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Téléphone :</span> +33 1 80 98 00 00</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Site web :</span> https://www.scaleway.com</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">3. Contacts</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Email :</span> contact@nexuscoin.com</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Téléphone :</span> +225 01 02 03 04 05</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Adresse :</span> Abidjan, Côte d&rsquo;Ivoire</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Horaires du support :</span> Lundi au Vendredi, 08h00 - 18h00</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">4. Propriété intellectuelle</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            L&rsquo;ensemble du contenu de la Plateforme NexusCoin (textes, logos, marques, designs, codes sources, 
            graphismes, images, vidéos) est protégé par le droit d&rsquo;auteur et le droit des marques. Toute 
            reproduction, représentation, modification, exploitation ou distribution sans autorisation écrite 
            préalable de NexusCoin SARL est strictement interdite et constitue une contrefaçon passible de 
            poursuites judiciaires conformément à la législation ivoirienne et internationale.
          </p>
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-6 md:p-8 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">5. Crédits</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Conception et développement : Équipe technique NexusCoin.<br />
            Icônes : Lucide (https://lucide.dev).<br />
            Polices : Inter & JetBrains Mono (Google Fonts).
          </p>
        </div>
      </div>
    </div>
  );
}
