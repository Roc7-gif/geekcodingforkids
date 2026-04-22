import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, CheckCircle, Clock, Layers, Lock } from 'lucide-react'
import { useEnfantMe, useEnfantInscription } from '../hooks/useEnfantQueries'
import { useModuleCours, useMaProgression } from '../hooks/useCoursLeconQueries'
import LoadingScreen from '../components/LoadingScreen'

export default function MesCours() {
  const navigate = useNavigate()
  const { data: enfant, isLoading: loadingEnfant } = useEnfantMe()
  const { data: inscription, isLoading: loadingInscription } = useEnfantInscription()
  const moduleId = inscription?.module?._id || inscription?.module
  const { data: cours, isLoading: loadingCours } = useModuleCours(moduleId)
  const { data: progression } = useMaProgression()

  if (loadingEnfant || loadingInscription || loadingCours) return <LoadingScreen />

  const completees = new Set(progression?.completees || [])

  function getNbCompletees(leconIds = []) {
    return leconIds.filter((id) => completees.has(id)).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/enfant/dashboard')}
            className="text-slate-400 hover:text-white transition text-sm flex items-center gap-1"
          >
            ← Dashboard
          </button>
        </div>
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-cyan/20 flex items-center justify-center">
            <BookOpen className="text-brand-cyan" size={28} />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl text-white">
              Mes Cours
            </h1>
            <p className="text-slate-400 mt-1">
              {inscription?.module?.titre || 'Mon module'}
            </p>
          </div>
        </div>

        {/* Progression globale */}
        {progression && (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-5 mb-8 flex items-center gap-4">
            <CheckCircle className="text-brand-green shrink-0" size={24} />
            <div className="flex-1">
              <p className="text-white font-semibold">
                {progression.total} leçon{progression.total > 1 ? 's' : ''} complétée{progression.total > 1 ? 's' : ''}
              </p>
              <p className="text-slate-400 text-sm">Continue comme ça, {enfant?.prenom} ! 🚀</p>
            </div>
          </div>
        )}

        {/* Liste des cours */}
        {!cours || cours.length === 0 ? (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-12 text-center">
            <Layers className="text-slate-500 mx-auto mb-4" size={40} />
            <p className="text-slate-400">Aucun cours disponible pour le moment.</p>
            <p className="text-slate-500 text-sm mt-2">Reviens bientôt !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cours.map((c, index) => (
              <div
                key={c._id}
                onClick={() => navigate(`/enfant/cours/${c._id}`)}
                className="group bg-brand-card border border-brand-border rounded-2xl p-6 cursor-pointer
                           hover:border-brand-cyan/50 hover:bg-slate-800/70 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Numéro */}
                    <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30
                                    flex items-center justify-center shrink-0 font-display font-bold
                                    text-brand-cyan group-hover:bg-brand-cyan/20 transition">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display font-bold text-lg text-white group-hover:text-brand-cyan transition truncate">
                        {c.titre}
                      </h2>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">{c.description}</p>
                    </div>
                  </div>
                  <ChevronRight
                    className="text-slate-500 group-hover:text-brand-cyan transition shrink-0 mt-1"
                    size={20}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
