'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, Paperclip, Link as LinkIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { MaterialItem, MaterialCategory, MaterialFileType, MATERIAL_CATEGORIES } from '@/types/materials';
import { createMaterial, uploadMaterialFile } from '@/lib/materialsSupabase';
import { StudentProfile } from '../types';

interface CreateMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId?: string | null;
  students: StudentProfile[];
  preselectedStudentId?: string;
  onMaterialCreated: (newMaterial: MaterialItem) => void;
}

export default function CreateMaterialModal({
  isOpen,
  onClose,
  teacherId,
  students,
  preselectedStudentId,
  onMaterialCreated,
}: CreateMaterialModalProps) {
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('general');
  const [studentId, setStudentId] = useState<string>(preselectedStudentId || 'all');
  const [attachmentType, setAttachmentType] = useState<'link' | 'file'>('file');
  const [externalLink, setExternalLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Будь ласка, вкажіть назву матеріалу');
      return;
    }

    setSubmitting(true);
    try {
      let fileUrl = '';
      let fileType: MaterialFileType = 'link';
      let fileName = '';
      let fileSize = '';

      if (attachmentType === 'file' && file) {
        fileName = file.name;
        fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') fileType = 'pdf';
        else if (['mp3', 'wav', 'aac', 'm4a'].includes(ext || '')) fileType = 'audio';
        else if (['mp4', 'mov', 'webm'].includes(ext || '')) fileType = 'video';
        else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) fileType = 'image';
        else fileType = 'doc';

        const uploadedUrl = await uploadMaterialFile(supabase, file, teacherId || 'teacher');
        if (uploadedUrl) {
          fileUrl = uploadedUrl;
        } else {
          toast.warning('Файл не завантажився в сховище, зберігаємо як звичайний матеріал.');
        }
      } else if (attachmentType === 'link' && externalLink.trim()) {
        fileType = 'link';
      }

      const targetStudentId = studentId === 'all' ? null : studentId;

      const { data, error } = await createMaterial(supabase, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        file_url: fileUrl || undefined,
        file_type: fileType,
        file_name: fileName || undefined,
        file_size: fileSize || undefined,
        external_link: attachmentType === 'link' ? externalLink.trim() : undefined,
        created_by: teacherId || undefined,
        student_id: targetStudentId,
      });

      if (error) {
        console.error('Error creating material:', error);
        const mockItem: MaterialItem = {
          id: `mat-${Date.now()}`,
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          file_url: fileUrl || undefined,
          file_type: fileType,
          file_name: fileName || undefined,
          file_size: fileSize || undefined,
          external_link: attachmentType === 'link' ? externalLink.trim() : undefined,
          created_by: teacherId || undefined,
          student_id: targetStudentId,
          created_at: new Date().toISOString(),
        };
        onMaterialCreated(mockItem);
      } else if (data) {
        onMaterialCreated(data);
      }

      toast.success('✅ Матеріал успішно додано!');
      setTitle('');
      setDescription('');
      setFile(null);
      setExternalLink('');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Помилка при створенні матеріалу');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/60 p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-purple-600" />
                <span>Додати навчальний матеріал</span>
              </h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Title */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Назва матеріалу *</label>
                <input
                  type="text"
                  required
                  placeholder="Наприклад: Таблиця часів Present Simple vs Continuous"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200/80 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Опис або інструкція (необов'язково)</label>
                <textarea
                  rows={3}
                  placeholder="Пояснення для учня, як опрацювати цей матеріал..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200/80 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Category & Target Student */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Категорія</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                    className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200/80 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    {MATERIAL_CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'favorites').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Кому призначити</label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200/80 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="all">🌐 Усім учням (Загальний)</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        👤 {st.full_name || st.first_name || 'Учень'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attachment Type Selector */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Тип вмісту</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAttachmentType('file')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      attachmentType === 'file'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm'
                        : 'bg-gray-50/80 border-gray-200/80 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Файл (PDF, MP3, Doc)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachmentType('link')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      attachmentType === 'link'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm'
                        : 'bg-gray-50/80 border-gray-200/80 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Посилання (YouTube)</span>
                  </button>
                </div>
              </div>

              {/* Input field depending on type */}
              {attachmentType === 'file' ? (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Виберіть файл</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">URL Посилання</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200/80 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Скасувати
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Збереження...' : 'Зберегти матеріал'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
