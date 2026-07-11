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