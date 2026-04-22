import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const infos = [
  { icon: Mail, label: 'Email', value: 'contact@geekcoding4kids.bj' },
  { icon: Phone, label: 'Téléphone', value: '+229 01 23 45 67' },
  { icon: MapPin, label: 'Adresse', value: 'Cotonou, Bénin' },
]

export default function Contact() {
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', sujet: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contact', form)
      setSent(true)
      toast.success('Message envoyé avec succès !')
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-6">
            <Mail size={12} className="text-brand-cyan" />
            <span className="font-mono text-brand-cyan text-xs tracking-widest">CONTACTEZ-NOUS</span>
          </div>
          <h1 className="section-title mb-4">Une question ?</h1>
          <p className="section-subtitle">
            Notre équipe est disponible pour répondre à toutes vos questions sur les modules, les inscriptions et les tarifs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact info */}
          <div className="space-y-6">
            {infos.map(({ icon: Icon, label, value }) => (
              <div key={label} className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-brand-cyan" />
                </div>
                <div>
                  <div className="font-body text-slate-500 text-xs">{label}</div>
                  <div className="font-display font-medium text-white text-sm">{value}</div>
                </div>
              </div>
            ))}

            <div className="card">
              <h4 className="font-display font-semibold text-white mb-3 text-sm">Horaires d'accueil</h4>
              <div className="space-y-2 font-body text-slate-400 text-sm">
                <div className="flex justify-between">
                  <span>Lun – Ven</span>
                  <span className="text-white">08h – 18h</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="text-white">09h – 14h</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="text-slate-600">Fermé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="card flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mb-5">
                  <CheckCircle2 size={30} className="text-brand-green" />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2">Message reçu !</h3>
                <p className="font-body text-slate-400 text-sm max-w-xs">
                  Nous vous répondrons dans les meilleurs délais, généralement sous 24h.
                </p>
                <button onClick={() => { setSent(false); setForm({ nom:'', email:'', telephone:'', sujet:'', message:'' }) }}
                  className="btn-outline mt-6 text-sm">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <div className="card">
                <h3 className="font-display font-semibold text-white mb-6">Envoyer un message</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nom complet</label>
                      <input className="input" placeholder="Votre nom" value={form.nom} onChange={set('nom')} required />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input type="email" className="input" placeholder="votre@email.com" value={form.email} onChange={set('email')} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Téléphone <span className="text-slate-600">(optionnel)</span></label>
                      <input className="input" placeholder="+229 ..." value={form.telephone} onChange={set('telephone')} />
                    </div>
                    <div>
                      <label className="label">Sujet</label>
                      <select className="input" value={form.sujet} onChange={set('sujet')} required>
                        <option value="">Choisir...</option>
                        <option>Renseignements sur les modules</option>
                        <option>Tarifs et paiement</option>
                        <option>Inscription</option>
                        <option>Partenariat</option>
                        <option>Autre</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea className="input h-32 resize-none" placeholder="Votre message..." value={form.message} onChange={set('message')} required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Envoi...</> : <><Send size={16} /> Envoyer le message</>}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
