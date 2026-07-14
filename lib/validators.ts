import { z } from "zod";

export const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupSchema = z.infer<typeof signupSchema>;
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const readingListSchema = z.object({
  status: z.enum(["want-to-read", "currently-reading", "completed", "dropped"]),
  progress_pages: z.number().min(0, "Pages read must be at least 0"),
  total_pages: z.number().min(1, "Total pages must be at least 1"),
  is_favorite: z.boolean(),
  notes: z.string().nullable().optional(),
});

export type ReadingListInput = z.infer<typeof readingListSchema>;

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  content: z.string().min(10, "Review content must be at least 10 characters long"),
  is_spoiler: z.boolean(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const postSchema = z.object({
  content: z.string().max(2000, "Content must not exceed 2000 characters").optional().nullable(),
  quote: z.string().max(1000, "Quote must not exceed 1000 characters").optional().nullable(),
  short_story: z.string().max(5000, "Short story must not exceed 5000 characters").optional().nullable(),
  book_reference_id: z.string().optional().nullable(),
  image_urls: z.array(z.string()).optional(),
}).refine((data) => {
  const hasContent = data.content && data.content.trim().length > 0;
  const hasQuote = data.quote && data.quote.trim().length > 0;
  const hasStory = data.short_story && data.short_story.trim().length > 0;
  return hasContent || hasQuote || hasStory;
}, {
  message: "A post must contain text content, a book quote, or a short story.",
  path: ["content"],
});

export type PostInput = z.infer<typeof postSchema>;

export const commentSchema = z.object({
  content: z.string().min(1, "Comment must not be empty").max(1000, "Comment must not exceed 1000 characters"),
  parent_id: z.string().uuid().optional().nullable(),
});

export type CommentInput = z.infer<typeof commentSchema>;

export const profileSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  full_name: z.string().max(100, "Full name must not exceed 100 characters").optional().nullable(),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional().nullable(),
  favorite_genre: z.string().optional().nullable(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

