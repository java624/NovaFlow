// Shared types for the Student Dashboard

export type Tab = 'dashboard' | 'lessons' | 'homework' | 'materials' | 'payments' | 'profile';

export interface StudentProfile {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  lessons_left: number;
  avatar_url?: string;
  learning_language?: string;
  teacher_name?: string;
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
  start_time: string;
  end_time?: string;
}
