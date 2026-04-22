import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import { useEnfantAuthStore } from './stores/enfantAuthStore'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Modules from './pages/Modules'
import ModuleDetail from './pages/ModuleDetail'
import Inscription from './pages/Inscription'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import ChildCredentials from './pages/ChildCredentials'
import EnfantLogin from './pages/EnfantLogin'
import EnfantDashboard from './pages/EnfantDashboard'
import MesCours from './pages/MesCours'
import CoursDetail from './pages/CoursDetail'
import LeconDetail from './pages/LeconDetail'
import PaymentCallback from './pages/PaymentCallback'
import LoadingScreen from './components/LoadingScreen'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function ProtectedEnfantRoute({ children }) {
  const token = useEnfantAuthStore((s) => s.token)
  const isHydrated = useEnfantAuthStore((s) => s.isHydrated)
  const loading = useEnfantAuthStore((s) => s.loading)

  if (loading || !isHydrated) return <LoadingScreen />
  if (!token) return <Navigate to="/enfant/login" replace />
  return children
}

export default function App() {
  const cursorRef = useRef(null)

  useEffect(() => {
    // Hydrater le store enfant au démarrage
    useEnfantAuthStore.getState().hydrate()

    const move = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top = e.clientY + 'px'
      }
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div className="min-h-screen flex flex-col relative">
      <div ref={cursorRef} className="cursor-glow hidden lg:block" />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/modules/:id" element={<ModuleDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/inscription/:moduleId?"
            element={<ProtectedRoute><Inscription /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/child-credentials"
            element={<ProtectedRoute><ChildCredentials /></ProtectedRoute>}
          />
          <Route
            path="/payment-callback"
            element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
          />
          
          {/* Routes Enfant */}
          <Route path="/enfant/login" element={<EnfantLogin />} />
          <Route
            path="/enfant/dashboard"
            element={<ProtectedEnfantRoute><EnfantDashboard /></ProtectedEnfantRoute>}
          />
          <Route
            path="/enfant/mes-cours"
            element={<ProtectedEnfantRoute><MesCours /></ProtectedEnfantRoute>}
          />
          <Route
            path="/enfant/cours/:id"
            element={<ProtectedEnfantRoute><CoursDetail /></ProtectedEnfantRoute>}
          />
          <Route
            path="/enfant/lecon/:id"
            element={<ProtectedEnfantRoute><LeconDetail /></ProtectedEnfantRoute>}
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
