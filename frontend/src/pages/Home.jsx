import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Trophy, Users, Star, ChevronRight } from 'lucide-react'
import api from '../lib/api'
import ModuleCard from '../components/ModuleCard'

const stats = [
  { value: '4', label: 'Modules complets', color: 'text-brand-cyan' },
  { value: '7–17', label: 'Ans d\'âge cible', color: 'text-brand-green' },
  { value: '34', label: 'Semaines au total', color: 'text-brand-orange' },
  { value: '95%', label: 'Taux de réussite', color: 'text-brand-purple' },
]

const features = [
  { icon: Zap, title: 'Apprentissage actif', desc: 'Projets concrets à chaque session. Les enfants construisent, codent et voient leurs créations prendre vie.', color: 'brand-cyan' },
  { icon: Shield, title: 'Encadrement expert', desc: 'Des mentors passionnés, groupes de 10-15 enfants pour un suivi personnalisé optimal.', color: 'brand-green' },
  { icon: Trophy, title: 'Gamification', desc: 'Badges, défis hebdomadaires et compétitions amicales pour maintenir la motivation.', color: 'brand-orange' },
  { icon: Users, title: 'Travail collaboratif', desc: 'Projets en équipe pour développer l\'esprit d\'équipe et le partage des connaissances.', color: 'brand-purple' },
]

const testimonials = [
  { name: 'Amina K.', role: 'Parent – Module 2', text: 'Mon fils de 12 ans adore les séances ! Il rentre et continue à coder à la maison. Un vrai déclic.', stars: 5 },
  { name: 'Kofi D.', role: 'Parent – Module 3', text: 'La pédagogie est excellente. Ma fille a créé son propre site web en 6 semaines. Impressionnant !', stars: 5 },
  { name: 'Fatou M.', role: 'Parent – Module 1', text: 'Parfait pour débuter. Les formateurs sont patients et les enfants s\'amusent vraiment.', stars: 5 },
]

export default function Home() {
  const [modules, setModules] = useState([])

  useEffect(() => {
    api.get('/modules').then(r => setModules(r.data.slice(0, 4))).catch(() => {})
  }, [])

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center grid-bg pt-20">
        {/* BG glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
              <span className="font-mono text-brand-cyan text-xs tracking-widest uppercase">Bénin · STEM Education</span>
            </div>

            <h1 className="font-display font-bold text-5xl md:text-7xl text-white leading-[1.05] mb-6 animate-slide-up">
              Le code,{' '}
              <span className="text-brand-cyan glow-text">c'est pour</span>
              <br />
              <span className="text-brand-green glow-text">les enfants</span> aussi.
            </h1>

            <p className="font-body text-slate-400 text-xl md:text-2xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Programmation, robotique Arduino et modélisation 3D pour les{' '}
              <span className="text-white font-medium">7–17 ans</span>.
              Préparez vos enfants aux métiers de demain.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/modules" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
                Découvrir les modules <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-outline text-base px-8 py-4">
                Nous contacter
              </Link>
            </div>

            {/* Floating code snippet */}
            <div className="mt-16 inline-block bg-brand-card border border-brand-border rounded-2xl p-4 text-left shadow-[0_0_60px_rgba(0,229,255,0.08)] animate-float">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-red-400/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <span className="w-3 h-3 rounded-full bg-green-400/60" />
                <span className="font-mono text-slate-500 text-xs ml-2">hello_world.py</span>
              </div>
              <pre className="font-mono text-sm text-left leading-relaxed">
                <span className="text-brand-purple">def</span>{' '}
                <span className="text-brand-cyan">bonjour</span>
                <span className="text-white">(</span>
                <span className="text-brand-orange">nom</span>
                <span className="text-white">):</span>{'\n'}
                <span className="text-white">{'  '}</span>
                <span className="text-brand-green">print</span>
                <span className="text-white">(</span>
                <span className="text-brand-orange">"Bonjour, "</span>
                <span className="text-white"> + nom)</span>{'\n\n'}
                <span className="text-brand-cyan">bonjour</span>
                <span className="text-white">(</span>
                <span className="text-brand-orange">"futur génie"</span>
                <span className="text-white">)</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-brand-border bg-brand-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label, color }) => (
              <div key={label} className="text-center">
                <div className={`font-display font-bold text-4xl md:text-5xl ${color} mb-1`}>{value}</div>
                <div className="font-body text-slate-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Pourquoi GeekCoding4Kids ?</h2>
            <p className="section-subtitle mx-auto">
              Une approche pédagogique unique qui allie fun, créativité et rigueur technique.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card group">
                <div className={`w-11 h-11 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center mb-4`}>
                  <Icon size={20} className={`text-${color}`} />
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
                <p className="font-body text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES PREVIEW */}
      {modules.length > 0 && (
        <section className="py-24 bg-brand-card/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="section-title">Nos Modules</h2>
                <p className="section-subtitle">4 parcours adaptés à chaque tranche d'âge et niveau.</p>
              </div>
              <Link to="/modules" className="btn-outline text-sm flex items-center gap-2 whitespace-nowrap">
                Voir tout <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modules.map(m => <ModuleCard key={m._id} module={m} />)}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Ce que disent les parents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="card">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={14} className="text-brand-orange fill-brand-orange" />
                  ))}
                </div>
                <p className="font-body text-slate-300 text-sm leading-relaxed mb-5">"{text}"</p>
                <div>
                  <div className="font-display font-semibold text-white text-sm">{name}</div>
                  <div className="font-body text-slate-500 text-xs">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative bg-brand-card border border-brand-cyan/20 rounded-3xl p-12 shadow-[0_0_80px_rgba(0,229,255,0.08)]">
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-brand-cyan to-transparent" />
            <div className="font-mono text-brand-cyan text-xs mb-6 tracking-widest">// REJOINS-NOUS</div>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Prêt à coder le futur ?
            </h2>
            <p className="font-body text-slate-400 text-lg mb-8">
              Inscrivez votre enfant dès aujourd'hui et lancez son aventure numérique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-base px-8 py-4 flex items-center justify-center gap-2">
                Créer un compte <ArrowRight size={18} />
              </Link>
              <Link to="/modules" className="btn-outline text-base px-8 py-4">
                Voir les modules
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
