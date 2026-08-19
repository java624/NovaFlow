export type MaterialCategory = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'video' | 'general';
export type MaterialFileType = 'pdf' | 'doc' | 'image' | 'audio' | 'video' | 'link';

export interface MaterialItem {
  id: string;
  title: string;
  description?: string;
  category: MaterialCategory;
  file_url?: string;
  file_type?: MaterialFileType;
  file_name?: string;
  file_size?: string;
  external_link?: string;
  created_by?: string;
  student_id?: string | null; // null = global for all students, string = specific student
  student_name?: string;
  created_at: string;
  is_favorite?: boolean;
}

export interface MaterialCategoryOption {
  id: MaterialCategory | 'all' | 'favorites';
  label: string;
  icon: string;
  color?: string;
}

export const MATERIAL_CATEGORIES: MaterialCategoryOption[] = [
  { id: 'all', label: 'Усі матеріали', icon: '📂' },
  { id: 'favorites', label: 'Обрані', icon: '⭐' },
  { id: 'grammar', label: 'Граматика', icon: '📐' },
  { id: 'vocabulary', label: 'Лексика', icon: '📚' },
  { id: 'reading', label: 'Читання', icon: '📖' },
  { id: 'listening', label: 'Аудіо', icon: '🎧' },
  { id: 'video', label: 'Відеоуроки', icon: '🎥' },
  { id: 'general', label: 'Загальні', icon: '📄' },
];
