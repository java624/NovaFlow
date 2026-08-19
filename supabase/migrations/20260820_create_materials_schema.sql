-- Migration: Create materials table and security policies

CREATE TABLE IF NOT EXISTS public.materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf',
  file_name TEXT,
  file_size TEXT,
  external_link TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view materials created for them or global materials
CREATE POLICY "Select relevant materials" ON public.materials
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      student_id IS NULL OR
      student_id = auth.uid() OR
      created_by = auth.uid()
    )
  );

-- Allow teachers to insert materials
CREATE POLICY "Insert materials" ON public.materials
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
  );

-- Allow teachers to update materials
CREATE POLICY "Update materials" ON public.materials
  FOR UPDATE USING (
    auth.role() = 'authenticated'
  );

-- Allow teachers to delete materials
CREATE POLICY "Delete materials" ON public.materials
  FOR DELETE USING (
    auth.role() = 'authenticated'
  );
