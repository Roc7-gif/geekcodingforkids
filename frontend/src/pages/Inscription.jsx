import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Inscription() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [selected, setSelected] = useState(moduleId || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    enfantNom: '', enfantPrenom: '', enfantAge: '', enfantNiveau: 'debutant',
    kitsArduino: false, format: 'hybride', notes: '',
  })

  useEffect(() => {
    api.get('/modules').then(r => {
      setModules(r.data)
      if (!moduleId && r.data.length > 0) setSelected(r.data[0]._id)
    })
  }, [moduleId])

  const selectedModule = modules.find(m => m._id === selected)
  const total = selectedModule ? selectedModule.tarif + (form.kitsArduino ? 22500 : 0) : 0

  const set = (field) => (e) => setForm({ ...form, [field]: e.type === 'checkbox' ? e.target.checked : e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selected) return toast.error('Veuillez choisir un module')
    setLoading(true)
    try {
      await api.post('/inscriptions', {
        moduleId: selected,
        enfant: {
          nom: form.enfantNom,
          prenom: form.enfantPrenom,
          age: Number(form.enfantAge),
          niveau: form.enfantNiveau,
        },
        kitsArduino: form.kitsArduino,
        format: form.format,
        notes: form.notes,
      })
      setSuccess(true)
      toast.success('Inscription envoyée avec succès !')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={36} className="text-brand-green" />
        </div>
        <h2 className="font-display font-bold text-3xl text-white mb-3">Inscription envoyée !</h2>
        <p className="font-body text-slate-400 mb-8">
          Votre demande d'inscription a bien été reçue. Notre équipe vous contactera sous 24-48h pour confirmer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary">Mon espace</Link>
          <Link to="/modules" className="btn-outline">Voir les modules</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/modules" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-body mb-8">
          <ArrowLeft size={16} /> Retour
        </Link>

        <div className="mb-10">
          <h1 className="section-title mb-2">Inscription</h1>
          <p className="section-subtitle">Remplissez le formulaire pour inscrire votre enfant.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Module */}
          <div className="card">
            <h3 className="font-display font-semibold text-white mb-5">1. Choisir un module</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modules.map(m => {
                const colors = { '#00e5ff': 'border-[#00e5ff]', '#00ff88': 'border-[#00ff88]', '#ff6b35': 'border-[#ff6b35]', '#a855f7': 'border-[#a855f7]' }
                const isSelected = selected === m._id
                return (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => setSelected(m._id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? `${colors[m.couleur] || 'border-brand-cyan'} bg-white/5`
                        : 'border-brand-border hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">{m.icone}</span>
                      <span className="font-display font-semibold text-white text-sm">{m.titre}</span>
                    </div>
                    <div className="font-body text-slate-500 text-xs">{m.trancheAge} · {m.dureeWeeks} sem.</div>
                    <div className="font-display font-bold text-sm mt-1" style={{ color: m.couleur }}>
                      {m.tarif?.toLocaleString('fr-FR')} FCFA
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Enfant */}
          <div className="card">
            <h3 className="font-display font-semibold text-white mb-5">2. Informations de l'enfant</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Nom</label>
                <input className="input" placeholder="Nom de l'enfant" value={form.enfantNom} onChange={set('enfantNom')} required />
              </div>
              <div>
                <label className="label">Prénom</label>
                <input className="input" placeholder="Prénom" value={form.enfantPrenom} onChange={set('enfantPrenom')} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Âge</label>
                <input type="number" min="7" max="17" className="input" placeholder="Ex: 12" value={form.enfantAge} onChange={set('enfantAge')} required />
              </div>
              <div>
                <label className="label">Niveau</label>
                <select className="input" value={form.enfantNiveau} onChange={set('enfantNiveau')}>
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                </select>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="card">
            <h3 className="font-display font-semibold text-white mb-5">3. Options</h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 accent-brand-cyan" checked={form.kitsArduino} onChange={set('kitsArduino')} />
                <div>
                  <div className="font-display font-medium text-white text-sm">Kit Arduino & accessoires</div>
                  <div className="font-body text-slate-500 text-xs">LEDs, capteurs, moteurs inclus — +22 500 FCFA</div>
                </div>
              </label>

              <div>
                <label className="label">Format préféré</label>
                <select className="input" value={form.format} onChange={set('format')}>
                  <option value="hybride">Hybride (présentiel + en ligne)</option>
                  <option value="presentiel">Présentiel uniquement</option>
                  <option value="enligne">En ligne uniquement</option>
                </select>
              </div>

              <div>
                <label className="label">Notes / Questions <span className="text-slate-600">(optionnel)</span></label>
                <textarea className="input h-24 resize-none" placeholder="Questions, contraintes horaires..." value={form.notes} onChange={set('notes')} />
              </div>
            </div>
          </div>

          {/* Summary & Submit */}
          <div className="card border-brand-cyan/20">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold text-white">Total estimé</span>
              <span className="font-display font-bold text-2xl text-brand-cyan">
                {total.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <p className="font-body text-slate-500 text-xs mb-5">
              Le paiement s'effectue après confirmation de votre inscription par notre équipe.
            </p>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Envoi...</> : 'Envoyer ma demande d\'inscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
