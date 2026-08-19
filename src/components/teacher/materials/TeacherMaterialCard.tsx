'use client';

import { motion } from 'framer-motion';
import { Eye, Trash2, Globe, User } from 'lucide-react';
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

  const isGlobal = !material.student_id;

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-50/80 text-purple-700 border border-purple-100/80 backdrop-blur-sm">
            <span>{categoryConfig.icon}</span>
            <span>{categoryConfig.label}</span>
          </span>

          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-xl border backdrop-blur-sm truncate max-w-[140px] ${
            isGlobal
              ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60'
              : 'bg-blue-50/80 text-blue-700 border-blue-200/60'
          }`}>
            {isGlobal ? <Globe className="w-3 h-3" /> : <User className="w-3 h-3" />}
            <span className="truncate">{material.student_name || (isGlobal ? 'Усі учні' : 'Студент')}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-1.5 relative z-10 leading-snug">
          {material.title}
        </h3>

        {/* Description */}
        {material.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed relative z-10">
            {material.description}
          </p>
        )}
      </div>

      {/* Footer Details & Delete/Preview Actions */}
      <div className="pt-3 border-t border-gray-100/80 flex items-center justify-between mt-2 relative z-10">
        <div className="text-[11px] text-gray-400">
          {new Date(material.created_at).toLocaleDateString('uk-UA')}
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onPreview(material)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100/80 hover:bg-purple-50 hover:text-purple-700 text-gray-700 text-xs font-semibold rounded-xl transition-all border border-gray-200/60 hover:border-purple-200"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Перегляд</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onDelete(material.id, material.file_url)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
            title="Видалити матеріал"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
