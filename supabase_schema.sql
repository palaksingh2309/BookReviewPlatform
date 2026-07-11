-- Supabase SQL Schema & Seeds for BookVerse Reading List and Reviews
-- Run this in your Supabase SQL Editor.

-- 1. Create Books Table if not exists
CREATE TABLE IF NOT EXISTS public.books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    rating NUMERIC(3,2) DEFAULT 0.00,
    reviews_count INTEGER DEFAULT 0,
    published_year INTEGER NOT NULL,
    image TEXT,
    description TEXT,
    is_trending BOOLEAN DEFAULT false,
    is_top_rated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- 2. Create Reading List Table
CREATE TABLE IF NOT EXISTS public.reading_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('want-to-read', 'currently-reading', 'completed', 'dropped')),
    progress_pages INTEGER DEFAULT 0 CHECK (progress_pages >= 0),
    total_pages INTEGER DEFAULT 100 CHECK (total_pages > 0),
    is_favorite BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT reading_list_progress_check CHECK (progress_pages <= total_pages),
    UNIQUE(user_id, book_id)
);

-- Enable RLS for reading list
ALTER TABLE public.reading_list ENABLE ROW LEVEL SECURITY;

-- 3. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    is_spoiler BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, book_id)
);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Create Review Likes Table
CREATE TABLE IF NOT EXISTS public.review_likes (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, review_id)
);

-- Enable RLS for review likes
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 5. RLS Policies
-- =========================================================================

-- Books policies
DROP POLICY IF EXISTS "Books are viewable by everyone" ON public.books;
CREATE POLICY "Books are viewable by everyone" ON public.books 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Books can only be modified by admins" ON public.books;
CREATE POLICY "Books can only be modified by admins" ON public.books 
    FOR ALL USING (false);

-- Reading list policies
DROP POLICY IF EXISTS "Reading list entries are viewable by owner only" ON public.reading_list;
CREATE POLICY "Reading list entries are viewable by owner only" ON public.reading_list 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Reading list entries can be inserted by owner" ON public.reading_list;
CREATE POLICY "Reading list entries can be inserted by owner" ON public.reading_list 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Reading list entries can be updated by owner" ON public.reading_list;
CREATE POLICY "Reading list entries can be updated by owner" ON public.reading_list 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Reading list entries can be deleted by owner" ON public.reading_list;
CREATE POLICY "Reading list entries can be deleted by owner" ON public.reading_list 
    FOR DELETE USING (auth.uid() = user_id);

-- Reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Reviews can be inserted by owner" ON public.reviews;
CREATE POLICY "Reviews can be inserted by owner" ON public.reviews 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Reviews can be updated by owner" ON public.reviews;
CREATE POLICY "Reviews can be updated by owner" ON public.reviews 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Reviews can be deleted by owner" ON public.reviews;
CREATE POLICY "Reviews can be deleted by owner" ON public.reviews 
    FOR DELETE USING (auth.uid() = user_id);

-- Review likes policies
DROP POLICY IF EXISTS "Review likes are viewable by everyone" ON public.review_likes;
CREATE POLICY "Review likes are viewable by everyone" ON public.review_likes 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Review likes can be inserted by owner" ON public.review_likes;
CREATE POLICY "Review likes can be inserted by owner" ON public.review_likes 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Review likes can be deleted by owner" ON public.review_likes;
CREATE POLICY "Review likes can be deleted by owner" ON public.review_likes 
    FOR DELETE USING (auth.uid() = user_id);

-- =========================================================================
-- 6. Trigger Functions
-- =========================================================================

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hook update triggers
DROP TRIGGER IF EXISTS handle_reading_list_updated_at ON public.reading_list;
CREATE TRIGGER handle_reading_list_updated_at BEFORE UPDATE ON public.reading_list
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_reviews_updated_at ON public.reviews;
CREATE TRIGGER handle_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger function to update books stats (rating & reviews count)
CREATE OR REPLACE FUNCTION public.update_book_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_book_id TEXT;
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        v_book_id := NEW.book_id;
    ELSIF (TG_OP = 'DELETE') THEN
        v_book_id := OLD.book_id;
    END IF;

    UPDATE public.books
    SET 
        rating = COALESCE((SELECT ROUND(AVG(rating), 2)::NUMERIC(3,2) FROM public.reviews WHERE book_id = v_book_id), 0.00),
        reviews_count = (SELECT COUNT(*)::INTEGER FROM public.reviews WHERE book_id = v_book_id)
    WHERE id = v_book_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hook book stats triggers
