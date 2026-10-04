-- ================================================================
-- SRHU IEEE Portal — Supabase RLS Fix
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ================================================================

-- Step 1: Drop all existing RLS policies on students table
DROP POLICY IF EXISTS "Allow select for all" ON public.students;
DROP POLICY IF EXISTS "Allow insert for all" ON public.students;
DROP POLICY IF EXISTS "Allow update for all" ON public.students;
DROP POLICY IF EXISTS "Allow delete for all" ON public.students;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.students;
DROP POLICY IF EXISTS "Enable update for all users" ON public.students;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.students;

-- Step 2: Make sure RLS is enabled on the table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Step 3: Create open policies for anon key (portal uses publishable/anon key)
CREATE POLICY "students_select_anon"
  ON public.students FOR SELECT
  USING (true);

CREATE POLICY "students_insert_anon"
  ON public.students FOR INSERT
  WITH CHECK (true);

CREATE POLICY "students_update_anon"
  ON public.students FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "students_delete_anon"
  ON public.students FOR DELETE
  USING (true);

-- Step 4: Delete all existing student records (clean slate)
DELETE FROM public.students;

-- Step 5: Verify
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'students'
ORDER BY cmd;

-- Should show 4 rows: SELECT, INSERT, UPDATE, DELETE
-- "SELECT count(*) FROM students" should return 0

SELECT 'RLS policies applied. Students table is now empty.' AS status;
SELECT COUNT(*) AS remaining_students FROM public.students;
