export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  reviews_count: number;
  published_year: number;
  image: string;
  description: string;
  is_trending: boolean;
  is_top_rated: boolean;
  created_at?: string;
}

export type ReadingStatus = 'want-to-read' | 'currently-reading' | 'completed' | 'dropped';

export interface ReadingListEntry {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingStatus;
  progress_pages: number;
  total_pages: number;
  is_favorite: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  books?: Book; // Joined book details from query
}

export interface ReadingStats {
  booksCompleted: number;
  booksCurrentlyReading: number;
  booksWantToRead: number;
  booksDropped: number;
  totalPagesRead: number;
  totalBooks: number;
  streakDays: number;
  categoryDistribution: { category: string; count: number }[];
}
