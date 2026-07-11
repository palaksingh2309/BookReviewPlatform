import { Book } from "./book";

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  content: string;
  is_spoiler: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    full_name: string | null;
  };
  books?: Book;
  user_has_liked?: boolean; // boolean indicating if current user liked this review
}

export interface ReviewAnalytics {
  averageRating: number;
  totalReviews: number;
  distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}
