'use client';

import { MaterialItem, MATERIAL_CATEGORIES } from '@/types/materials';

interface TeacherMaterialCardProps {
  material: MaterialItem;
  onDelete: (id: string, fileUrl?: string) => void;
  onPreview: (material: MaterialItem) => void;
}

export default function TeacherMaterialCard({
  material,
  onDelete,
  onPreview,
}: TeacherMaterialCardProps) {
  const categoryConfig = MATERIAL_CATEGORIES.find((c) => c.id === material.category) || {
    label: material.category,
    icon: '📄',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header & Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700">
            <span>{categoryConfig.icon}</span>
            <span>{categoryConfig.label}</span>
          </span>

          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 truncate max-w-[130px]">
            {material.student_name || (material.student_id ? 'Студент' : '🌐 Для всіх учнів')}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-1.5">
          {material.title}
        </h3>

        {/* Description */}
        {material.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {material.description}
          </p>
        )}
      </div>

      {/* Footer Details & Delete/Preview Actions */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
        <div className="text-[11px] text-gray-400">
          {new Date(material.created_at).toLocaleDateString('uk-UA')}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(material)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all"
          >
            Перегляд
          </button>
          <button
            onClick={() => onDelete(material.id, material.file_url)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-xs"
            title="Видалити матеріал"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
