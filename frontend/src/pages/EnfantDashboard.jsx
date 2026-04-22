import { useNavigate } from 'react-router-dom'
import { useEnfantMe, useEnfantInscription, useUpdateProgression } from '../hooks/useEnfantQueries'
import { useEnfantAuthStore } from '../stores/enfantAuthStore'
import { BookOpen, TrendingUp, LogOut, ChevronRight } from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import toast from 'react-hot-toast'

export default function EnfantDashboard() {
  const navigate = useNavigate()
  const { logout } = useEnfantAuthStore()
  const { data: enfant, isLoading: loadingEnfant } = useEnfantMe()
  const { data: inscription, isLoading: loadingInscription } = useEnfantInscription()
  const { mutate: updateProgression } = useUpdateProgression()

  if (loadingEnfant || loadingInscription) return <LoadingScreen />

  if (!enfant) {
    navigate('/enfant/login', { replace: true })
    return null
  }

  const handleUpdateProgress = (newProgress) => {
    updateProgression(newProgress, {
      onSuccess: () => {
        toast.success('Progression mise à jour ! 🎉')
      },
      onError: () => {
        toast.error('Erreur lors de la mise à jour')
      },
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/enfant/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-white mb-2">
              Bienvenue, {enfant.prenom} ! 👋
            </h1>
            <p className="text-slate-400">Ton espace d'apprentissage GeekCoding4Kids</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>

        {/* Infos Enfant */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Âge</p>
              <p className="text-white font-bold text-lg">{enfant.age} ans</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Niveau</p>
              <p className="text-white font-bold text-lg capitalize">{enfant.niveau}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Progression</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-brand-cyan to-brand-green h-2 rounded-full transition-all"
                    style={{ width: `${enfant.progression || 0}%` }}
                  />
                </div>
                <span className="text-white font-bold">{enfant.progression || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mon Module */}
        {inscription && inscription.module ? (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="text-brand-cyan" size={24} />
                <div>
                  <h2 className="font-display font-bold text-xl text-white">
                    {inscription.module.titre}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Débute le {new Date(inscription.dateDebut).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-brand-cyan/20 text-brand-cyan text-xs rounded-full">
                {inscription.module.numero}/{4}
              </span>
            </div>

            <p className="text-slate-300 mb-6">{inscription.module.description}</p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-slate-400 text-xs uppercase mb-2">Durée</p>
                <p className="text-white font-semibold">
                  {inscription.module.dureeWeeks} semaines
                  <br />
                  <span className="text-slate-400 text-sm">
                    {inscription.module.heuresParSemaine}h/semaine
                  </span>
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase mb-2">Format</p>
                <p className="text-white font-semibold capitalize">{inscription.format}</p>
              </div>
            </div>

            {/* Langages */}
            <div className="mb-6">
              <p className="text-slate-400 text-xs uppercase mb-2">Langages</p>
              <div className="flex flex-wrap gap-2">
                {inscription.module.langages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-slate-700 text-slate-200 text-sm rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Progression */}
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">Mise à jour de ta progression</p>
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((prog) => (
                  <button
                    key={prog}
                    onClick={() => handleUpdateProgress(prog)}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      enfant.progression === prog
                        ? 'bg-brand-cyan text-slate-900'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {prog}%
                  </button>
                ))}
              </div>
            </div>
            {/* Action Principal */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/enfant/mes-cours')}
                className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-brand-cyan/20 to-brand-green/20 border border-brand-cyan/30 rounded-2xl group hover:border-brand-cyan transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-cyan flex items-center justify-center text-slate-900">
                    <BookOpen size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-bold text-xl text-white">Accéder à mes cours</h3>
                    <p className="text-slate-400 text-sm">Découvre tes leçons et continue d'apprendre !</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-brand-cyan group-hover:text-slate-900 transition-all">
                  <ChevronRight size={20} />
                </div>
              </button>
            </div>
          </div>
        ) : inscription && !inscription.module ? (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 mb-8">
            <div className="text-center py-8">
              <p className="text-red-400 mb-3">⚠️ Module non disponible</p>
              <p className="text-slate-400 text-sm mb-4">
                L'inscription est confirmée mais le module n'est pas lié correctement.
              </p>
              <p className="text-slate-500 text-xs font-mono break-all">
                Inscription ID: {inscription._id}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 btn-primary text-sm"
              >
                🔄 Réessayer
              </button>
            </div>
          </div>
        ) : null}

        {/* Compétences */}
        {inscription?.module?.competences && (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-brand-green" size={20} />
              Compétences que tu vas acquérir
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {inscription.module.competences.map((comp) => (
                <div
                  key={comp}
                  className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300"
                >
                  ✓ {comp}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
