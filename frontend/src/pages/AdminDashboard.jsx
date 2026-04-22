import {
  Users, BookOpen, TrendingUp, Clock, CheckCircle2, CreditCard,
  Loader2, RefreshCw, Database, Eye, EyeOff, Copy, Plus, Edit2, Trash2, ExternalLink, Layers, MonitorPlay, Wrench, Paperclip,
  Video,
  Volume2
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  useAdminAllCours, useCreateCours, useUpdateCours, useDeleteCours,
  useAdminAllLecons, useCreateLecon, useUpdateLecon, useDeleteLecon
} from '../hooks/useCoursLeconQueries'
import RichTextEditor from '../components/RichTextEditor'
import { useEffect, useState } from 'react'

const statutOptions = ['en_attente', 'confirme', 'paye', 'annule']
const statutLabels = { en_attente: 'En attente', confirme: 'Confirmé', paye: 'Payé', annule: 'Annulé' }
const statutColors = {
  en_attente: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirme: 'text-green-400 bg-green-400/10 border-green-400/20',
  paye: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20',
  annule: 'text-red-400 bg-red-400/10 border-red-400/20',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [inscriptions, setInscriptions] = useState([])
  const [contacts, setContacts] = useState([])
  const [enfants, setEnfants] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState({})
  const [modules, setModules] = useState([])

  // State pour les formulaires
  const [showCoursModal, setShowCoursModal] = useState(false)
  const [editingCours, setEditingCours] = useState(null)
  const [selectedModuleAdmin, setSelectedModuleAdmin] = useState('')

  const [showLeconModal, setShowLeconModal] = useState(false)
  const [editingLecon, setEditingLecon] = useState(null)
  const [selectedCoursAdmin, setSelectedCoursAdmin] = useState('')

  // State pour contenu dynamique
  const [richText, setRichText] = useState('')
  const [leconVideos, setLeconVideos] = useState([])
  const [leconAudios, setLeconAudios] = useState([])
  const [leconPJs, setLeconPJs] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (editingLecon) {
      setRichText(editingLecon.contenu?.texte || '')
      setLeconVideos(editingLecon.contenu?.videos || [])
      setLeconAudios(editingLecon.contenu?.audios || [])
      setLeconPJs(editingLecon.pieceJointes || [])
    } else {
      setRichText('')
      setLeconVideos([])
      setLeconAudios([])
      setLeconPJs([])
    }
  }, [editingLecon, showLeconModal])

  const handleFileUpload = async (file) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data.url
    } catch (err) {
      toast.error('Erreur lors de l\'upload')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const { data: adminCours, refetch: refetchCours } = useAdminAllCours(selectedModuleAdmin)
  const { data: adminLecons, refetch: refetchLecons } = useAdminAllLecons(selectedCoursAdmin)

  const createCoursMutation = useCreateCours()
  const updateCoursMutation = useUpdateCours()
  const deleteCoursMutation = useDeleteCours()

  const createLeconMutation = useCreateLecon()
  const updateLeconMutation = useUpdateLecon()
  const deleteLeconMutation = useDeleteLecon()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, insRes, conRes, enfRes, modRes] = await Promise.all([
        api.get('/inscriptions/stats/overview'),
        api.get('/inscriptions?limit=50'),
        api.get('/contact'),
        api.get('/enfant/all'),
        api.get('/modules'),
      ])
      setStats(statsRes.data)
      setInscriptions(insRes.data.inscriptions)
      setContacts(conRes.data)
      setEnfants(enfRes.data.enfants || [])
      setModules(modRes.data)
    } catch (err) {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const seedModules = async () => {
    try {
      await api.post('/modules/seed/init')
      toast.success('4 modules initialisés !')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur seed')
    }
  }

  const updateStatut = async (id, statut) => {
    try {
      const { data } = await api.put(`/inscriptions/${id}/statut`, { statut })
      setInscriptions(prev => prev.map(i => i._id === id ? data : i))
      toast.success('Statut mis à jour')
    } catch {
      toast.error('Erreur')
    }
  }

  const updateContactStatut = async (id, statut) => {
    try {
      await api.put(`/contact/${id}/statut`, { statut })
      setContacts(prev => prev.map(c => c._id === id ? { ...c, statut } : c))
    } catch { }
  }

  const kpis = stats ? [
    { icon: Users, label: 'Total inscriptions', value: stats.total, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10 border-brand-cyan/20' },
    { icon: CheckCircle2, label: 'Confirmées', value: stats.confirmes, color: 'text-brand-green', bg: 'bg-brand-green/10 border-brand-green/20' },
    { icon: CreditCard, label: 'Payées', value: stats.payes, color: 'text-brand-purple', bg: 'bg-brand-purple/10 border-brand-purple/20' },
    { icon: TrendingUp, label: 'Revenus', value: `${(stats.revenus || 0).toLocaleString('fr-FR')} F`, color: 'text-brand-orange', bg: 'bg-brand-orange/10 border-brand-orange/20' },
  ] : []

  const tabs = [
    { id: 'overview', label: "📊 Vue d'ensemble" },
    { id: 'inscriptions', label: '📝 Inscriptions' },
    { id: 'enfants', label: `👶 Enfants (${enfants.length})` },
    { id: 'cours', label: '📚 Cours' },
    { id: 'lecons', label: '📖 Leçons' },
    { id: 'contacts', label: `📩 Messages (${contacts.filter(c => c.statut === 'nouveau').length})` },
  ]

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge bg-brand-purple/10 text-brand-purple border border-brand-purple/20">🛡 Admin</span>
            </div>
            <h1 className="font-display font-bold text-3xl text-white">Dashboard Admin</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={seedModules} className="btn-outline text-sm flex items-center gap-2">
              <Database size={14} /> Init modules
            </button>
            <button onClick={fetchData} className="btn-outline text-sm flex items-center gap-2">
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-brand-card border border-brand-border rounded-xl p-1 mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 px-4 py-2 rounded-lg font-display font-medium text-sm transition-all whitespace-nowrap ${tab === t.id ? 'bg-brand-cyan text-brand-dark' : 'text-slate-400 hover:text-white'
                }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Action Button pour enfants */}
        {tab === 'enfants' && (
          <button
            onClick={async () => {
              try {
                await api.get('/inscriptions/regenerate/all-credentials')
                toast.success('Credentials régénérés!')
                fetchData()
              } catch (err) {
                toast.error(err.response?.data?.message || 'Erreur')
              }
            }}
            className="mb-6 btn-outline text-sm flex items-center gap-2"
          >
            🔄 Régénérer tous les credentials
          </button>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={32} className="text-brand-cyan animate-spin" /></div>
        ) : (
          <>
            {/* Overview */}
            {tab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {kpis.map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} className={`card border ${bg}`}>
                      <div className={`w-10 h-10 rounded-xl ${bg} border flex items-center justify-center mb-3`}>
                        <Icon size={18} className={color} />
                      </div>
                      <div className={`font-display font-bold text-2xl ${color}`}>{value}</div>
                      <div className="font-body text-slate-500 text-xs mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {stats?.parModule?.length > 0 && (
                  <div className="card">
                    <h3 className="font-display font-semibold text-white mb-5">Inscriptions par module</h3>
                    <div className="space-y-3">
                      {stats.parModule.map((m) => (
                        <div key={m._id} className="flex items-center gap-4">
                          <span className="font-body text-slate-400 text-sm w-48 truncate">{m.titre}</span>
                          <div className="flex-1 bg-brand-border rounded-full h-2">
                            <div className="bg-brand-cyan h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (m.count / stats.total) * 100)}%` }} />
                          </div>
                          <span className="font-display font-bold text-brand-cyan text-sm w-6 text-right">{m.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Inscriptions */}
            {tab === 'inscriptions' && (
              <div className="space-y-3">
                {inscriptions.length === 0 ? (
                  <div className="card text-center py-12 text-slate-500">Aucune inscription</div>
                ) : inscriptions.map((ins) => (
                  <div key={ins._id} className="card">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-semibold text-white text-sm">
                          {ins.parent?.prenom} {ins.parent?.nom}
                          <span className="text-slate-500 font-body font-normal ml-2 text-xs">{ins.parent?.email}</span>
                        </div>
                        <div className="font-body text-slate-500 text-xs mt-0.5">
                          Enfant: {ins.enfant?.prenom} {ins.enfant?.nom} · {ins.module?.titre}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-brand-cyan text-sm">
                          {ins.montantTotal?.toLocaleString('fr-FR')} F
                        </span>
                        <select
                          value={ins.statut}
                          onChange={(e) => updateStatut(ins._id, e.target.value)}
                          className={`text-xs font-display font-medium px-2 py-1 rounded-lg border cursor-pointer bg-transparent outline-none ${statutColors[ins.statut]}`}
                        >
                          {statutOptions.map(s => (
                            <option key={s} value={s} className="bg-brand-dark text-white">{statutLabels[s]}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enfants */}
            {tab === 'enfants' && (
              <div className="space-y-3">
                {enfants.length === 0 ? (
                  <div className="card text-center py-12 text-slate-500">Aucun enfant inscrit</div>
                ) : enfants.map((enf) => (
                  <div key={enf._id} className="card">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-display font-semibold text-white text-sm">
                            {enf.enfant.prenom} {enf.enfant.nom}
                            <span className="text-slate-500 font-body font-normal ml-2 text-xs">
                              {enf.enfant.age} ans · {enf.enfant.niveau}
                            </span>
                          </div>
                          <div className="font-body text-slate-500 text-xs mt-1">
                            Parent: {enf.parent?.prenom} {enf.parent?.nom} · Module: {enf.module?.titre}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge text-xs font-display font-medium px-2 py-1 rounded-lg border ${enf.statut === 'paye'
                            ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20'
                            : 'bg-green-400/10 text-green-400 border-green-400/20'
                            }`}>
                            {enf.statut === 'paye' ? '💳 Payé' : '✅ Confirmé'}
                          </span>
                          {(!enf.credentials?.username || !enf.credentials?.password) && (
                            <button
                              onClick={async () => {
                                try {
                                  const { data } = await api.put(`/inscriptions/${enf._id}/regenerate-credentials`)
                                  toast.success('Credentials régénérés!')
                                  fetchData()
                                } catch (err) {
                                  toast.error(err.response?.data?.message || 'Erreur')
                                }
                              }}
                              className="btn-primary text-xs px-3 py-1"
                              title="Générer les credentials manquants"
                            >
                              🔄 Générer
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Credentials */}
                      <div className="bg-brand-dark/50 rounded-lg p-4 border border-brand-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Username */}
                          <div>
                            <label className="text-xs font-body text-slate-500 block mb-2">Identifiant (Username)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={enf.credentials?.username || '---'}
                                readOnly
                                className="flex-1 font-display font-mono text-sm bg-brand-dark border border-brand-border rounded px-3 py-2 text-brand-cyan"
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(enf.credentials?.username)
                                  toast.success('Copié!')
                                }}
                                className="p-2 hover:bg-brand-border rounded transition-colors"
                                title="Copier"
                              >
                                <Copy size={16} className="text-slate-400" />
                              </button>
                            </div>
                          </div>

                          {/* Password */}
                          <div>
                            <label className="text-xs font-body text-slate-500 block mb-2">Mot de passe</label>
                            <div className="flex items-center gap-2">
                              <input
                                type={showPasswords[enf._id] ? 'text' : 'password'}
                                value={enf.credentials?.password || '---'}
                                readOnly
                                className="flex-1 font-display font-mono text-sm bg-brand-dark border border-brand-border rounded px-3 py-2 text-brand-cyan"
                              />
                              <button
                                onClick={() => setShowPasswords(prev => ({ ...prev, [enf._id]: !prev[enf._id] }))}
                                className="p-2 hover:bg-brand-border rounded transition-colors"
                                title={showPasswords[enf._id] ? 'Masquer' : 'Afficher'}
                              >
                                {showPasswords[enf._id] ? (
                                  <EyeOff size={16} className="text-slate-400" />
                                ) : (
                                  <Eye size={16} className="text-slate-400" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(enf.credentials?.password)
                                  toast.success('Copié!')
                                }}
                                className="p-2 hover:bg-brand-border rounded transition-colors"
                                title="Copier"
                              >
                                <Copy size={16} className="text-slate-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mt-3 italic">
                          Généré le {new Date(enf.createdAt).toLocaleDateString('fr-FR')} à {new Date(enf.createdAt).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cours */}
            {tab === 'cours' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-400">Filtrer par module:</label>
                    <select
                      value={selectedModuleAdmin}
                      onChange={(e) => setSelectedModuleAdmin(e.target.value)}
                      className="bg-brand-card border border-brand-border rounded-lg px-3 py-2 text-sm text-white outline-none"
                    >
                      <option value="">Tous les modules</option>
                      {modules.map(m => (
                        <option key={m._id} value={m._id}>{m.titre}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCours(null)
                      setShowCoursModal(true)
                    }}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    <Plus size={16} /> Ajouter un cours
                  </button>
                </div>

                {!adminCours || adminCours.length === 0 ? (
                  <div className="card text-center py-12 text-slate-500 border-dashed">Aucun cours trouvé</div>
                ) : (
                  <div className="grid gap-4">
                    {adminCours.map((c) => (
                      <div key={c._id} className="card group hover:border-brand-cyan/30 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shrink-0">
                              <BookOpen size={20} className="text-brand-cyan" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-display font-semibold text-white">{c.titre}</h4>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${c.isActive ? 'border-green-400/20 text-green-400 bg-green-400/5' : 'border-red-400/20 text-red-400 bg-red-400/5'}`}>
                                  {c.isActive ? 'Actif' : 'Inactif'}
                                </span>
                              </div>
                              <p className="text-slate-500 text-xs mt-0.5">{c.module?.titre} · Ordre: {c.ordre}</p>
                              <p className="text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">{c.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingCours(c)
                                setShowCoursModal(true)
                              }}
                              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-brand-cyan transition"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Voulez-vous vraiment désactiver ce cours ?')) {
                                  deleteCoursMutation.mutate(c._id)
                                }
                              }}
                              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-red-400 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Leçons */}
            {tab === 'lecons' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-400">Filtrer par cours:</label>
                    <select
                      value={selectedCoursAdmin}
                      onChange={(e) => setSelectedCoursAdmin(e.target.value)}
                      className="bg-brand-card border border-brand-border rounded-lg px-3 py-2 text-sm text-white outline-none w-64"
                    >
                      <option value="">Toutes les leçons</option>
                      {adminCours?.map(c => (
                        <option key={c._id} value={c._id}>{c.titre} ({c.module?.numero})</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setEditingLecon(null)
                      setShowLeconModal(true)
                    }}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    <Plus size={16} /> Ajouter une leçon
                  </button>
                </div>

                {!adminLecons || adminLecons.length === 0 ? (
                  <div className="card text-center py-12 text-slate-500 border-dashed">Aucune leçon trouvée</div>
                ) : (
                  <div className="grid gap-3">
                    {adminLecons.map((l) => (
                      <div key={l._id} className="card group py-4 hover:border-brand-purple/30 transition-all">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${l.type === 'pratique' ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20' : 'bg-brand-purple/10 text-brand-purple border-brand-purple/20'}`}>
                              {l.type === 'pratique' ? <Wrench size={18} /> : <MonitorPlay size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-display font-semibold text-white text-sm truncate">{l.titre}</h4>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${l.type === 'pratique' ? 'border-brand-cyan/20 text-brand-cyan' : 'border-brand-purple/20 text-brand-purple'}`}>
                                  {l.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="text-slate-400 font-medium">{l.cours?.titre}</span>
                                <span>·</span>
                                <span>Ordre: {l.ordre}</span>
                                {l.dureeMinutes > 0 && (
                                  <>
                                    <span>·</span>
                                    <span>{l.dureeMinutes} min</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingLecon(l)
                                setShowLeconModal(true)
                              }}
                              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-brand-cyan transition"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Voulez-vous vraiment désactiver cette leçon ?')) {
                                  deleteLeconMutation.mutate(l._id)
                                }
                              }}
                              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-red-400 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {tab === 'contacts' && (
              <div className="space-y-3">
                {contacts.length === 0 ? (
                  <div className="card text-center py-12 text-slate-500">Aucun message</div>
                ) : contacts.map((c) => (
                  <div key={c._id} className={`card ${c.statut === 'nouveau' ? 'border-brand-cyan/30' : ''}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-white text-sm">{c.nom}</span>
                          {c.statut === 'nouveau' && <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />}
                        </div>
                        <div className="font-body text-slate-500 text-xs">{c.email} · {c.sujet}</div>
                      </div>
                      <select
                        value={c.statut}
                        onChange={(e) => updateContactStatut(c._id, e.target.value)}
                        className="text-xs font-display font-medium px-2 py-1 rounded-lg border border-brand-border bg-transparent text-slate-300 cursor-pointer outline-none"
                      >
                        <option value="nouveau" className="bg-brand-dark">Nouveau</option>
                        <option value="lu" className="bg-brand-dark">Lu</option>
                        <option value="repondu" className="bg-brand-dark">Répondu</option>
                      </select>
                    </div>
                    <p className="font-body text-slate-400 text-sm leading-relaxed">{c.message}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL COURS */}
      {showCoursModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="font-display font-bold text-xl text-white mb-6">
              {editingCours ? 'Modifier le cours' : 'Ajouter un cours'}
            </h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const payload = Object.fromEntries(formData)
              try {
                if (editingCours) {
                  await updateCoursMutation.mutateAsync({ id: editingCours._id, ...payload })
                  toast.success('Cours mis à jour')
                } else {
                  await createCoursMutation.mutateAsync(payload)
                  toast.success('Cours créé')
                }
                setShowCoursModal(false)
              } catch (err) {
                toast.error(err.response?.data?.message || 'Erreur')
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Module parent</label>
                <select name="module" defaultValue={editingCours?.module?._id || editingCours?.module || ''} required className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-white outline-none focus:border-brand-cyan">
                  <option value="" disabled>Sélectionner un module</option>
                  {modules.map(m => <option key={m._id} value={m._id}>{m.titre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Titre</label>
                  <input name="titre" defaultValue={editingCours?.titre} required placeholder="Ex: Introduction à Scratch" className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-white outline-none focus:border-brand-cyan" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Ordre</label>
                  <input type="number" name="ordre" defaultValue={editingCours?.ordre || 1} required className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-white outline-none focus:border-brand-cyan" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea name="description" defaultValue={editingCours?.description} required rows={3} placeholder="Courte description du contenu du cours..." className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-white outline-none focus:border-brand-cyan resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCoursModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-slate-400 rounded-lg hover:bg-white/5 transition">Annuler</button>
                <button type="submit" disabled={createCoursMutation.isPending || updateCoursMutation.isPending} className="flex-[2] btn-primary">{editingCours ? 'Mettre à jour' : 'Créer le cours'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LEÇON */}
      {showLeconModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display font-bold text-xl text-white mb-6">
              {editingLecon ? 'Modifier la leçon' : 'Ajouter une leçon'}
            </h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const data = Object.fromEntries(formData)

              const payload = {
                cours: data.cours,
                titre: data.titre,
                description: data.description,
                type: data.type,
                ordre: parseInt(data.ordre),
                dureeMinutes: parseInt(data.dureeMinutes),
                contenu: {
                  texte: richText,
                  videos: leconVideos,
                  audios: leconAudios
                },
                pieceJointes: leconPJs
              }

              try {
                if (editingLecon) {
                  await updateLeconMutation.mutateAsync({ id: editingLecon._id, ...payload })
                  toast.success('Leçon mise à jour')
                } else {
                  await createLeconMutation.mutateAsync(payload)
                  toast.success('Leçon créée')
                }
                setShowLeconModal(false)
              } catch (err) {
                toast.error(err.response?.data?.message || 'Erreur')
              }
            }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Cours parent</label>
                  <select name="cours" defaultValue={editingLecon?.cours?._id || editingLecon?.cours || ''} required className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-white outline-none focus:border-brand-cyan">
                    <option value="" disabled>Sélectionner un cours</option>
                    {adminCours?.map(c => <option key={c._id} value={c._id}>{c.titre} ({c.module?.numero})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type de leçon</label>
                  <select name="type" defaultValue={editingLecon?.type || 'pratique'} className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-white outline-none focus:border-brand-cyan">
                    <option value="pratique">🛠 Pratique</option>
                    <option value="presentielle">🏫 Présentielle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Titre</label>
                  <input name="titre" defaultValue={editingLecon?.titre} required className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-white outline-none focus:border-brand-cyan" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Ordre</label>
                  <input type="number" name="ordre" defaultValue={editingLecon?.ordre || 1} required className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-white outline-none focus:border-brand-cyan" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Durée (min)</label>
                  <input type="number" name="dureeMinutes" defaultValue={editingLecon?.dureeMinutes || 0} className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-white outline-none focus:border-brand-cyan" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description courte (liste)</label>
                <input name="description" defaultValue={editingLecon?.description} required className="w-full bg-brand-dark border border-brand-border rounded-lg px-4 py-2 text-white outline-none focus:border-brand-cyan" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Contenu de la leçon (Rich Text)</label>
                <RichTextEditor value={richText} onChange={setRichText} placeholder="Rédigez votre leçon ici..." />
              </div>

              {/* Section VIDÉOS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-2">
                  <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
                    <Video size={16} className="text-purple-400" /> Vidéos
                  </h3>
                  <button type="button" onClick={() => setLeconVideos([...leconVideos, { titre: '', url: '', type: 'embed' }])} className="text-brand-cyan text-xs flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Ajouter une vidéo
                  </button>
                </div>
                {leconVideos.map((vid, idx) => (
                  <div key={idx} className="bg-brand-dark/30 p-4 rounded-xl border border-brand-border grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-slate-500 mb-1">Titre</label>
                      <input value={vid.titre} onChange={e => {
                        const newVids = [...leconVideos]; newVids[idx].titre = e.target.value; setLeconVideos(newVids)
                      }} className="w-full bg-brand-dark border border-brand-border rounded px-2 py-1.5 text-xs text-white" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-500 mb-1">Source</label>
                      <select value={vid.type} onChange={e => {
                        const newVids = [...leconVideos]; newVids[idx].type = e.target.value; setLeconVideos(newVids)
                      }} className="w-full bg-brand-dark border border-brand-border rounded px-2 py-1.5 text-xs text-white">
                        <option value="embed">Lien (YT...)</option>
                        <option value="upload">Upload</option>
                      </select>
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] text-slate-500 mb-1">URL / Fichier</label>
                      {vid.type === 'embed' ? (
                        <input value={vid.url} onChange={e => {
                          const newVids = [...leconVideos]; newVids[idx].url = e.target.value; setLeconVideos(newVids)
                        }} placeholder="Lien embed..." className="w-full bg-brand-dark border border-brand-border rounded px-2 py-1.5 text-xs text-white" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <input type="file" accept="video/*" onChange={async e => {
                            if (e.target.files[0]) {
                              const url = await handleFileUpload(e.target.files[0]);
                              if (url) {
                                const newVids = [...leconVideos]; newVids[idx].url = url; setLeconVideos(newVids)
                              }
                            }
                          }} className="text-[10px] text-slate-400" />
                          {vid.url && <span className="text-brand-green text-[10px]">✅ OK</span>}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => setLeconVideos(leconVideos.filter((_, i) => i !== idx))} className="sm:col-span-1 p-2 text-red-500 hover:bg-red-500/10 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Section AUDIOS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-2">
                  <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
                    <Volume2 size={16} className="text-brand-green" /> Audios
                  </h3>
                  <button type="button" onClick={() => setLeconAudios([...leconAudios, { titre: '', url: '', type: 'upload' }])} className="text-brand-cyan text-xs flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Ajouter un audio
                  </button>
                </div>
                {leconAudios.map((aud, idx) => (
                  <div key={idx} className="bg-brand-dark/30 p-4 rounded-xl border border-brand-border grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-slate-500 mb-1">Titre</label>
                      <input value={aud.titre} onChange={e => {
                        const newAuds = [...leconAudios]; newAuds[idx].titre = e.target.value; setLeconAudios(newAuds)
                      }} className="w-full bg-brand-dark border border-brand-border rounded px-2 py-1.5 text-xs text-white" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-500 mb-1">Source</label>
                      <select value={aud.type} onChange={e => {
                        const newAuds = [...leconAudios]; newAuds[idx].type = e.target.value; setLeconAudios(newAuds)
                      }} className="w-full bg-brand-dark border border-brand-border rounded px-2 py-1.5 text-xs text-white">
                        <option value="upload">Upload</option>
                        <option value="embed">Lien distant</option>
                      </select>
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] text-slate-500 mb-1">URL / Fichier</label>
                      {aud.type === 'embed' ? (
                        <input value={aud.url} onChange={e => {
                          const newAuds = [...leconAudios]; newAuds[idx].url = e.target.value; setLeconAudios(newAuds)
                        }} className="w-full bg-brand-dark border border-brand-border rounded px-2 py-1.5 text-xs text-white" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <input type="file" accept="audio/*" onChange={async e => {
                            if (e.target.files[0]) {
                              const url = await handleFileUpload(e.target.files[0]);
                              if (url) {
                                const newAuds = [...leconAudios]; newAuds[idx].url = url; setLeconAudios(newAuds)
                              }
                            }
                          }} className="text-[10px] text-slate-400" />
                          {aud.url && <span className="text-brand-green text-[10px]">✅ OK</span>}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => setLeconAudios(leconAudios.filter((_, i) => i !== idx))} className="sm:col-span-1 p-2 text-red-500 hover:bg-red-500/10 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Section RESSOURCES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-2">
                  <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
                    <Paperclip size={16} className="text-yellow-400" /> Ressources / PJ
                  </h3>
                  <button type="button" onClick={() => setLeconPJs([...leconPJs, { nom: '', url: '', type: 'autre', source: 'upload' }])} className="text-brand-cyan text-xs flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Ajouter un fichier
                  </button>
                </div>
                {leconPJs.map((pj, idx) => (
                  <div key={idx} className="bg-brand-dark/30 p-4 rounded-xl border border-brand-border grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-slate-500 mb-1">Nom</label>
                      <input value={pj.nom} onChange={e => {
                        const newPjs = [...leconPJs]; newPjs[idx].nom = e.target.value; setLeconPJs(newPjs)
                      }} className="w-full bg-brand-dark border border-brand-border rounded px-2 py-1.5 text-xs text-white" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-500 mb-1">Type</label>
                      <select value={pj.type} onChange={e => {
                        const newPjs = [...leconPJs]; newPjs[idx].type = e.target.value; setLeconPJs(newPjs)
                      }} className="w-full bg-brand-dark border border-brand-border rounded px-2 py-1.5 text-xs text-white">
                        <option value="pdf">PDF</option>
                        <option value="zip">ZIP</option>
                        <option value="image">Image</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] text-slate-500 mb-1">Fichier (Upload)</label>
                      <div className="flex items-center gap-2">
                        <input type="file" onChange={async e => {
                          if (e.target.files[0]) {
                            const url = await handleFileUpload(e.target.files[0]);
                            if (url) {
                              const newPjs = [...leconPJs];
                              newPjs[idx].url = url;
                              newPjs[idx].taille = Math.round(e.target.files[0].size / 1024);
                              setLeconPJs(newPjs)
                            }
                          }
                        }} className="text-[10px] text-slate-400" />
                        {pj.url && <span className="text-brand-green text-[10px]">✅ OK</span>}
                      </div>
                    </div>
                    <button type="button" onClick={() => setLeconPJs(leconPJs.filter((_, i) => i !== idx))} className="sm:col-span-1 p-2 text-red-500 hover:bg-red-500/10 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-6 sticky bottom-0 bg-brand-card py-4 border-t border-brand-border">
                <button type="button" onClick={() => setShowLeconModal(false)} className="flex-1 px-4 py-2 border border-brand-border text-slate-400 rounded-lg hover:bg-white/5 transition font-medium">Annuler</button>
                <button type="submit" disabled={createLeconMutation.isPending || updateLeconMutation.isPending || isUploading} className="flex-[2] btn-primary flex items-center justify-center gap-2">
                  {(createLeconMutation.isPending || updateLeconMutation.isPending || isUploading) && <Loader2 size={16} className="animate-spin" />}
                  {isUploading ? 'Upload en cours...' : editingLecon ? 'Mettre à jour la leçon' : 'Créer la leçon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
