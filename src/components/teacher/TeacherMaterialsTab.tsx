'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, Plus, Search, Users, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { MaterialItem, MATERIAL_CATEGORIES } from '@/types/materials';
import { fetchMaterialsForTeacher, deleteMaterial } from '@/lib/materialsSupabase';
import { StudentProfile } from './types';
import TeacherMaterialCard from './materials/TeacherMaterialCard';
import CreateMaterialModal from './materials/CreateMaterialModal';
import StorageUsageWidget from './materials/StorageUsageWidget';
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/60 shadow-lg shadow-purple-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold mb-2.5 border border-purple-100/80">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Управління матеріалами</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            База матеріалів та файлів
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Додавайте та діліться корисними матеріалами, шпаргалками та відео з учнями.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-purple-500/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Додати матеріал</span>
        </motion.button>
      </div>

      {/* Storage Usage Widget */}
      <StorageUsageWidget />

      {/* Filters Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-lg shadow-purple-500/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Пошук за назвою..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50/80 border border-gray-200/80 text-gray-900 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        {/* Filter by student */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Users className="w-4 h-4" />
          </span>
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50/80 border border-gray-200/80 text-gray-900 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">🌐 Усі учні / Загальні</option>
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                👤 {st.full_name || st.first_name || 'Учень'}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by category */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50/80 border border-gray-200/80 text-gray-900 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            {MATERIAL_CATEGORIES.filter((c) => c.id !== 'favorites').map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Material Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : filteredMaterials.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredMaterials.map((mat) => (
              <TeacherMaterialCard
                key={mat.id}
                material={mat}
                onDelete={handleDeleteMaterial}
                onPreview={(item) => setPreviewMaterial(item)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl p-12 text-center border border-white/60 shadow-sm"
        >
          <div className="text-5xl mb-3">📂</div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Матеріалів не знайдено</h3>
          <p className="text-xs text-gray-500">Натисніть "Додати матеріал", щоб створити свій перший навчальний ресурс.</p>
        </motion.div>
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
    </motion.div>
  );
}
