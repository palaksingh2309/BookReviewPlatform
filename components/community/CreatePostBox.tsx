"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Image as ImageIcon, 
  Quote, 
  BookOpen, 
  FileText, 
  X, 
  Loader2, 
  Sparkles, 
  Trash2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { getBooks } from "../../services/books";
import { createPostAction } from "../../actions/community";
import { Book } from "../../types/book";
import { Post } from "../../types/community";
import { supabase } from "../../lib/supabase";

interface CreatePostBoxProps {
  onPostCreated: (post?: Post) => void;
  userInitials: string;
}

export default function CreatePostBox({ onPostCreated, userInitials }: CreatePostBoxProps) {
  const [content, setContent] = useState("");
  const [quote, setQuote] = useState("");
  const [shortStory, setShortStory] = useState("");
  
  // Section Toggles
  const [showQuote, setShowQuote] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showBookSelect, setShowBookSelect] = useState(false);
  
  // Books reference autocomplete
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  // Images state
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load books catalog on mount
  useEffect(() => {
    async function loadBooks() {
      const { data } = await getBooks();
      setBooksList(data || []);
    }
    loadBooks();
  }, []);

  // Filter books autocomplete
  useEffect(() => {
    if (!bookSearchQuery.trim()) {
      setFilteredBooks([]);
      return;
    }
    const q = bookSearchQuery.toLowerCase();
    const filtered = booksList.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
    );
    setFilteredBooks(filtered.slice(0, 5));
  }, [bookSearchQuery, booksList]);

  // Image Selection Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Check max 4 images limit
    if (images.length + files.length > 4) {
      setError("You can only upload up to 4 images per post.");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setImages((prev) => [...prev, ...newImages]);
    setError(null);
  };

  const removeSelectedImage = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  // Upload Images to Supabase Storage
  const uploadImages = async (userId: string): Promise<string[]> => {
    const urls: string[] = [];
    setUploading(true);

    try {
      for (const img of images) {
        const fileExt = img.file.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, img.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload ${img.file.name}: ${uploadError.message}`);
        }

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from("post-images")
            .getPublicUrl(data.path);
          urls.push(publicUrl);
        }
      }
      return urls;
    } finally {
      setUploading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate empty post content
    if (!content.trim() && !quote.trim() && !shortStory.trim()) {
      setError("Please write some text, quote, or a short story before sharing.");
      setSubmitting(false);
      return;
    }

    try {
      // 1. Fetch current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to create a post.");
        setSubmitting(false);
        return;
      }

      // 2. Upload images if any
      let image_urls: string[] = [];
      if (images.length > 0) {
        try {
          image_urls = await uploadImages(user.id);
        } catch (uploadErr: any) {
          setError(uploadErr.message || "Failed to upload images. Please try again.");
          setSubmitting(false);
          return;
        }
      }

      // 3. Dispatch Server Action
      const response = await createPostAction({
        content: content.trim() || null,
        quote: showQuote && quote.trim() ? quote.trim() : null,
        short_story: showStory && shortStory.trim() ? shortStory.trim() : null,
        book_reference_id: selectedBook ? selectedBook.id : null,
        image_urls,
      });

      if (!response.success) {
        setError(response.error || "An unexpected error occurred while posting.");
      } else {
        // Clear all fields on success
        setContent("");
        setQuote("");
        setShortStory("");
        setSelectedBook(null);
        setBookSearchQuery("");
        setShowQuote(false);
        setShowStory(false);
        setShowBookSelect(false);
        // Clear previews
        images.forEach((img) => URL.revokeObjectURL(img.preview));
        setImages([]);
        onPostCreated(response.data ?? undefined);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-xl transition hover:border-white/15">
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          {/* User Initials Avatar */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 font-semibold text-white text-sm ring-2 ring-neutral-800 shadow-md">
            {userInitials}
          </div>

          <div className="flex-1 space-y-3">
            {/* Primary Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What are you reading today? Share thoughts or tags like #scifi..."
              rows={3}
              maxLength={2000}
              className="w-full bg-transparent text-white placeholder:text-neutral-500 border-none outline-none focus:ring-0 resize-none text-base leading-relaxed"
            />

            {/* Optional Quote Form Block */}
            {showQuote && (
              <div className="relative rounded-xl border border-white/10 bg-black/40 p-4 transition-all duration-300">
                <button
                  type="button"
                  onClick={() => setShowQuote(false)}
                  className="absolute right-2 top-2 rounded-full p-1 text-neutral-400 transition hover:bg-white/5 hover:text-white"
                  title="Remove quote"
                >
                  <X size={16} />
                </button>
                <div className="flex gap-2.5 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-2 items-center">
                  <Quote size={12} />
                  Book Quote
                </div>
                <textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="&ldquo;Enter a memorable book quote here...&rdquo;"
                  rows={2}
                  maxLength={1000}
                  className="w-full bg-transparent text-white placeholder:text-neutral-500 border-none outline-none focus:ring-0 resize-none italic text-sm leading-relaxed"
                />
              </div>
            )}

            {/* Optional Short Story Form Block */}
            {showStory && (
              <div className="relative rounded-xl border border-white/10 bg-black/40 p-4 transition-all duration-300">
                <button
                  type="button"
                  onClick={() => setShowStory(false)}
                  className="absolute right-2 top-2 rounded-full p-1 text-neutral-400 transition hover:bg-white/5 hover:text-white"
                  title="Remove story"
                >
                  <X size={16} />
                </button>
                <div className="flex gap-2.5 text-pink-400 font-semibold text-xs uppercase tracking-wider mb-2 items-center">
                  <FileText size={12} />
                  Short Story / Micro-fiction
                </div>
                <textarea
                  value={shortStory}
                  onChange={(e) => setShortStory(e.target.value)}
                  placeholder="Pen your micro-fiction or short review story..."
                  rows={4}
                  maxLength={5000}
                  className="w-full bg-transparent text-white placeholder:text-neutral-500 border-none outline-none focus:ring-0 resize-none text-sm leading-relaxed"
                />
              </div>
            )}

            {/* Optional Book Reference Picker */}
            {showBookSelect && (
              <div className="relative rounded-xl border border-white/10 bg-black/40 p-4 transition-all duration-300">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookSelect(false);
                    setSelectedBook(null);
                  }}
                  className="absolute right-2 top-2 rounded-full p-1 text-neutral-400 transition hover:bg-white/5 hover:text-white"
                  title="Remove book reference"
                >
                  <X size={16} />
                </button>
                <div className="flex gap-2.5 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-2 items-center">
                  <BookOpen size={12} />
                  Book Reference
                </div>

                {!selectedBook ? (
                  <div className="relative mt-2">
                    <input
                      type="text"
                      value={bookSearchQuery}
                      onChange={(e) => setBookSearchQuery(e.target.value)}
                      placeholder="Search books in our catalog (e.g. Hobbit)..."
                      className="w-full rounded-lg border border-white/10 bg-neutral-900/50 px-3.5 py-2 text-sm text-white outline-none focus:border-indigo-400/50 placeholder:text-neutral-500"
                    />
                    
                    {filteredBooks.length > 0 && (
                      <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-neutral-900 p-1 shadow-2xl">
                        {filteredBooks.map((book) => (
                          <button
                            key={book.id}
                            type="button"
                            onClick={() => {
                              setSelectedBook(book);
                              setBookSearchQuery("");
                              setFilteredBooks([]);
                            }}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-neutral-200 transition hover:bg-white/5 hover:text-white"
                          >
                            {book.image && (
                              <img
                                src={book.image}
                                alt={book.title}
                                className="h-8 w-6 rounded bg-neutral-800 object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold leading-none">{book.title}</p>
                              <p className="text-xs text-neutral-500 mt-1">{book.author}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg bg-neutral-900/50 p-2.5 border border-white/5 mt-2">
                    <div className="flex items-center gap-3">
                      {selectedBook.image && (
                        <img
                          src={selectedBook.image}
                          alt={selectedBook.title}
                          className="h-10 w-7 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-white leading-tight">{selectedBook.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{selectedBook.author}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedBook(null)}
                      className="rounded-lg bg-white/5 p-1.5 text-neutral-400 hover:text-white transition"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Images Previews Grid (Handles up to 4 images beautifully) */}
            {images.length > 0 && (
              <div className={`grid gap-2.5 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-video overflow-hidden rounded-xl border border-white/5 bg-neutral-900 group">
                    <img
                      src={img.preview}
                      alt="Upload preview"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white/80 hover:bg-black/80 hover:text-white transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Toolbar & Submit Button */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-1.5">
            {/* Image Selector Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 4 || uploading || submitting}
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:bg-white/5 hover:text-indigo-400 transition disabled:opacity-30 disabled:pointer-events-none"
              title="Add images (Max 4)"
            >
              <ImageIcon size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="hidden"
            />

            {/* Quote Toggle */}
            <button
              type="button"
              onClick={() => setShowQuote(!showQuote)}
              disabled={submitting}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                showQuote 
                  ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20" 
                  : "text-neutral-400 hover:bg-white/5 hover:text-indigo-400"
              }`}
              title="Add quote block"
            >
              <Quote size={18} />
            </button>

            {/* Story Toggle */}
            <button
              type="button"
              onClick={() => setShowStory(!showStory)}
              disabled={submitting}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                showStory 
                  ? "bg-pink-500/10 text-pink-400 ring-1 ring-pink-500/20" 
                  : "text-neutral-400 hover:bg-white/5 hover:text-pink-400"
              }`}
              title="Add short story block"
            >
              <FileText size={18} />
            </button>

            {/* Book Reference Toggle */}
            <button
              type="button"
              onClick={() => setShowBookSelect(!showBookSelect)}
              disabled={submitting}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                showBookSelect 
                  ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" 
                  : "text-neutral-400 hover:bg-white/5 hover:text-emerald-400"
              }`}
              title="Reference a book"
            >
              <BookOpen size={18} />
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              submitting || 
              uploading || 
              (!content.trim() && !quote.trim() && !shortStory.trim())
            }
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading Media...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Share
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
