'use client';

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {

  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-8 shadow-md">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
              <span className="text-3xl text-red-600 dark:text-red-400 font-bold">!</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Une erreur est survenue</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Nous nous excusons pour la gêne. Veuillez réessayer.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
