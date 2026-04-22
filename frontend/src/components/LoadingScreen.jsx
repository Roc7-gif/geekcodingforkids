import { Code2 } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-brand-dark flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center animate-pulse">
            <Code2 size={28} className="text-brand-cyan" />
          </div>
          <div className="absolute inset-0 rounded-2xl border border-brand-cyan/30 animate-ping" />
        </div>
        <p className="font-mono text-brand-cyan/60 text-sm">Chargement...</p>
      </div>
    </div>
  )
}
