import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, CheckCircle, Clock,
  Wrench, MonitorPlay, FileText, Video, Volume2, Paperclip,
  ExternalLink, Download, ArrowLeft
} from 'lucide-react'
import { useLeconDetail, useMarquerLeconComplete } from '../hooks/useCoursLeconQueries'
import LoadingScreen from '../components/LoadingScreen'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  pratique: {
    label: '🛠️ Pratique',
    icon: Wrench,
    color: 'text-brand-cyan',
    bg: 'bg-brand-cyan/10 border-brand-cyan/30',
  },
  presentielle: {
    label: '🏫 Présentielle',
    icon: MonitorPlay,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/30',
  },
}

const FILE_ICONS = {
  pdf: '📄',
  image: '🖼️',
  zip: '📦',
  video: '🎬',
  audio: '🎵',
  autre: '📎',
}

function isYoutube(url = '') {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

function getYoutubeEmbed(url = '') {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return url
}

function isVimeo(url = '') {
  return url.includes('vimeo.com')
}

function getVimeoEmbed(url = '') {
  const match = url.match(/vimeo\.com\/(\d+)/)
  if (match) return `https://player.vimeo.com/video/${match[1]}`
  return url
}

export default function LeconDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useLeconDetail(id)
  const { mutate: marquerComplete, isPending } = useMarquerLeconComplete()

  if (isLoading) return <LoadingScreen />
  if (!data) return null

  const { lecon, completee, precedente, suivante } = data
  const typeConf = TYPE_CONFIG[lecon.type] || TYPE_CONFIG.pratique
  const TypeIcon = typeConf.icon

  const coursId = lecon.cours?._id || lecon.cours

  const handleComplete = () => {
    if (completee) return
    marquerComplete(lecon._id, {
      onSuccess: () => toast.success('🎉 Leçon complétée !'),
      onError: () => toast.error('Erreur lors de la mise à jour'),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
          <button onClick={() => navigate('/enfant/mes-cours')} className="hover:text-white transition">Mes Cours</button>
          <ChevronRight size={14} />
          <button onClick={() => navigate(`/enfant/cours/${coursId}`)} className="hover:text-white transition">
            {lecon.cours?.titre || 'Cours'}
          </button>
          <ChevronRight size={14} />
          <span className="text-white truncate max-w-[200px]">{lecon.titre}</span>
        </div>

        {/* En-tête leçon */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-7 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Badge type */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border font-medium ${typeConf.bg} ${typeConf.color}`}>
              <TypeIcon size={14} />
              {typeConf.label}
            </span>
            {/* Durée */}
            {lecon.dureeMinutes > 0 && (
              <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Clock size={14} />
                {lecon.dureeMinutes} min
              </span>
            )}
            {/* Statut */}
            {completee && (
              <span className="flex items-center gap-1.5 text-brand-green text-sm font-medium">
                <CheckCircle size={14} />
                Complétée
              </span>
            )}
          </div>

          <h1 className="font-display font-bold text-2xl text-white mb-3">{lecon.titre}</h1>
          <p className="text-slate-400 leading-relaxed">{lecon.description}</p>
        </div>

        {/* Contenu Texte */}
        {lecon.contenu?.texte && (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-7 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-brand-cyan" size={18} />
              <h2 className="font-semibold text-white">Contenu</h2>
            </div>
            <div
              className="text-slate-300 leading-relaxed text-base space-y-3 prose-editor"
              dangerouslySetInnerHTML={{ __html: lecon.contenu.texte }}
            />
          </div>
        )}

        {/* Vidéos */}
        {lecon.contenu?.videos?.length > 0 && (
          <div className="space-y-6 mb-6">
            {lecon.contenu.videos.map((vid, idx) => (
              <div key={idx} className="bg-brand-card border border-brand-border rounded-2xl p-7">
                <div className="flex items-center gap-2 mb-4">
                  <Video className="text-purple-400" size={18} />
                  <h2 className="font-semibold text-white">{vid.titre || `Vidéo ${idx + 1}`}</h2>
                </div>
                {vid.type === 'embed' ? (
                  isYoutube(vid.url) ? (
                    <div className="aspect-video rounded-xl overflow-hidden">
                      <iframe
                        src={getYoutubeEmbed(vid.url)}
                        className="w-full h-full"
                        allowFullScreen
                        title={vid.titre}
                      />
                    </div>
                  ) : isVimeo(vid.url) ? (
                    <div className="aspect-video rounded-xl overflow-hidden">
                      <iframe
                        src={getVimeoEmbed(vid.url)}
                        className="w-full h-full"
                        allowFullScreen
                        title={vid.titre}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl overflow-hidden">
                      <iframe
                        src={vid.url}
                        className="w-full h-full"
                        allowFullScreen
                        title={vid.titre}
                      />
                    </div>
                  )
                ) : (
                  <video
                    src={vid.url}
                    controls
                    className="w-full rounded-xl max-h-[500px] bg-black shadow-lg"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Audios */}
        {lecon.contenu?.audios?.length > 0 && (
          <div className="space-y-4 mb-6">
            {lecon.contenu.audios.map((aud, idx) => (
              <div key={idx} className="bg-brand-card border border-brand-border rounded-2xl p-7">
                <div className="flex items-center gap-2 mb-4">
                  <Volume2 className="text-brand-green" size={18} />
                  <h2 className="font-semibold text-white">{aud.titre || `Audio ${idx + 1}`}</h2>
                </div>
                <audio src={aud.url} controls className="w-full" />
              </div>
            ))}
          </div>
        )}

        {/* CSS pour le Rich Text */}
        <style>{`
          .prose-editor h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: white; }
          .prose-editor h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: white; }
          .prose-editor h3 { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; color: white; }
          .prose-editor ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
          .prose-editor ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
          .prose-editor blockquote { border-left: 4px solid #00e5ff; padding-left: 1rem; color: #94a3b8; font-style: italic; }
          .prose-editor a { color: #00e5ff; text-decoration: underline; }
          .prose-editor img { border-radius: 0.75rem; max-width: 100%; height: auto; }
          .prose-editor pre { background: #0f172a; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-family: monospace; }
        `}</style>
      </div>

      {/* Pièces jointes */}
      {lecon.pieceJointes?.length > 0 && (
        <div className="bg-brand-card border border-brand-border rounded-2xl p-7 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Paperclip className="text-yellow-400" size={18} />
            <h2 className="font-semibold text-white">Ressources</h2>
          </div>
          <div className="space-y-2">
            {lecon.pieceJointes.map((pj, i) => (
              <a
                key={i}
                href={pj.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-700/50 border border-slate-600 rounded-xl
                             hover:border-brand-cyan/50 hover:bg-slate-700 transition group"
              >
                <span className="text-xl">{FILE_ICONS[pj.type] || '📎'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{pj.nom}</p>
                  {pj.taille && (
                    <p className="text-slate-500 text-xs">{pj.taille} Ko</p>
                  )}
                </div>
                <Download className="text-slate-500 group-hover:text-brand-cyan transition" size={16} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Bouton Compléter */}
      <div className="flex flex-col items-center gap-4 mt-8">
        {!completee ? (
          <button
            onClick={handleComplete}
            disabled={isPending}
            className="w-full max-w-sm flex items-center justify-center gap-2 py-4
                         bg-gradient-to-r from-brand-cyan to-brand-green rounded-2xl
                         text-slate-900 font-bold font-display text-lg
                         hover:opacity-90 transition disabled:opacity-60"
          >
            <CheckCircle size={22} />
            {isPending ? 'Enregistrement...' : '✅ Marquer comme terminée'}
          </button>
        ) : (
          <div className="flex items-center gap-2 py-4 text-brand-green font-semibold">
            <CheckCircle size={22} />
            Leçon complétée !
          </div>
        )}
      </div>

      {/* Navigation précédent / suivant */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {precedente ? (
          <button
            onClick={() => navigate(`/enfant/lecon/${precedente._id}`)}
            className="flex items-center gap-2 p-4 bg-brand-card border border-brand-border rounded-2xl
                         hover:border-brand-cyan/50 transition text-left group"
          >
            <ChevronLeft className="text-slate-500 group-hover:text-brand-cyan transition shrink-0" size={20} />
            <div className="min-w-0">
              <p className="text-slate-500 text-xs">Précédent</p>
              <p className="text-white text-sm font-medium truncate">{precedente.titre}</p>
            </div>
          </button>
        ) : (
          <button
            onClick={() => navigate(`/enfant/cours/${coursId}`)}
            className="flex items-center gap-2 p-4 bg-brand-card border border-brand-border rounded-2xl
                         hover:border-brand-cyan/50 transition text-left group"
          >
            <ArrowLeft className="text-slate-500 group-hover:text-brand-cyan transition shrink-0" size={20} />
            <div>
              <p className="text-slate-500 text-xs">Retour</p>
              <p className="text-white text-sm font-medium">Liste des leçons</p>
            </div>
          </button>
        )}

        {suivante ? (
          <button
            onClick={() => navigate(`/enfant/lecon/${suivante._id}`)}
            className="flex items-center gap-2 p-4 bg-brand-card border border-brand-cyan/30 rounded-2xl
                         hover:border-brand-cyan hover:bg-brand-cyan/5 transition text-right group ml-auto w-full justify-end"
          >
            <div className="min-w-0">
              <p className="text-brand-cyan/70 text-xs">Suivant</p>
              <p className="text-white text-sm font-medium truncate">{suivante.titre}</p>
            </div>
            <ChevronRight className="text-brand-cyan/70 group-hover:text-brand-cyan transition shrink-0" size={20} />
          </button>
        ) : (
          <button
            onClick={() => navigate(`/enfant/cours/${coursId}`)}
            className="flex items-center gap-2 p-4 bg-brand-card border border-brand-border rounded-2xl
                         hover:border-brand-green/50 transition text-right group ml-auto w-full justify-end"
          >
            <div>
              <p className="text-slate-500 text-xs">Fin du cours</p>
              <p className="text-white text-sm font-medium">Voir le récap</p>
            </div>
            <CheckCircle className="text-slate-500 group-hover:text-brand-green transition shrink-0" size={20} />
          </button>
        )}
      </div>

    </div>
  )
}
