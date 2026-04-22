import { Link } from 'react-router-dom'
import { Clock, Users, ArrowRight, Cpu } from 'lucide-react'

const colorMap = {
  '#00e5ff': { bg: 'bg-[#00e5ff]/10', border: 'border-[#00e5ff]/20', text: 'text-[#00e5ff]', hover: 'hover:border-[#00e5ff]/40 hover:shadow-[0_0_40px_#00e5ff15]' },
  '#00ff88': { bg: 'bg-[#00ff88]/10', border: 'border-[#00ff88]/20', text: 'text-[#00ff88]', hover: 'hover:border-[#00ff88]/40 hover:shadow-[0_0_40px_#00ff8815]' },
  '#ff6b35': { bg: 'bg-[#ff6b35]/10', border: 'border-[#ff6b35]/20', text: 'text-[#ff6b35]', hover: 'hover:border-[#ff6b35]/40 hover:shadow-[0_0_40px_#ff6b3515]' },
  '#a855f7': { bg: 'bg-[#a855f7]/10', border: 'border-[#a855f7]/20', text: 'text-[#a855f7]', hover: 'hover:border-[#a855f7]/40 hover:shadow-[0_0_40px_#a855f715]' },
}

export default function ModuleCard({ module }) {
  const c = colorMap[module.couleur] || colorMap['#00e5ff']

  return (
    <div className={`group bg-brand-card border ${c.border} rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 ${c.hover}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-2xl`}>
          {module.icone}
        </div>
        <span className={`badge ${c.bg} ${c.text} ${c.border} border`}>
          Module {module.numero}
        </span>
      </div>

      {/* Title & desc */}
      <div>
        <h3 className="font-display font-bold text-white text-lg mb-1">{module.titre}</h3>
        <p className="font-body text-slate-400 text-sm leading-relaxed line-clamp-2">{module.description}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-slate-500 font-body">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {module.dureeWeeks} semaines
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {module.trancheAge}
        </span>
        <span className="flex items-center gap-1">
          <Cpu size={12} />
          {module.langages?.slice(0, 2).join(', ')}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {module.competences?.slice(0, 3).map((c, i) => (
          <span key={i} className="text-xs font-body text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
            {c}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-brand-border">
        <div>
          <span className={`font-display font-bold text-xl ${c.text}`}>
            {module.tarif?.toLocaleString('fr-FR')}
          </span>
          <span className="text-slate-500 text-xs ml-1 font-body">FCFA</span>
        </div>
        <Link
          to={`/modules/${module._id}`}
          className={`flex items-center gap-1.5 text-sm font-display font-medium ${c.text} group-hover:gap-2.5 transition-all`}
        >
          Voir plus <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
