-- ==========================================================
-- SRHU IEEE Student Registration Portal - Supabase Schema
-- ==========================================================

-- Enable pgcrypto for UUID generation if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    dd_no TEXT NOT NULL UNIQUE,
    course TEXT NOT NULL,
    year TEXT NOT NULL,
    section TEXT NOT NULL,
    join_status TEXT NOT NULL DEFAULT 'not_joined' CHECK (join_status IN ('not_joined', 'joined')),
    joined_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive index on DD number for instant lookups
CREATE INDEX IF NOT EXISTS idx_students_dd_no ON public.students (UPPER(dd_no));
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students (join_status);

-- 2. Create profiles table for admin authorization
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Row Level Security (RLS) Configuration
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public verification read (safe matching)
CREATE POLICY "Allow public verification lookup"
    ON public.students
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow public update of join status during verified registration
CREATE POLICY "Allow student join update"
    ON public.students
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Allow full administrative control for authenticated admins
CREATE POLICY "Allow admin full access to students"
    ON public.students
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid()
            AND public.profiles.role = 'admin'
        )
    );

-- Profiles policy: user can view own profile
CREATE POLICY "Allow user to view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- 4. Initial Seed Data (SRHU IEEE Student Branch)
INSERT INTO public.students (name, dd_no, course, year, section, join_status, joined_at)
VALUES
    ('Rahul Kumar', '23CSE101', 'B.Tech', '3rd Year', 'A', 'joined', now() - interval '2 days'),
    ('Aman Singh', '23CSE102', 'B.Tech', '3rd Year', 'A', 'not_joined', NULL),
    ('Priya Rawat', '23CSE103', 'B.Tech', '3rd Year', 'B', 'joined', now() - interval '1 day'),
    ('Ananya Joshi', '23CSE104', 'B.Tech', '3rd Year', 'B', 'not_joined', NULL),
    ('Rohan Verma', '23CSE105', 'B.Tech', '3rd Year', 'A', 'joined', now() - interval '1 day'),
    ('Sneha Bhatt', '23CSE106', 'B.Tech', '3rd Year', 'B', 'not_joined', NULL),
    ('Aditya Negi', '23CSE107', 'B.Tech', '3rd Year', 'A', 'joined', now() - interval '3 hours'),
    ('Divya Sharma', '22BCA045', 'BCA', '2nd Year', 'A', 'not_joined', NULL),
    ('Vikram Thapa', '22BCA046', 'BCA', '2nd Year', 'B', 'joined', now() - interval '5 days'),
    ('Kavita Semwal', '24MCA012', 'MCA', '1st Year', 'A', 'not_joined', NULL),
    ('Siddharth Chauhan', '24MCA015', 'MCA', '1st Year', 'A', 'joined', now() - interval '4 days'),
    ('Meenakshi Nautiyal', '23CSE108', 'B.Tech', '3rd Year', 'A', 'not_joined', NULL)
ON CONFLICT (dd_no) DO NOTHING;
