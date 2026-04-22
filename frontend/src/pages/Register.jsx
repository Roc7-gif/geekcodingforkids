import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Code2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', telephone: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, loginGoogle } = useAuth()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Mot de passe trop court (min 6 caractères)')
    setLoading(true)
    try {
      await register(form)
      toast.success('Compte créé avec succès !')
      navigate('/dashboard')
    } catch (err) {
      const errors = err.response?.data?.errors
      toast.error(errors ? errors[0].msg : err.response?.data?.message || 'Erreur d\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    try {
      const { user } = await loginGoogle(credentialResponse.credential)
      toast.success('Connexion Google réussie !')
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur Google Auth')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 grid-bg pb-10">
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-brand-green/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-green/10 border border-brand-green/30 items-center justify-center mb-4">
            <Code2 size={26} className="text-brand-green" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Créer un compte</h1>
          <p className="font-body text-slate-400 text-sm mt-1">Rejoignez GeekCoding4Kids aujourd'hui</p>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 shadow-[0_0_60px_rgba(0,255,136,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nom</label>
                <input className="input" placeholder="Dupont" value={form.nom} onChange={set('nom')} required />
              </div>
              <div>
                <label className="label">Prénom</label>
                <input className="input" placeholder="Jean" value={form.prenom} onChange={set('prenom')} required />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="votre@email.com" value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label className="label">Téléphone <span className="text-slate-600">(optionnel)</span></label>
              <input type="tel" className="input" placeholder="+229 01 23 45 67" value={form.telephone} onChange={set('telephone')} />
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Min. 6 caractères"
                  value={form.password}
                  onChange={set('password')}
                  required
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2" style={{ background: 'linear-gradient(135deg, #00ff88, #00c2ff)', color: '#050a14' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Création...</> : 'Créer mon compte'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-brand-card px-3 text-slate-500 font-bold tracking-widest">Ou continuer avec</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Erreur de connexion Google')}
              useOneTap
              theme="filled_black"
              shape="pill"
              locale="fr"
              width="100%"
            />
          </div>

          <p className="font-body text-slate-400 text-sm text-center mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand-cyan hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
