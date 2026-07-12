-- Supabase SQL Schema for BookVerse Community Feed (Threads-style)
-- Run this in your Supabase SQL Editor.

-- =========================================================================
-- 1. Create Profiles Table (if not exists) & Add fields if missing
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    bio TEXT,
    favorite_genre TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles if not enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =========================================================================
-- 2. Create Community Feed Tables
-- =========================================================================

-- Posts Table (supporting text, quote, short story, book reference, and soft deletes)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    quote TEXT,
    short_story TEXT,
    book_reference_id TEXT REFERENCES public.books(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
    shares_count INTEGER DEFAULT 0 CHECK (shares_count >= 0),
    bookmarks_count INTEGER DEFAULT 0 CHECK (bookmarks_count >= 0),
    is_edited BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT post_empty_check CHECK (
        (content IS NOT NULL AND length(trim(content)) > 0) OR
        (quote IS NOT NULL AND length(trim(quote)) > 0) OR
        (short_story IS NOT NULL AND length(trim(short_story)) > 0)
    )
);

-- Post Images Table (supporting multiple images per post)
CREATE TABLE IF NOT EXISTS public.post_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments Table (supporting nested comments/replies)
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post Likes Table (preventing duplicate likes)
CREATE TABLE IF NOT EXISTS public.post_likes (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, post_id)
);

-- Post Bookmarks Table (preventing duplicate bookmarks)
CREATE TABLE IF NOT EXISTS public.post_bookmarks (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, post_id)
);

-- Post Shares/Reposts Table
CREATE TABLE IF NOT EXISTS public.post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, post_id)
);

-- Hashtags Table
CREATE TABLE IF NOT EXISTS public.hashtags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (name ~ '^[a-zA-Z0-9_]+$'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post Hashtags Association Table (many-to-many)
CREATE TABLE IF NOT EXISTS public.post_hashtags (
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, hashtag_id)
);

-- Post Mentions Table
CREATE TABLE IF NOT EXISTS public.post_mentions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (post_id, mentioned_user_id)
);

-- Notifications Table (with read status)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'share', 'mention')),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post Analytics Table (tracks views and engagement)
CREATE TABLE IF NOT EXISTS public.post_analytics (
    post_id UUID PRIMARY KEY REFERENCES public.posts(id) ON DELETE CASCADE,
    views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
    shares_count INTEGER DEFAULT 0 CHECK (shares_count >= 0),
    bookmarks_count INTEGER DEFAULT 0 CHECK (bookmarks_count >= 0)
);

-- =========================================================================
-- 3. Indexes for Search Performance and Joins
-- =========================================================================

-- Foreign keys and ordering btree indexes
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_desc_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_deleted_at_idx ON public.posts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS post_images_post_id_idx ON public.post_images(post_id);
CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS post_comments_parent_id_idx ON public.post_comments(parent_id);
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_bookmarks_user_id_post_id_idx ON public.post_bookmarks(user_id, post_id);
CREATE INDEX IF NOT EXISTS post_shares_post_id_idx ON public.post_shares(post_id);
CREATE INDEX IF NOT EXISTS hashtags_name_idx ON public.hashtags(name);
CREATE INDEX IF NOT EXISTS post_hashtags_hashtag_id_idx ON public.post_hashtags(hashtag_id);
CREATE INDEX IF NOT EXISTS post_mentions_user_id_idx ON public.post_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS notifications_recipient_id_read_idx ON public.notifications(recipient_id, read);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

-- GIN index for text search across content, quotes, and stories
CREATE INDEX IF NOT EXISTS posts_search_gin_idx ON public.posts 
    USING GIN (to_tsvector('english', coalesce(content, '') || ' ' || coalesce(quote, '') || ' ' || coalesce(short_story, '')));

-- Unique indexes to prevent duplicate notification cards (Deduplication)
CREATE UNIQUE INDEX IF NOT EXISTS unique_notification_like_share_mention 
    ON public.notifications (recipient_id, sender_id, type, post_id) 
    WHERE comment_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_notification_comment 
    ON public.notifications (recipient_id, sender_id, type, post_id, comment_id) 
    WHERE comment_id IS NOT NULL;

