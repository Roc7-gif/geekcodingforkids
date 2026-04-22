import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen, ChevronRight, CheckCircle, Clock, Wrench, MonitorPlay } from 'lucide-react'
import { useCoursDetail } from '../hooks/useCoursLeconQueries'
import { useMaProgression } from '../hooks/useCoursLeconQueries'
import LoadingScreen from '../components/LoadingScreen'

const TYPE_CONFIG = {
  pratique: {
    label: 'Pratique',
    icon: Wrench,
    color: 'text-brand-cyan',
    bg: 'bg-brand-cyan/10 border-brand-cyan/30',
  },
  presentielle: {
    label: 'Présentielle',
    icon: MonitorPlay,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/30',
  },
}

export default function CoursDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useCoursDetail(id)
  const { data: progression } = useMaProgression()

  if (isLoading) return <LoadingScreen />
  if (!data) return null

  const { cours, lecons } = data
  const completees = new Set(progression?.completees || [])
  const nbCompletees = lecons.filter((l) => completees.has(l._id)).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <button onClick={() => navigate('/enfant/dashboard')} className="hover:text-white transition">Dashboard</button>
          <ChevronRight size={14} />
          <button onClick={() => navigate('/enfant/mes-cours')} className="hover:text-white transition">Mes Cours</button>
          <ChevronRight size={14} />
          <span className="text-white truncate max-w-[200px]">{cours.titre}</span>
        </div>

        {/* Header du cours */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-7 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 flex items-center justify-center shrink-0">
              <BookOpen className="text-brand-cyan" size={26} />
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-2xl text-white mb-2">{cours.titre}</h1>
              <p className="text-slate-400 text-sm leading-relaxed">{cours.description}</p>
              {lecons.length > 0 && (
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <BookOpen size={14} />
                    <span>{lecons.length} leçon{lecons.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-brand-green">
                    <CheckCircle size={14} />
                    <span>{nbCompletees}/{lecons.length} complétées</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barre de progression */}
          {lecons.length > 0 && (
            <div className="mt-5">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-brand-cyan to-brand-green rounded-full transition-all duration-500"
                  style={{ width: `${(nbCompletees / lecons.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Liste des leçons */}
        {lecons.length === 0 ? (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-12 text-center">
            <p className="text-slate-400">Aucune leçon disponible dans ce cours.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lecons.map((lecon, index) => {
              const isComplete = completees.has(lecon._id)
              const typeConf = TYPE_CONFIG[lecon.type] || TYPE_CONFIG.pratique
              const TypeIcon = typeConf.icon

              return (
                <div
                  key={lecon._id}
                  onClick={() => navigate(`/enfant/lecon/${lecon._id}`)}
                  className={`group flex items-center gap-4 p-5 rounded-2xl border cursor-pointer
                              transition-all duration-200
                              ${isComplete
                    ? 'bg-brand-green/5 border-brand-green/30 hover:border-brand-green/60'
                    : 'bg-brand-card border-brand-border hover:border-brand-cyan/50 hover:bg-slate-800/70'
                  }`}
                >
                  {/* Statut */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
                                   ${isComplete ? 'bg-brand-green/20 text-brand-green' : 'bg-slate-700 text-slate-400'}`}>
                    {isComplete ? <CheckCircle size={18} /> : index + 1}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isComplete ? 'text-brand-green' : 'text-white'}`}>
                      {lecon.titre}
                    </p>
                    <p className="text-slate-500 text-sm mt-0.5 truncate">{lecon.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {/* Badge type */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border font-medium ${typeConf.bg} ${typeConf.color}`}>
                        <TypeIcon size={11} />
                        {typeConf.label}
                      </span>
                      {/* Durée */}
                      {lecon.dureeMinutes > 0 && (
                        <span className="flex items-center gap-1 text-slate-500 text-xs">
                          <Clock size={11} />
                          {lecon.dureeMinutes} min
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    className={`transition shrink-0 ${isComplete ? 'text-brand-green/50' : 'text-slate-600 group-hover:text-brand-cyan'}`}
                    size={20}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
