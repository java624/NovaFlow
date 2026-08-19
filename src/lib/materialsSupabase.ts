import { SupabaseClient } from '@supabase/supabase-js';
import { MaterialItem } from '@/types/materials';

export const DEFAULT_MATERIALS: MaterialItem[] = [
  {
    id: 'def-1',
    title: 'Повний довідник з англійської граматики (B1-B2)',
    description: 'Зручний шпаргальник за всіма основними часами: Present, Past, Future, Conditionals та Пасивний стан з прикладами.',
    category: 'grammar',
    file_type: 'pdf',
    file_name: 'English_Grammar_Cheatsheet_B2.pdf',
    file_size: '2.4 MB',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    student_id: null,
  },
  {
    id: 'def-2',
    title: 'Top 100 Phrasal Verbs for Everyday English',
    description: 'Найважливіші фразові дієслова для щоденного спілкування з прикладами у реченнях та перекладом.',
    category: 'vocabulary',
    file_type: 'pdf',
    file_name: 'Top_100_Phrasal_Verbs.pdf',
    file_size: '1.8 MB',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    student_id: null,
  },
  {
    id: 'def-3',
    title: 'Відеоурок: Як позбутися мовного бар\'єру',
    description: 'Практичні поради та вправи для розкріпачення у розмові з носіями мови.',
    category: 'video',
    file_type: 'link',
    external_link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    student_id: null,
  },
  {
    id: 'def-4',
    title: 'Аудіо-вправа: Everyday Business Conversations',
    description: 'Запис ділових діалогів для тренування аудіювання та вимови в робочому середовищі.',
    category: 'listening',
    file_type: 'audio',
    file_name: 'Business_Audio_Lesson.mp3',
    file_size: '5.1 MB',
    file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    student_id: null,
  },
];

export async function fetchMaterialsForStudent(
  supabase: SupabaseClient,
  studentId?: string
): Promise<MaterialItem[]> {
  try {
    let query = supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (studentId) {
      query = query.or(`student_id.is.null,student_id.eq.${studentId}`);
    } else {
      query = query.is('student_id', null);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      console.log('[Materials] Fallback to default materials or empty table', error?.message);
      return DEFAULT_MATERIALS;
    }

    return data as MaterialItem[];
  } catch (err) {
    console.error('[Materials] Fetch error:', err);
    return DEFAULT_MATERIALS;
  }
}

export async function fetchMaterialsForTeacher(
  supabase: SupabaseClient,
  teacherId?: string
): Promise<MaterialItem[]> {
  try {
    let query = supabase
      .from('materials')
      .select('*, profiles:student_id(full_name, first_name)')
      .order('created_at', { ascending: false });

    if (teacherId) {
      query = query.or(`created_by.eq.${teacherId},created_by.is.null`);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.log('[Materials] Teacher fetch fallback', error?.message);
      return DEFAULT_MATERIALS;
    }

    return data.map((item: any) => ({
      ...item,
      student_name: item.profiles?.full_name || item.profiles?.first_name || (item.student_id ? 'Студент' : 'Усі учні'),
    })) as MaterialItem[];
  } catch (err) {
    console.error('[Materials] Teacher fetch error:', err);
    return DEFAULT_MATERIALS;
  }
}

export async function createMaterial(
  supabase: SupabaseClient,
  material: Omit<MaterialItem, 'id' | 'created_at'>
): Promise<{ data: MaterialItem | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('materials')
      .insert([material])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function deleteMaterial(
  supabase: SupabaseClient,
  id: string,
  fileUrl?: string
): Promise<{ error: any }> {
  try {
    if (fileUrl && fileUrl.includes('/homework-attachments/')) {
      const segs = fileUrl.split('/homework-attachments/');
      if (segs.length > 1) {
        await supabase.storage.from('homework-attachments').remove([segs[1]]);
      }
    }
    const { error } = await supabase.from('materials').delete().eq('id', id);
    return { error };
  } catch (err) {
    return { error: err };
  }
}

export async function uploadMaterialFile(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<string | null> {
  try {
    const ext = file.name.split('.').pop() || 'bin';
    const filePath = `mat_${userId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('homework-attachments')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('[Materials] File upload failed:', uploadError.message);
      return null;
    }

    const { data } = supabase.storage
      .from('homework-attachments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('[Materials] File upload exception:', err);
    return null;
  }
}
