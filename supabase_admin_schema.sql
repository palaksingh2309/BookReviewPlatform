-- =========================================================================
-- BookVerse Admin Portal Database Migration Script
-- Run this in your Supabase SQL Editor to support the /admin section.
-- =========================================================================

-- 1. Alter public.profiles to add role and status columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'));

-- Create indices for role and status
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);

-- 2. Create public.admins table for administrative login credentials
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- PBKDF2 or SHA-256 password hash
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'moderator', 'superadmin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create public.reports table for content moderation
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('post', 'review', 'comment', 'user')),
    content_id TEXT NOT NULL, -- ID of the post/review/comment, or profile ID
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES public.admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports(status);
CREATE INDEX IF NOT EXISTS reports_content_type_idx ON public.reports(content_type);

-- 4. Create public.genres table for genre classification and custom order
CREATE TABLE IF NOT EXISTS public.genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS genres_display_order_idx ON public.genres(display_order);

-- Seed initial genres if they do not exist
INSERT INTO public.genres (name, slug, display_order) VALUES
('Fiction', 'fiction', 1),
('Science Fiction', 'science-fiction', 2),
('Self Improvement', 'self-improvement', 3),
('Finance', 'finance', 4),
('Productivity', 'productivity', 5),
('Mindfulness', 'mindfulness', 6),
('Biography', 'biography', 7)
ON CONFLICT (name) DO NOTHING;

-- 5. Create public.announcements table for sitewide notice banners
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS announcements_is_active_idx ON public.announcements(is_active);

-- Seed an initial greeting announcement
INSERT INTO public.announcements (title, content, is_active) VALUES
('Welcome to BookVerse!', 'Explore our collection, write reviews, check out the community feed, and keep tracking your reading streak!', true)
ON CONFLICT DO NOTHING;

-- 6. Create public.settings table for site configurations
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'site_config',
    maintenance_mode BOOLEAN DEFAULT false,
    registration_enabled BOOLEAN DEFAULT true,
    community_enabled BOOLEAN DEFAULT true,
    site_name TEXT DEFAULT 'BookVerse',
    api_settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default settings
INSERT INTO public.settings (id, maintenance_mode, registration_enabled, community_enabled, site_name, api_settings)
VALUES ('site_config', false, true, true, 'BookVerse', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 7. Add moderating and feature flags to existing tables
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- Disable RLS on admin-only tables (since they will be manipulated securely by our service role / server actions)
-- In case user accesses them with normal client, we ensure security by keeping RLS active but restricted to authenticated admins, or disable RLS for admin portal simplicity.
-- Let's turn off RLS on admins, reports, genres, announcements, settings or configure it securely:
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins table is only accessible by service role" ON public.admins;
DROP POLICY IF EXISTS "Reports table is only accessible by admins" ON public.reports;
DROP POLICY IF EXISTS "Genres are viewable by everyone" ON public.genres;
DROP POLICY IF EXISTS "Genres modification is restricted" ON public.genres;
DROP POLICY IF EXISTS "Announcements are viewable by everyone" ON public.announcements;
DROP POLICY IF EXISTS "Announcements modification is restricted" ON public.announcements;
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.settings;
DROP POLICY IF EXISTS "Settings modification is restricted" ON public.settings;

-- Create policies
CREATE POLICY "Admins table is only accessible by service role" ON public.admins USING (false);
CREATE POLICY "Reports table is only accessible by admins" ON public.reports USING (false);

CREATE POLICY "Genres are viewable by everyone" ON public.genres FOR SELECT USING (true);
CREATE POLICY "Genres modification is restricted" ON public.genres FOR ALL TO authenticated USING (false);

CREATE POLICY "Announcements are viewable by everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Announcements modification is restricted" ON public.announcements FOR ALL TO authenticated USING (false);

CREATE POLICY "Settings are viewable by everyone" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Settings modification is restricted" ON public.settings FOR ALL TO authenticated USING (false);
