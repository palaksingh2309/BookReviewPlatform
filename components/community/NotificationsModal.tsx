"use client";

import { useEffect, useState } from "react";
import { 
  X, 
  Loader2, 
  Heart, 
  MessageSquare, 
  Repeat, 
  AtSign, 
  Bell, 
  Check,
  CheckCheck
} from "lucide-react";
import { Notification } from "../../types/community";
import { getNotifications } from "../../services/community";
import { markNotificationsAsReadAction } from "../../actions/community";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick: (postId: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  onNotificationClick,
  onUnreadCountChange
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  useEffect(() => {
    if (!isOpen) return;

    async function loadNotifications() {
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await getNotifications();
        if (err) {
          setError("Failed to load notifications.");
        } else {
          setNotifications(data || []);
        }
      } catch {
        setError("Failed to fetch notifications.");
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingRead) return;
    setMarkingRead(true);

    try {
      const res = await markNotificationsAsReadAction();
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
      } else {
        setError(res.error || "Failed to mark notifications as read.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setMarkingRead(false);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Heart size={14} className="fill-red-500/10" />
          </span>
        );
      case "comment":
        return (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
            <MessageSquare size={14} />
          </span>
        );
      case "share":
        return (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <Repeat size={14} />
          </span>
        );
      case "mention":
        return (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
            <AtSign size={14} />
          </span>
        );
    }
  };

  const getNotificationText = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return "liked your post";
      case "comment":
        return "replied to your thread";
      case "share":
        return "shared your post";
      case "mention":
        return "mentioned you in a post";
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative flex h-[80vh] w-full max-w-md flex-col rounded-3xl border border-white/10 bg-neutral-950 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4.5">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <Bell className="h-4.5 w-4.5 text-indigo-400" />
            Activity Feed
            {unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white leading-none">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingRead}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-white transition disabled:opacity-40"
                title="Mark all as read"
              >
                {markingRead ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck size={14} />
                )}
                Mark read
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full bg-white/5 p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List content */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-2">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500 space-y-3">
              <Bell className="h-9 w-9 text-neutral-700" />
              <p className="text-sm font-medium">Quiet here...</p>
              <p className="text-xs text-neutral-600 max-w-[200px]">When users interact with your community posts, they will show up here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const senderName = n.sender_profile?.full_name || n.sender_profile?.username || "Someone";
                const initials = senderName.substring(0, 2).toUpperCase();
                const snippet = n.posts?.content || n.posts?.quote || n.posts?.short_story || "attachment";
                
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      onNotificationClick(n.post_id);
                      onClose();
                    }}
                    className={`flex gap-3.5 rounded-2xl border border-white/5 p-4.5 cursor-pointer transition hover:border-white/10 hover:bg-white/[0.02] ${
                      !n.read 
                        ? "bg-indigo-500/[0.02] border-indigo-500/20" 
                        : "bg-neutral-900/10"
                    }`}
                  >
                    {/* Icon & Profile initials */}
                    <div className="relative shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 border border-white/10 font-bold text-white text-xs">
                        {initials}
                      </div>
                      <span className="absolute -bottom-1 -right-1 block">
                        {getNotificationIcon(n.type)}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <p className="text-neutral-300 font-semibold truncate">
                          <span className="text-white font-bold">{senderName}</span>{" "}
                          {getNotificationText(n.type)}
                        </p>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-neutral-500 text-xs italic truncate max-w-[250px]">
                        &ldquo;{snippet}&rdquo;
                      </p>
                      <p className="text-[10px] text-neutral-600">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
