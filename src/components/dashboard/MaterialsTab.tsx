'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MaterialItem } from '@/types/materials';
import { fetchMaterialsForStudent } from '@/lib/materialsSupabase';
import MaterialsFilterBar from './materials/MaterialsFilterBar';
import MaterialCard from './materials/MaterialCard';
import MaterialPreviewModal from './materials/MaterialPreviewModal';

interface MaterialsTabProps {
  studentId?: string;
}

export default function MaterialsTab({ studentId }: MaterialsTabProps) {
  const supabase = createClient();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activePreviewMaterial, setActivePreviewMaterial] = useState<MaterialItem | null>(null);

  // Load materials
  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchMaterialsForStudent(supabase, studentId);
    setMaterials(data);
    setLoading(false);
  }, [supabase, studentId]);

  useEffect(() => {
    loadData();
    // Load local favorites
    try {
      const savedFavs = localStorage.getItem('novaflow_favorite_materials');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    } catch {}
  }, [loadData]);

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('novaflow_favorite_materials', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      // Category filter
      if (selectedCategory === 'favorites') {
        if (!favorites.includes(item.id)) return false;
      } else if (selectedCategory !== 'all') {
        if (item.category !== selectedCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q) || false;
        return matchTitle || matchDesc;
      }

      return true;
    });
  }, [materials, selectedCategory, searchQuery, favorites]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-500 font-medium">Завантаження навчальних матеріалів...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 text-9xl font-extrabold select-none pointer-events-none">
          LIBRARY
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/10">
            <span>📚</span>
            <span>База знань & Ресурси</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Навчальні Матеріали
          </h1>
          <p className="text-sm text-purple-100/80 leading-relaxed">
            Персональні конспекти, презентації, шпаргалки з граматики, аудіо-файли та відеоуроки для вашого ефективного навчання.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <MaterialsFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={filteredMaterials.length}
      />

      {/* Grid List */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onPreview={(item) => setActivePreviewMaterial(item)}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.includes(material.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Нічого не знайдено</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Спробуйте змінити категорію або категоріальний фільтр для пошуку матеріалів.
          </p>
        </div>
      )}

      {/* Preview Modal */}
      <MaterialPreviewModal
        material={activePreviewMaterial}
        onClose={() => setActivePreviewMaterial(null)}
      />
    </div>
  );
}
