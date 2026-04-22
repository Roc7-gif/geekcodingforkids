import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Clock, Users, Code2, CheckCircle2, Package, ArrowLeft, Loader2 } from 'lucide-react'
import api from '../lib/api'

export default function ModuleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [module, setModule] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/modules/${id}`)
      .then(r => setModule(r.data))
      .catch(() => navigate('/modules'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="text-brand-cyan animate-spin" />
    </div>
  )

  if (!module) return null

  const colorMap = {
    '#00e5ff': 'text-[#00e5ff]',
    '#00ff88': 'text-[#00ff88]',
    '#ff6b35': 'text-[#ff6b35]',
    '#a855f7': 'text-[#a855f7]',
  }
  const colorText = colorMap[module.couleur] || 'text-brand-cyan'

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link to="/modules" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-body transition-colors mb-10">
          <ArrowLeft size={16} /> Retour aux modules
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{module.icone}</span>
                <div>
                  <span className={`font-mono text-xs ${colorText} tracking-widest`}>MODULE {module.numero}</span>
                  <h1 className="font-display font-bold text-3xl text-white">{module.titre}</h1>
                </div>
              </div>
              <p className="font-body text-slate-400 leading-relaxed">{module.description}</p>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Clock, label: 'Durée', value: `${module.dureeWeeks} semaines` },
                { icon: Users, label: 'Âge', value: module.trancheAge },
                { icon: Code2, label: 'Séances', value: `${module.heuresParSemaine}h/semaine` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="card text-center">
                  <Icon size={18} className={`${colorText} mx-auto mb-2`} />
                  <div className="font-display font-semibold text-white text-sm">{value}</div>
                  <div className="font-body text-slate-500 text-xs">{label}</div>
                </div>
              ))}
            </div>

            {/* Langages */}
            <div>
              <h3 className="font-display font-semibold text-white mb-4">Technologies & Langages</h3>
              <div className="flex flex-wrap gap-2">
                {module.langages?.map((l, i) => (
                  <span key={i} className={`badge bg-white/5 border border-brand-border ${colorText}`}>
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Compétences */}
            <div>
              <h3 className="font-display font-semibold text-white mb-4">Compétences développées</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {module.competences?.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className={colorText} />
                    <span className="font-body text-slate-300 text-sm">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Livrables */}
            <div>
              <h3 className="font-display font-semibold text-white mb-4">Livrables du module</h3>
              <div className="space-y-2">
                {module.livrables?.map((l, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-white/3 rounded-xl px-4 py-2.5">
                    <Package size={14} className={colorText} />
                    <span className="font-body text-slate-300 text-sm">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: CTA Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 card border-brand-cyan/20 shadow-[0_0_40px_rgba(0,229,255,0.06)]">
              <div className="mb-6">
                <div className={`font-display font-bold text-4xl ${colorText} mb-1`}>
                  {module.tarif?.toLocaleString('fr-FR')}
                  <span className="text-slate-500 text-base font-body ml-1">FCFA</span>
                </div>
                <p className="font-body text-slate-500 text-sm">Pour {module.dureeWeeks} semaines de formation</p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  `${module.dureeWeeks} semaines de cours`,
                  `${module.heuresParSemaine}h par semaine`,
                  'Certificat de compétences',
                  'Accès aux ressources en ligne',
                  'Mentorat personnalisé',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 size={14} className={colorText} />
                    <span className="font-body text-slate-400 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Link to={`/inscription/${module._id}`} className="btn-primary w-full text-center block">
                  S'inscrire à ce module
                </Link>
                <div className="text-center">
                  <p className="font-body text-slate-500 text-xs">
                    + 15 000–30 000 FCFA pour kits Arduino
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
