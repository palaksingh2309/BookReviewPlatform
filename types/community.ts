export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  quote: string | null;
  short_story: string | null;
  book_reference_id: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  bookmarks_count: number;
  is_edited: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url?: string | null;
  } | null;
  
  post_images?: {
    id: string;
    image_url: string;
  }[];

  books?: {
    id: string;
    title: string;
    author: string;
    image: string | null;
  } | null;

  // Client states (augmented queries)
  user_has_liked?: boolean;
  user_has_bookmarked?: boolean;
  user_has_reposted?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;

  // Relations
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url?: string | null;
  } | null;
  
  replies?: PostComment[];
}

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string;
  type: "like" | "comment" | "share" | "mention";
  post_id: string;
  comment_id: string | null;
  read: boolean;
  created_at: string;

  // Relations
  sender_profile?: {
    username: string | null;
    full_name: string | null;
  } | null;

  posts?: {
    content: string | null;
    quote: string | null;
    short_story: string | null;
  } | null;
}

export interface Hashtag {
  id: string;
  name: string;
  count?: number;
}
