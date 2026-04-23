import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Code2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, loginGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await login({ email: form.email, password: form.password })
      toast.success('Connexion réussie !')
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    try {
      const { user } = await loginGoogle(credentialResponse.credential)
      toast.success('Connexion Google réussie !')
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur Google Auth')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 grid-bg">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-cyan/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 items-center justify-center mb-4">
            <Code2 size={26} className="text-brand-cyan" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Connexion</h1>
          <p className="font-body text-slate-400 text-sm mt-1">Accédez à votre espace GeekCoding4Kids</p>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 shadow-[0_0_60px_rgba(0,229,255,0.05)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Adresse email</label>
              <input
                type="email"
                className="input"
                placeholder="votre@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Connexion...</> : 'Se connecter'}
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

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="font-body text-slate-400 text-sm text-center">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-brand-cyan hover:underline">Créer un compte</Link>
            </p>
            <div className="w-1 h-1 bg-slate-700 rounded-full" />
            <Link to="/enfant/login" className="text-slate-400 hover:text-brand-cyan text-sm transition-colors">
              Espace Apprenant (Enfant)
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
