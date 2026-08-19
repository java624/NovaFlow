'use client';

import { MaterialItem } from '@/types/materials';

interface MaterialPreviewModalProps {
  material: MaterialItem | null;
  onClose: () => void;
}

export default function MaterialPreviewModal({
  material,
  onClose,
}: MaterialPreviewModalProps) {
  if (!material) return null;

  const isYouTube = material.external_link && (
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

  const isPdf = material.file_type === 'pdf' || (material.file_url && material.file_url.toLowerCase().includes('.pdf'));
  const isAudio = material.file_type === 'audio' || (material.file_url && (material.file_url.includes('.mp3') || material.file_url.includes('.wav')));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 via-white to-purple-50/20">
          <div>
            <span className="text-xs font-semibold text-purple-600 tracking-wider uppercase">
              {material.category}
            </span>
            <h2 className="text-lg font-bold text-gray-900 truncate max-w-md sm:max-w-lg">
              {material.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {material.description && (
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
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
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 text-center space-y-3">
              <div className="text-4xl animate-bounce">🎧</div>
              <p className="text-sm font-semibold text-amber-900">Аудіозапис до уроку</p>
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
            <div className="p-8 text-center bg-purple-50/40 rounded-2xl border border-purple-100 space-y-4">
              <div className="text-5xl">📄</div>
              <h3 className="text-base font-bold text-gray-900">{material.file_name || material.title}</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Натисніть кнопку нижче, щоб відкрити матеріал або завантажити його себе на пристрій.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {material.file_size ? `Розмір: ${material.file_size}` : ''}
          </div>

          <div className="flex items-center gap-3">
            {material.external_link && (
              <a
                href={material.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Відкрити в новій вкладці</span>
                <span>↗</span>
              </a>
            )}

            {material.file_url && (
              <a
                href={material.file_url}
                download={material.file_name || 'material'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Завантажити файл</span>
                <span>⬇</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold rounded-xl transition-all"
            >
              Закрити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
