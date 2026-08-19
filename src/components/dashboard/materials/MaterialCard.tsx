'use client';

import { MaterialItem, MATERIAL_CATEGORIES } from '@/types/materials';

interface MaterialCardProps {
  material: MaterialItem;
  onPreview: (material: MaterialItem) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}

export default function MaterialCard({
  material,
  onPreview,
  onToggleFavorite,
  isFavorite,
}: MaterialCardProps) {
  const categoryConfig = MATERIAL_CATEGORIES.find((c) => c.id === material.category) || {
    label: material.category,
    icon: '📄',
  };

  const getFormatBadge = () => {
    if (material.external_link) return { label: 'Посилання', icon: '🔗', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    switch (material.file_type) {
      case 'pdf':
        return { label: 'PDF Документ', icon: '📄', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'audio':
        return { label: 'Аудіо Запис', icon: '🎵', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'video':
        return { label: 'Відео Урок', icon: '🎥', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'image':
        return { label: 'Зображення', icon: '🖼️', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Файл', icon: '📎', bg: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const formatBadge = getFormatBadge();

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header & Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
              <span>{categoryConfig.icon}</span>
              <span>{categoryConfig.label}</span>
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${formatBadge.bg}`}>
              <span>{formatBadge.icon}</span>
              <span>{formatBadge.label}</span>
            </span>
          </div>

          <button
            onClick={() => onToggleFavorite(material.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              isFavorite ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-400 hover:bg-gray-50'
            }`}
            title={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
          >
            ★
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-2">
          {material.title}
        </h3>

        {/* Description */}
        {material.description && (
          <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">
            {material.description}
          </p>
        )}
      </div>

      {/* Footer Details & Action */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
        <div className="text-[11px] text-gray-400">
          {material.file_size ? <span>{material.file_size} • </span> : null}
          {material.student_id ? (
            <span className="text-purple-600 font-semibold">Персонально</span>
          ) : (
            <span>Для всіх</span>
          )}
        </div>

        <button
          onClick={() => onPreview(material)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl transition-all group-hover:bg-purple-600 group-hover:text-white"
        >
          <span>Переглянути</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
