import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Code2, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Déconnexion réussie')
    navigate('/')
  }

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/modules', label: 'Modules' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-brand-dark/90 backdrop-blur-xl border-b border-brand-border shadow-[0_4px_30px_rgba(0,229,255,0.05)]' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center group-hover:bg-brand-cyan/20 transition-all">
              <Code2 size={18} className="text-brand-cyan" />
            </div>
            <span className="font-display font-bold text-white text-lg">
              Geek<span className="text-brand-cyan">Coding</span>4Kids
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) =>
                `font-display font-medium text-sm transition-colors duration-200 ${
                  isActive ? 'text-brand-cyan' : 'text-slate-400 hover:text-white'
                }`
              }>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-slate-400 text-sm font-body">
                  Bonjour, <span className="text-white font-medium">{user.prenom}</span>
                </span>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1.5 text-brand-purple text-sm font-display font-medium hover:text-white transition-colors">
                    <ShieldCheck size={15} />
                    Admin
                  </Link>
                )}
                <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-400 text-sm font-display hover:text-white transition-colors">
                  <LayoutDashboard size={15} />
                  Mon espace
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-500 text-sm hover:text-brand-orange transition-colors">
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm py-2 px-4">Connexion</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">S'inscrire</Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button onClick={() => setOpen(!open)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-brand-card/95 backdrop-blur-xl border-t border-brand-border">
          <div className="px-4 py-4 space-y-2">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl font-display font-medium text-sm transition-colors ${
                    isActive ? 'bg-brand-cyan/10 text-brand-cyan' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }>
                {label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-brand-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-outline text-center text-sm py-2.5">Mon espace</Link>
                  <button onClick={() => { handleLogout(); setOpen(false) }} className="text-slate-500 text-sm py-2">Déconnexion</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline text-center text-sm py-2.5">Connexion</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-center text-sm py-2.5">S'inscrire</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
