import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Copy, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChildCredentials() {
  const location = useLocation()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const credentials = location.state?.enfantCredentials
  const enfantName = location.state?.enfantName

  useEffect(() => {
    if (!credentials) {
      navigate('/dashboard', { replace: true })
    }
  }, [credentials, navigate])

  if (!credentials) return null

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`${label} copié ! ✓`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Alerte importante */}
        <div className="mb-8 bg-brand-cyan/10 border border-brand-cyan/30 rounded-2xl p-6 flex gap-4">
          <AlertCircle className="text-brand-cyan flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-white mb-1">✨ Inscription Confirmée !</h3>
            <p className="text-slate-300 text-sm">
              Les identifiants ci-dessous permettent à l'enfant d'accéder à son espace d'apprentissage.
              Conservez-les en lieu sûr et ne les partagez que avec l'enfant.
            </p>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 shadow-[0_0_60px_rgba(0,229,255,0.05)]">
          <h2 className="font-display font-bold text-2xl text-white mb-2">
            Identifiants de {enfantName || 'l\'enfant'}
          </h2>
          <p className="text-slate-400 mb-8">À partager avec l'enfant pour accéder à son espace</p>

          <div className="space-y-6">
            {/* Username */}
            <div>
              <label className="label">Nom d'utilisateur</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={credentials.username}
                  readOnly
                  className="input flex-1 bg-slate-700 cursor-not-allowed font-mono text-lg"
                />
                <button
                  onClick={() => copyToClipboard(credentials.username, 'Nom d\'utilisateur')}
                  className="px-4 py-2 bg-brand-cyan/20 text-brand-cyan rounded-lg hover:bg-brand-cyan/30 transition flex items-center gap-2 flex-shrink-0"
                >
                  {copied === 'Nom d\'utilisateur' ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Mot de passe</label>
              <div className="flex gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  readOnly
                  className="input flex-1 bg-slate-700 cursor-not-allowed font-mono text-lg"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition flex items-center justify-center flex-shrink-0"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={() => copyToClipboard(credentials.password, 'Mot de passe')}
                  className="px-4 py-2 bg-brand-cyan/20 text-brand-cyan rounded-lg hover:bg-brand-cyan/30 transition flex items-center gap-2 flex-shrink-0"
                >
                  {copied === 'Mot de passe' ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Lien de connexion */}
            <div>
              <label className="label">Lien de connexion</label>
              <a
                href="/enfant/login"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg text-brand-cyan hover:bg-brand-cyan/20 transition text-center font-semibold"
              >
                → Accéder à la page de connexion enfant
              </a>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-8 border-t border-brand-border space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span>📝</span> Instructions
            </h3>
            <ol className="text-slate-300 space-y-2 text-sm list-decimal list-inside">
              <li>Communiquez ces identifiants à {enfantName || 'l\'enfant'} de manière sécurisée</li>
              <li>L'enfant se connecte à <span className="text-brand-cyan font-mono">/enfant/login</span></li>
              <li>Il entre son <strong>nom d'utilisateur</strong> et son <strong>mot de passe</strong></li>
              <li>Il peut alors accéder à son espace d'apprentissage et suivre sa progression</li>
              <li className="text-red-400">
                <strong>⚠️ Important :</strong> Ces identifiants sont confidentiels
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition font-semibold"
            >
              Imprimer 🖨️
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-4 py-3 bg-brand-cyan text-slate-900 rounded-lg hover:bg-brand-cyan/90 transition font-semibold"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
