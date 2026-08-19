'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Download, X } from 'lucide-react';
import { MaterialItem } from '@/types/materials';

interface MaterialPreviewModalProps {
  material: MaterialItem | null;
  onClose: () => void;
}

export default function MaterialPreviewModal({
  material,
  onClose,
}: MaterialPreviewModalProps) {
  const isYouTube = material?.external_link && (
    material.external_link.includes('youtube.com') || material.external_link.includes('youtu.be')
  );

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
    } catch {}
    return url;
  };

  const isPdf = material?.file_type === 'pdf' || (material?.file_url && material.file_url.toLowerCase().includes('.pdf'));
  const isAudio = material?.file_type === 'audio' || (material?.file_url && (material.file_url.includes('.mp3') || material.file_url.includes('.wav')));

  return (
    <AnimatePresence>
      {material && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/60"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50/60 via-white to-purple-50/30">
              <div>
                <span className="text-[11px] font-bold text-purple-600 tracking-wider uppercase bg-purple-100/60 px-2 py-0.5 rounded-md">
                  {material.category}
                </span>
                <h2 className="text-lg font-extrabold text-gray-900 truncate max-w-md sm:max-w-lg mt-1">
                  {material.title}
                </h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {material.description && (
                <p className="text-sm text-gray-600 leading-relaxed bg-purple-50/30 p-4 rounded-2xl border border-purple-100/60">
                  {material.description}
                </p>
              )}

              {/* YouTube Preview */}
              {isYouTube && material.external_link && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner bg-black border border-gray-200">
                  <iframe
                    src={getYouTubeEmbedUrl(material.external_link)}
                    title={material.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Audio Player */}
              {isAudio && material.file_url && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100/80 text-center space-y-3 shadow-inner">
                  <div className="text-4xl animate-bounce">🎧</div>
                  <p className="text-sm font-bold text-amber-900">Аудіозапис до уроку</p>
                  <audio controls className="w-full max-w-md mx-auto">
                    <source src={material.file_url} />
                    Ваш браузер не підтримує аудіо-плеєр.
                  </audio>
                </div>
              )}

              {/* PDF Viewer */}
              {isPdf && material.file_url && (
                <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-inner">
                  <iframe
                    src={`${material.file_url}#toolbar=0`}
                    title={material.title}
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* External Link or File Download Info */}
              {!isYouTube && !isPdf && !isAudio && (
                <div className="p-8 text-center bg-purple-50/40 rounded-2xl border border-purple-100/60 space-y-4">
                  <div className="text-5xl">📄</div>
                  <h3 className="text-base font-bold text-gray-900">{material.file_name || material.title}</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    Натисніть кнопку нижче, щоб відкрити матеріал або завантажити його собі на пристрій.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {material.file_size ? `Розмір: ${material.file_size}` : ''}
              </div>

              <div className="flex items-center gap-3">
                {material.external_link && (
                  <motion.a
                    whileTap={{ scale: 0.95 }}
                    href={material.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5"
                  >
                    <span>Відкрити посилання</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </motion.a>
                )}

                {material.file_url && (
                  <motion.a
                    whileTap={{ scale: 0.95 }}
                    href={material.file_url}
                    download={material.file_name || 'material'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>Завантажити файл</span>
                    <Download className="w-3.5 h-3.5" />
                  </motion.a>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold rounded-xl transition-all"
                >
                  Закрити
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
