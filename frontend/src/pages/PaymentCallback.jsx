import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('Vérification de votre paiement...')

  const transactionId = searchParams.get('id')
  const fedapayStatus = searchParams.get('status')

  useEffect(() => {
    if (!transactionId) {
      setStatus('error')
      setMessage('Identifiant de transaction manquant.')
      return
    }

    if (fedapayStatus === 'canceled') {
      setStatus('error')
      setMessage('Le paiement a été annulé.')
      return
    }

    // Vérifier auprès du backend
    api.get(`/payments/verify/${transactionId}`)
      .then(res => {
        if (res.data.success) {
          setStatus('success')
          setMessage('Paiement confirmé avec succès ! Le compte de votre enfant est maintenant actif.')
          toast.success('Paiement réussi !')
        } else {
          setStatus('error')
          setMessage(res.data.message || 'Le paiement n\'a pas pu être validé.')
        }
      })
      .catch(err => {
        setStatus('error')
        setMessage('Une erreur est survenue lors de la vérification du paiement.')
        console.error(err)
      })
  }, [transactionId, fedapayStatus])

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      <div className="max-w-md w-full card text-center py-12 px-8">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-6">
            <Loader2 size={48} className="text-brand-cyan animate-spin" />
            <div>
              <h1 className="font-display font-bold text-2xl text-white mb-2">Patientez un instant</h1>
              <p className="font-body text-slate-400">{message}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white mb-2">Paiement Réussi !</h1>
              <p className="font-body text-slate-400 mb-8">{message}</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Aller au tableau de bord <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-400/20 rounded-full flex items-center justify-center text-red-400">
              <XCircle size={48} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white mb-2">Oups !</h1>
              <p className="font-body text-slate-400 mb-8">{message}</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn-secondary w-full"
              >
                Retour au tableau de bord
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
