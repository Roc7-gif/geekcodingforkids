import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Clock, CheckCircle2, XCircle, AlertCircle, Plus, Loader2, CreditCard, ExternalLink, ShieldCheck, User as UserIcon, Lock, Eye, EyeOff, Copy } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const statutConfig = {
  en_attente: { label: 'En attente', icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  confirme: { label: 'Confirmé', icon: CheckCircle2, color: 'text-brand-green', bg: 'bg-brand-green/10', border: 'border-brand-green/20' },
  paye: { label: 'Payé', icon: CreditCard, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10', border: 'border-brand-cyan/20' },
  annule: { label: 'Annulé', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const [inscriptions, setInscriptions] = useState([])
  const [payingId, setPayingId] = useState(null)
  const [showPass, setShowPass] = useState({})
  const [loading, setLoading] = useState(true)
  const fetchInscriptions = () => {
    setLoading(true)
    api.get('/inscriptions/mes-inscriptions')
      .then(r => setInscriptions(r.data))
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchInscriptions()
  }, [])

  const handlePayment = async (inscriptionId) => {
    try {
      setPayingId(inscriptionId)
      const { data } = await api.post(`/payments/create-link/${inscriptionId}`)
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du paiement')
      setPayingId(null)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié !')
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="font-display font-bold text-3xl text-white">
              Bonjour, <span className="text-brand-cyan">{user.prenom}</span> 👋
            </h1>
            <p className="font-body text-slate-400 mt-1">Gérez les inscriptions de vos enfants</p>
          </div>
          <Link to="/inscription" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <Plus size={16} /> Nouvelle inscription
          </Link>
        </div>

        {/* Profile card */}
        <div className="card mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center font-display font-bold text-brand-cyan text-lg">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <div>
              <div className="font-display font-semibold text-white">{user.prenom} {user.nom}</div>
              <div className="font-body text-slate-500 text-sm">{user.email}</div>
            </div>
            <div className="ml-auto">
              <span className="badge bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                {user.role === 'admin' ? '🛡 Admin' : '👤 Parent'}
              </span>
            </div>
          </div>
        </div>

        {/* Inscriptions */}
        <div>
          <h2 className="font-display font-semibold text-xl text-white mb-6">
            Mes inscriptions <span className="text-slate-500 text-base font-body">({inscriptions.length})</span>
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="text-brand-cyan animate-spin" />
            </div>
          ) : inscriptions.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="font-display font-semibold text-white mb-2">Aucune inscription</h3>
              <p className="font-body text-slate-400 text-sm mb-6">Commencez l'aventure en inscrivant votre enfant à un module.</p>
              <Link to="/modules" className="btn-primary inline-flex items-center gap-2">
                Voir les modules
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {inscriptions.map((ins) => {
                const s = statutConfig[ins.statut] || statutConfig.en_attente
                const Icon = s.icon
                return (
                  <div key={ins._id} className="card">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-3xl flex-shrink-0">{ins.module?.icone || '📚'}</span>
                        <div className="min-w-0">
                          <div className="font-display font-semibold text-white text-sm truncate">
                            {ins.module?.titre || 'Module'}
                          </div>
                          <div className="font-body text-slate-500 text-xs">
                            {ins.enfant?.prenom} {ins.enfant?.nom} · {ins.enfant?.age} ans
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="text-center">
                          <div className="font-body text-slate-500 text-xs">Format</div>
                          <div className="font-display font-medium text-white text-xs capitalize">{ins.format}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-body text-slate-500 text-xs">Total</div>
                          <div className="font-display font-bold text-brand-cyan text-sm">{ins.montantTotal?.toLocaleString('fr-FR')} F</div>
                        </div>
                        <span className={`badge ${s.bg} ${s.color} ${s.border} border flex items-center gap-1`}>
                          <Icon size={11} /> {s.label}
                        </span>
                      </div>
                    </div>

                    {(ins.statut === 'paye' || ins.statut === 'confirme') && ins.generatedCredentials?.username && (
                      <div className="mt-6 p-4 bg-brand-dark/50 border border-brand-cyan/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <ShieldCheck size={16} className="text-brand-cyan" />
                          <h4 className="font-display font-semibold text-white text-sm">Identifiants de l'enfant</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Nom d'utilisateur</label>
                            <div className="flex items-center gap-2 bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-white text-sm">
                              <UserIcon size={14} className="text-slate-500" />
                              <span className="flex-1 font-mono">{ins.generatedCredentials.username}</span>
                              <button onClick={() => copyToClipboard(ins.generatedCredentials.username)} className="text-slate-500 hover:text-brand-cyan transition">
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Mot de passe</label>
                            <div className="flex items-center gap-2 bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-white text-sm">
                              <Lock size={14} className="text-slate-500" />
                              <span className="flex-1 font-mono">
                                {showPass[ins._id] ? ins.generatedCredentials.password : '••••••••'}
                              </span>
                              <button onClick={() => setShowPass(prev => ({ ...prev, [ins._id]: !prev[ins._id] }))} className="text-slate-500 hover:text-brand-cyan transition">
                                {showPass[ins._id] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button onClick={() => copyToClipboard(ins.generatedCredentials.password)} className="text-slate-500 hover:text-brand-cyan transition">
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-[10px] text-slate-500 italic">
                          Donnez ces accès à votre enfant pour qu'il puisse se connecter à la plateforme.
                        </p>
                      </div>
                    )}

                    {ins.statut === 'en_attente' && (
                      <div className="mt-4 pt-4 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="font-body text-slate-500 text-xs flex items-center gap-1.5">
                          <Clock size={12} />
                          En attente de paiement pour activer l'accès enfant.
                        </p>
                        <button
                          onClick={() => handlePayment(ins._id)}
                          disabled={payingId === ins._id}
                          className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                        >
                          {payingId === ins._id ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                          Payer maintenant
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
