'use client';

import { motion } from 'framer-motion';
import { Star, ArrowRight, FileText, Music, Video, Image as ImageIcon, Link as LinkIcon, Paperclip } from 'lucide-react';
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
    if (material.external_link) {
      return { label: 'Посилання', icon: LinkIcon, bg: 'bg-blue-50/80 text-blue-700 border-blue-200/80' };
    }
    switch (material.file_type) {
      case 'pdf':
        return { label: 'PDF Документ', icon: FileText, bg: 'bg-red-50/80 text-red-700 border-red-200/80' };
      case 'audio':
        return { label: 'Аудіо Запис', icon: Music, bg: 'bg-amber-50/80 text-amber-700 border-amber-200/80' };
      case 'video':
        return { label: 'Відео Урок', icon: Video, bg: 'bg-purple-50/80 text-purple-700 border-purple-200/80' };
      case 'image':
        return { label: 'Зображення', icon: ImageIcon, bg: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80' };
      default:
        return { label: 'Файл', icon: Paperclip, bg: 'bg-gray-50/80 text-gray-700 border-gray-200/80' };
    }
  };

  const formatBadge = getFormatBadge();
  const IconComponent = formatBadge.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/85 backdrop-blur-md rounded-2xl p-5 border border-white/70 shadow-sm hover:shadow-xl hover:shadow-purple-500/8 hover:border-purple-200/80 transition-all flex flex-col justify-between group relative overflow-hidden transform-gpu will-change-transform"
    >
      {/* Decorative Glow */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/12 transition-colors duration-500" />

      <div>
        {/* Card Header & Badges */}
        <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-gray-100/80 backdrop-blur-sm text-gray-700 border border-gray-200/50">
              <span>{categoryConfig.icon}</span>
              <span>{categoryConfig.label}</span>
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border backdrop-blur-sm ${formatBadge.bg}`}>
              <IconComponent className="w-3.5 h-3.5" />
              <span>{formatBadge.label}</span>
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleFavorite(material.id)}
            className={`p-1.5 rounded-xl transition-all ${
              isFavorite
                ? 'text-amber-500 bg-amber-50 border border-amber-200/80 shadow-sm'
                : 'text-gray-300 hover:text-amber-400 hover:bg-gray-50 border border-transparent'
            }`}
            title={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </motion.button>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-2 relative z-10 leading-snug">
          {material.title}
        </h3>

        {/* Description */}
        {material.description && (
          <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed relative z-10">
            {material.description}
          </p>
        )}
      </div>

      {/* Footer Details & Action */}
      <div className="pt-3 border-t border-gray-100/80 flex items-center justify-between mt-2 relative z-10">
        <div className="text-[11px] text-gray-400">
          {material.file_size ? <span>{material.file_size} • </span> : null}
          {material.student_id ? (
            <span className="text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
              Персонально
            </span>
          ) : (
            <span>Для всіх</span>
          )}
        </div>

        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPreview(material)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 text-xs font-semibold rounded-xl transition-all shadow-sm group-hover:shadow-purple-500/20"
        >
          <span>Переглянути</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