-- =========================================================================
-- 4. Enable Row Level Security (RLS) Policies
-- =========================================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Posts select policy" ON public.posts FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Posts insert policy" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Posts update policy" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Posts delete policy" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Post Images policies
CREATE POLICY "Post images select policy" ON public.post_images FOR SELECT USING (true);
CREATE POLICY "Post images insert policy" ON public.post_images FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
);
CREATE POLICY "Post images delete policy" ON public.post_images FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
);

-- Post Comments policies
CREATE POLICY "Comments select policy" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Comments insert policy" ON public.post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Comments update policy" ON public.post_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Comments delete policy" ON public.post_comments FOR DELETE TO authenticated USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
);

-- Post Likes policies
CREATE POLICY "Likes select policy" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Likes insert policy" ON public.post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Likes delete policy" ON public.post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Bookmarks select policy" ON public.post_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Bookmarks insert policy" ON public.post_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Bookmarks delete policy" ON public.post_bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Shares policies
CREATE POLICY "Shares select policy" ON public.post_shares FOR SELECT USING (true);
CREATE POLICY "Shares insert policy" ON public.post_shares FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Shares delete policy" ON public.post_shares FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Hashtags policies (viewable by all, insertable by authenticated users during post creations)
CREATE POLICY "Hashtags select policy" ON public.hashtags FOR SELECT USING (true);
CREATE POLICY "Hashtags insert policy" ON public.hashtags FOR INSERT TO authenticated WITH CHECK (true);

-- Post Hashtags policies
CREATE POLICY "Post hashtags select policy" ON public.post_hashtags FOR SELECT USING (true);
CREATE POLICY "Post hashtags insert/delete policy" ON public.post_hashtags FOR ALL TO authenticated USING (true);

-- Mentions policies
CREATE POLICY "Mentions select policy" ON public.post_mentions FOR SELECT USING (true);
CREATE POLICY "Mentions insert policy" ON public.post_mentions FOR INSERT TO authenticated WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Notifications select policy" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id);
CREATE POLICY "Notifications update policy" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
CREATE POLICY "Notifications delete policy" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = recipient_id);

-- Analytics policies
CREATE POLICY "Analytics select policy" ON public.post_analytics FOR SELECT USING (true);
CREATE POLICY "Analytics update policy" ON public.post_analytics FOR UPDATE TO authenticated USING (true);

-- =========================================================================
-- 5. Trigger Functions for Counters and Analytics
-- =========================================================================