DROP TRIGGER IF EXISTS trigger_update_book_stats ON public.reviews;
CREATE TRIGGER trigger_update_book_stats
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_book_stats();

-- Trigger function to update reviews likes count
CREATE OR REPLACE FUNCTION public.update_review_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.reviews
        SET likes_count = likes_count + 1
        WHERE id = NEW.review_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.reviews
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.review_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hook review likes triggers
DROP TRIGGER IF EXISTS trigger_update_review_likes_count ON public.review_likes;
CREATE TRIGGER trigger_update_review_likes_count
AFTER INSERT OR DELETE ON public.review_likes
FOR EACH ROW EXECUTE FUNCTION public.update_review_likes_count();

-- =========================================================================
-- 7. Seed Data for Books
-- =========================================================================

INSERT INTO public.books (id, title, author, category, rating, reviews_count, published_year, image, description, is_trending, is_top_rated)
VALUES
(
    'atomic-habits',
    'Atomic Habits',
    'James Clear',
    'Self Improvement',
    4.90,
    28450,
    2018,
    'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    'A practical guide to building good habits, breaking bad ones, and making tiny changes that lead to remarkable results. It explains the neurology behind habit formation and offers concrete tools.',
    true,
    true
),
(
    'the-psychology-of-money',
    'The Psychology of Money',
    'Morgan Housel',
    'Finance',
    4.90,
    15430,
    2020,
    'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
    'Doing well with money isn''t necessarily about what you know. It''s about how you behave. Explores how emotions, behavior, and mindset influence financial success.',
    true,
    true
),
(
    'the-hobbit',
    'The Hobbit',
    'J.R.R. Tolkien',
    'Fiction',
    4.90,
    31200,
    1937,
    'https://covers.openlibrary.org/b/isbn/9780261103344-L.jpg',
    'A fantasy novel about the quest of Bilbo Baggins to win a share of the treasure guarded by Smaug the dragon. It serves as the prelude to the epic Lord of the Rings trilogy.',
    false,
    true
),
(
    'the-alchemist',
    'The Alchemist',
    'Paulo Coelho',
    'Fiction',
    4.80,
    19800,
    1988,
    'https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg',
    'A timeless story about following your dreams, discovering your purpose, and listening to your heart. It follows a young Andalusian shepherd boy on his journey to Egypt.',
    false,
    true
),
(
    'deep-work',
    'Deep Work',
    'Cal Newport',
    'Productivity',
    4.80,
    9820,
    2016,
    'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
    'Rules for focused success in a distracted world. Master the ability to focus deeply without distraction, allowing you to quickly master complicated information and produce better results.',
    true,
    true
),
(
    'think-like-a-monk',
    'Think Like a Monk',
    'Jay Shetty',
    'Mindfulness',
    4.80,
    11450,
    2020,
    'https://covers.openlibrary.org/b/isbn/9781982134488-L.jpg',
    'Practical wisdom inspired by monk life to reduce stress, improve relationships, and find purpose. He shows how to overcome negative thoughts and find peace within ourselves.',
    false,
    true
),
(
    'dune',
    'Dune',
    'Frank Herbert',
    'Science Fiction',
    4.80,
    25400,
    1965,
    'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
    'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who would become the mysterious man known as Muad''Dib, embarking on a journey to avenge his family.',
    true,
    true
),
(
    'educated',
    'Educated',
    'Tara Westover',
    'Biography',
    4.70,
    16800,
    2018,
    'https://covers.openlibrary.org/b/isbn/9780399588174-L.jpg',
    'An unforgettable memoir about a young girl who, kept out of school by her survivalist family in rural Idaho, leaves her home at seventeen and earns a PhD from Cambridge University.',
    false,
    false
),
(
    'rich-dad-poor-dad',
    'Rich Dad Poor Dad',
    'Robert T. Kiyosaki',
    'Finance',
    4.70,
    22100,
    1997,
    'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg',
    'Advocates for financial literacy, financial independence, and building wealth through investing in assets, real estate, starting businesses, and increasing financial intelligence.',
    false,
    false
),
(
    'zero-to-one',
    'Zero to One',
    'Peter Thiel',
    'Finance',
    4.60,
    13900,
    2014,
    'https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg',
    'Notes on startups, or how to build the future. Explores how unique value creation and building creative monopolies are the keys to successful, game-changing business endeavors.',
    false,
    false
)
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title,
    author = EXCLUDED.author,
    category = EXCLUDED.category,
    published_year = EXCLUDED.published_year,
    image = EXCLUDED.image,
    description = EXCLUDED.description,
    is_trending = EXCLUDED.is_trending,
    is_top_rated = EXCLUDED.is_top_rated;
