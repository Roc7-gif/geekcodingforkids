import { useEffect, useState } from 'react'
import api from '../lib/api'
import ModuleCard from '../components/ModuleCard'
import { Loader2 } from 'lucide-react'

export default function Modules() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/modules')
      .then(r => setModules(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-6">
            <span className="font-mono text-brand-cyan text-xs tracking-widest">04 MODULES</span>
          </div>
          <h1 className="section-title mb-4">Nos parcours pédagogiques</h1>
          <p className="section-subtitle">
            Du premier contact avec Scratch jusqu'aux projets IA et robotique avancée.
            Chaque module est conçu pour une tranche d'âge et un niveau spécifique.
          </p>
        </div>

        {/* Kits info */}
        <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl p-5 mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-xl flex-shrink-0">🔧</div>
          <div>
            <p className="font-display font-semibold text-white text-sm">Option Kits Arduino & Robots</p>
            <p className="font-body text-slate-400 text-sm">Disponible en supplément pour tous les modules : +15 000 à 30 000 FCFA selon le kit.</p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-brand-cyan animate-spin" />
          </div>
        ) : modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map(m => <ModuleCard key={m._id} module={m} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-body text-slate-500">Aucun module disponible pour le moment.</p>
          </div>
        )}

        {/* Comparison table */}
        <div className="mt-20">
          <h2 className="font-display font-bold text-2xl text-white mb-8">Tableau comparatif</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left py-3 px-4 text-slate-400 font-display font-semibold">Module</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-display font-semibold">Âge</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-display font-semibold">Durée</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-display font-semibold">Séances</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-display font-semibold">Format</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-display font-semibold">Tarif</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m, i) => {
                  const colors = ['text-brand-cyan', 'text-brand-green', 'text-brand-orange', 'text-brand-purple']
                  return (
                    <tr key={m._id} className="border-b border-brand-border/50 hover:bg-white/2 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`font-display font-semibold ${colors[i]}`}>{m.titre}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{m.trancheAge}</td>
                      <td className="py-3 px-4 text-slate-400">{m.dureeWeeks} semaines</td>
                      <td className="py-3 px-4 text-slate-400">{m.heuresParSemaine}h/semaine</td>
                      <td className="py-3 px-4 text-slate-400">Présentiel / En ligne</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-display font-bold ${colors[i]}`}>{m.tarif?.toLocaleString('fr-FR')} FCFA</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
