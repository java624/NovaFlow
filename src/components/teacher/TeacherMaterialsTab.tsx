'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { MaterialItem, MATERIAL_CATEGORIES } from '@/types/materials';
import { fetchMaterialsForTeacher, deleteMaterial } from '@/lib/materialsSupabase';
import { StudentProfile } from './types';
import TeacherMaterialCard from './materials/TeacherMaterialCard';
import CreateMaterialModal from './materials/CreateMaterialModal';
import MaterialPreviewModal from '../dashboard/materials/MaterialPreviewModal';

interface TeacherMaterialsTabProps {
  teacherId?: string | null;
  students: StudentProfile[];
  selectedStudent?: StudentProfile | null;
}

export default function TeacherMaterialsTab({
  teacherId,
  students,
  selectedStudent,
}: TeacherMaterialsTabProps) {
  const supabase = createClient();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>(selectedStudent?.id || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<MaterialItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchMaterialsForTeacher(supabase, teacherId || undefined);
    setMaterials(data);
    setLoading(false);
  }, [supabase, teacherId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteMaterial = async (id: string, fileUrl?: string) => {
    if (!confirm('Ви дійсно бажаєте видалити цей матеріал?')) return;
    const { error } = await deleteMaterial(supabase, id, fileUrl);
    if (error) {
      toast.error('Не вдалося видалити матеріал');
      return;
    }
    toast.success('✅ Матеріал видалено');
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMaterialCreated = (newMat: MaterialItem) => {
    setMaterials((prev) => [newMat, ...prev]);
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      if (selectedStudentFilter !== 'all') {
        if (item.student_id !== selectedStudentFilter && item.student_id !== null) return false;
      }

      if (selectedCategory !== 'all') {
        if (item.category !== selectedCategory) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || (item.description?.toLowerCase().includes(q) ?? false);
      }

      return true;
    });
  }, [materials, selectedStudentFilter, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold mb-2">
            <span>📂</span>
            <span>Управління матеріалами</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">База матеріалів та файлів</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Додавайте та діліться корисними матеріалами, шпаргалками та відео з учнями.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-purple-500/20 transition-all flex items-center gap-2"
        >
          <span>＋</span>
          <span>Додати матеріал</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Пошук за назвою..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        />

        {/* Filter by student */}
        <select
          value={selectedStudentFilter}
          onChange={(e) => setSelectedStudentFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        >
          <option value="all">🌐 Усі учні / Загальні</option>
          {students.map((st) => (
            <option key={st.id} value={st.id}>
              👤 {st.full_name || st.first_name || 'Учень'}
            </option>
          ))}
        </select>

        {/* Filter by category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        >
          {MATERIAL_CATEGORIES.filter((c) => c.id !== 'favorites').map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Material Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((mat) => (
            <TeacherMaterialCard
              key={mat.id}
              material={mat}
              onDelete={handleDeleteMaterial}
              onPreview={(item) => setPreviewMaterial(item)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <div className="text-5xl mb-3">📂</div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Матеріалів не знайдено</h3>
          <p className="text-xs text-gray-500">Натисніть "Додати матеріал", щоб створити свій перший навчальний ресурс.</p>
        </div>
      )}

      {/* Create Modal */}
      <CreateMaterialModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        teacherId={teacherId}
        students={students}
        preselectedStudentId={selectedStudentFilter !== 'all' ? selectedStudentFilter : undefined}
        onMaterialCreated={handleMaterialCreated}
      />

      {/* Preview Modal */}
      <MaterialPreviewModal
        material={previewMaterial}
        onClose={() => setPreviewMaterial(null)}
      />
    </div>
  );
}