-- Trigger to handle updated_at
DROP TRIGGER IF EXISTS handle_posts_updated_at ON public.posts;
CREATE TRIGGER handle_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_post_comments_updated_at ON public.post_comments;
CREATE TRIGGER handle_post_comments_updated_at BEFORE UPDATE ON public.post_comments
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Analytics Auto-initialization
CREATE OR REPLACE FUNCTION public.handle_post_created()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.post_analytics (post_id)
    VALUES (NEW.id)
    ON CONFLICT (post_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_created ON public.posts;
CREATE TRIGGER on_post_created
    AFTER INSERT ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_created();

-- Trigger for Post Likes count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        UPDATE public.post_analytics SET likes_count = likes_count + 1 WHERE post_id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
        UPDATE public.post_analytics SET likes_count = GREATEST(likes_count - 1, 0) WHERE post_id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON public.post_likes;
CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- Trigger for Post Comments count
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        UPDATE public.post_analytics SET comments_count = comments_count + 1 WHERE post_id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
        UPDATE public.post_analytics SET comments_count = GREATEST(comments_count - 1, 0) WHERE post_id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON public.post_comments;
CREATE TRIGGER trigger_update_post_comments_count
    AFTER INSERT OR DELETE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

-- Trigger for Post Shares count
CREATE OR REPLACE FUNCTION public.update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
        UPDATE public.post_analytics SET shares_count = shares_count + 1 WHERE post_id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET shares_count = GREATEST(shares_count - 1, 0) WHERE id = OLD.post_id;
        UPDATE public.post_analytics SET shares_count = GREATEST(shares_count - 1, 0) WHERE post_id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_shares_count ON public.post_shares;
CREATE TRIGGER trigger_update_post_shares_count
    AFTER INSERT OR DELETE ON public.post_shares
    FOR EACH ROW EXECUTE FUNCTION public.update_post_shares_count();

-- Trigger for Post Bookmarks count
CREATE OR REPLACE FUNCTION public.update_post_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.post_id;
        UPDATE public.post_analytics SET bookmarks_count = bookmarks_count + 1 WHERE post_id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET bookmarks_count = GREATEST(bookmarks_count - 1, 0) WHERE id = OLD.post_id;
        UPDATE public.post_analytics SET bookmarks_count = GREATEST(bookmarks_count - 1, 0) WHERE post_id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_bookmarks_count ON public.post_bookmarks;
CREATE TRIGGER trigger_update_post_bookmarks_count
    AFTER INSERT OR DELETE ON public.post_bookmarks
    FOR EACH ROW EXECUTE FUNCTION public.update_post_bookmarks_count();

-- =========================================================================
-- 6. Trigger Functions for Automated Notifications
-- =========================================================================

-- Like notification trigger
CREATE OR REPLACE FUNCTION public.handle_post_like_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
BEGIN
    SELECT user_id INTO v_post_owner_id FROM public.posts WHERE id = NEW.post_id;
    IF (v_post_owner_id IS NOT NULL AND v_post_owner_id != NEW.user_id) THEN
        INSERT INTO public.notifications (recipient_id, sender_id, type, post_id)
        VALUES (v_post_owner_id, NEW.user_id, 'like', NEW.post_id)
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_post_like_notification ON public.post_likes;
CREATE TRIGGER trigger_post_like_notification
    AFTER INSERT ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_like_notification();

-- Delete notification if liked is removed
CREATE OR REPLACE FUNCTION public.handle_post_unlike_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
BEGIN
    SELECT user_id INTO v_post_owner_id FROM public.posts WHERE id = OLD.post_id;
    IF (v_post_owner_id IS NOT NULL) THEN
        DELETE FROM public.notifications 
        WHERE recipient_id = v_post_owner_id 
          AND sender_id = OLD.user_id 
          AND type = 'like' 
          AND post_id = OLD.post_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_post_unlike_notification ON public.post_likes;
CREATE TRIGGER trigger_post_unlike_notification
    AFTER DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_unlike_notification();

-- Comment notification trigger
CREATE OR REPLACE FUNCTION public.handle_post_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_post_owner_id UUID;
    v_parent_comment_owner_id UUID;
BEGIN
    SELECT user_id INTO v_post_owner_id FROM public.posts WHERE id = NEW.post_id;
    
    -- If nested reply, notify parent comment owner
    IF (NEW.parent_id IS NOT NULL) THEN
        SELECT user_id INTO v_parent_comment_owner_id FROM public.post_comments WHERE id = NEW.parent_id;
        IF (v_parent_comment_owner_id IS NOT NULL AND v_parent_comment_owner_id != NEW.user_id) THEN
            INSERT INTO public.notifications (recipient_id, sender_id, type, post_id, comment_id)
            VALUES (v_parent_comment_owner_id, NEW.user_id, 'comment', NEW.post_id, NEW.id)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- Notify post owner if they aren't the comment creator and weren't already notified as parent owner
    IF (v_post_owner_id IS NOT NULL AND v_post_owner_id != NEW.user_id AND (v_parent_comment_owner_id IS NULL OR v_parent_comment_owner_id != v_post_owner_id)) THEN
        INSERT INTO public.notifications (recipient_id, sender_id, type, post_id, comment_id)
        VALUES (v_post_owner_id, NEW.user_id, 'comment', NEW.post_id, NEW.id)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_post_comment_notification ON public.post_comments;
CREATE TRIGGER trigger_post_comment_notification
    AFTER INSERT ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment_notification();

-- Mention notification trigger
CREATE OR REPLACE FUNCTION public.handle_post_mention_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_post_creator_id UUID;
BEGIN
    SELECT user_id INTO v_post_creator_id FROM public.posts WHERE id = NEW.post_id;
    IF (NEW.mentioned_user_id != v_post_creator_id) THEN
        INSERT INTO public.notifications (recipient_id, sender_id, type, post_id)
        VALUES (NEW.mentioned_user_id, v_post_creator_id, 'mention', NEW.post_id)
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_post_mention_notification ON public.post_mentions;
CREATE TRIGGER trigger_post_mention_notification
    AFTER INSERT ON public.post_mentions
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_mention_notification();

-- =========================================================================
-- 7. Supabase Storage Buckets and Security Policies
-- =========================================================================

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT TO authenticated 
    WITH CHECK (
        bucket_id = 'post-images' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'post-images' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );
