import { Link } from 'react-router-dom'
import { Code2, Mail, Phone, MapPin, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative border-t border-brand-border bg-brand-darker mt-20">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center">
                <Code2 size={18} className="text-brand-cyan" />
              </div>
              <span className="font-display font-bold text-white text-xl">
                Geek<span className="text-brand-cyan">Coding</span>4Kids
              </span>
            </div>
            <p className="font-body text-slate-400 text-sm leading-relaxed max-w-xs">
              Initier les enfants et adolescents de 7 à 17 ans à la programmation, la robotique et la modélisation 3D. Construire les ingénieurs de demain.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <span className="badge bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">🎮 Scratch</span>
              <span className="badge bg-brand-green/10 text-brand-green border border-brand-green/20">🤖 Arduino</span>
              <span className="badge bg-brand-orange/10 text-brand-orange border border-brand-orange/20">🚀 Python</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Accueil' },
                { to: '/modules', label: 'Nos Modules' },
                { to: '/inscription', label: 'S\'inscrire' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="font-body text-slate-400 text-sm hover:text-brand-cyan transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-slate-400 text-sm font-body">
                <Mail size={14} className="text-brand-cyan flex-shrink-0" />
                contact@geekcoding4kids.bj
              </li>
              <li className="flex items-center gap-2.5 text-slate-400 text-sm font-body">
                <Phone size={14} className="text-brand-cyan flex-shrink-0" />
                +229 01 23 45 67
              </li>
              <li className="flex items-start gap-2.5 text-slate-400 text-sm font-body">
                <MapPin size={14} className="text-brand-cyan flex-shrink-0 mt-0.5" />
                Cotonou, Bénin
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-slate-500 text-sm">
            © {new Date().getFullYear()} GeekCoding4Kids. Tous droits réservés.
          </p>
          <p className="font-mono text-slate-600 text-xs">
            <span className="text-brand-cyan">{'<'}</span>
            built with passion for kids
            <span className="text-brand-cyan">{'/>'}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
