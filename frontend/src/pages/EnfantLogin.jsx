import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Code2, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLoginEnfant } from '../hooks/useEnfantQueries'

export default function EnfantLogin() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const { mutateAsync: login, isPending: loading } = useLoginEnfant()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login({ username: form.username, password: form.password })
      toast.success('Bienvenue dans ton espace ! 🎮')
      navigate('/enfant/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 grid-bg">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-cyan/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 items-center justify-center mb-4">
            <Code2 size={26} className="text-brand-cyan" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Connexion Enfant</h1>
          <p className="font-body text-slate-400 text-sm mt-1">Accède à ton espace d'apprentissage</p>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 shadow-[0_0_60px_rgba(0,229,255,0.05)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Nom d'utilisateur</label>
              <input
                type="text"
                className="input"
                placeholder="tonusername"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
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

          <div className="mt-6 pt-6 border-t border-brand-border">
            <p className="text-slate-400 text-xs text-center">
              Tu as reçu tes identifiants après ton inscription confirmée par tes parents ? Utilise-les ci-dessus !
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
