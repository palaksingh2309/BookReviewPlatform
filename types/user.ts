export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  favorite_genre: string | null;
  created_at?: string;
  updated_at?: string;
}
