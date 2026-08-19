'use client';

import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { MATERIAL_CATEGORIES, MaterialCategoryOption } from '@/types/materials';

interface MaterialsFilterBarProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

export default function MaterialsFilterBar({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  totalCount,
}: MaterialsFilterBarProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/60 shadow-lg shadow-purple-500/5 mb-6 space-y-4">
      {/* Top Search & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Пошук матеріалів за назвою..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50/80 border border-gray-200/80 text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all backdrop-blur-sm placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs font-medium text-gray-500 bg-purple-50/60 px-3 py-1.5 rounded-xl border border-purple-100/60 self-end sm:self-auto backdrop-blur-sm">
          Знайдено: <span className="font-extrabold text-purple-700">{totalCount}</span> матеріалів
        </div>
      </div>

      {/* Category Pills with Animated Layout */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MATERIAL_CATEGORIES.map((cat: MaterialCategoryOption) => {
          const isActive = selectedCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCategory(cat.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                  : 'bg-gray-50/80 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/60 backdrop-blur-sm'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>

              {isActive && (
                <motion.div
                  layoutId="activeCategoryIndicator"
                  className="absolute inset-0 bg-purple-600 rounded-xl -z-10 shadow-md shadow-purple-500/30"
                  transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
