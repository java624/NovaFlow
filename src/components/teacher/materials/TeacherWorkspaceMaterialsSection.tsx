'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MaterialItem } from '@/types/materials';
import { fetchMaterialsForStudent } from '@/lib/materialsSupabase';
import { StudentProfile } from '../types';
import CreateMaterialModal from './CreateMaterialModal';

interface TeacherWorkspaceMaterialsSectionProps {
  selectedStudent: StudentProfile;
  teacherId?: string | null;
}

export default function TeacherWorkspaceMaterialsSection({
  selectedStudent,
  teacherId,
}: TeacherWorkspaceMaterialsSectionProps) {
  const supabase = createClient();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchMaterialsForStudent(supabase, selectedStudent.id);
    setMaterials(data);
    setLoading(false);
  }, [supabase, selectedStudent.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreated = (newMat: MaterialItem) => {
    setMaterials((prev) => [newMat, ...prev]);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📂</span>
          <h3 className="text-base font-bold text-gray-900">
            Навчальні матеріали учня
          </h3>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl transition-all"
        >
          ＋ Призначити матеріал
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-xs text-gray-400">Завантаження матеріалів...</div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {materials.slice(0, 4).map((mat) => (
            <div key={mat.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-gray-900 truncate">{mat.title}</p>
                <p className="text-[10px] text-gray-400 capitalize">{mat.category} • {mat.file_type || 'link'}</p>
              </div>
              {mat.file_url || mat.external_link ? (
                <a
                  href={mat.file_url || mat.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                >
                  ↗
                </a>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4">Немає призначених матеріалів для цього учня.</p>
      )}

      <CreateMaterialModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        teacherId={teacherId}
        students={[selectedStudent]}
        preselectedStudentId={selectedStudent.id}
        onMaterialCreated={handleCreated}
      />
    </div>
  );
}
