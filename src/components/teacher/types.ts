export type Tab = 'dashboard' | 'students' | 'workspace' | 'comments';

export interface StudentProfile {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  lessons_left: number;
  avatar_url?: string;
  learning_language?: string;
  birth_date?: string;
  created_at?: string;
  role?: string;
}

export interface Homework {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  status: string;
  attachment_url?: string;
  student_response_url?: string;
  teacher_comment?: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  title?: string;
  start_time: string;
  end_time: string;
  student_id: string;
  profiles?: { full_name?: string };
}

export interface Comment {
  id: string;
  name: string;
  text: string;
  rating?: number;
  teacher_reply?: string;
  created_at: string;
}