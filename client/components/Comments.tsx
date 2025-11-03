import { useState, useEffect } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  liked: boolean;
}

interface CommentsProps {
  postId: string;
  onClose?: () => void;
}

export default function Comments({ postId, onClose }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useTelegram();

  const [newComment, setNewComment] = useState("");

  // Load comments on mount
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/posts/${postId}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.id) return;

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id.toString(),
          text: newComment.trim(),
          author: user.first_name || user.username || "Пользователь",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.comment]);
        setNewComment("");
      } else {
        alert("Ошибка при добавлении комментария");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Ошибка сети");
    }
  };

  const toggleCommentLike = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    );
  };

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-glass-light/10">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="text-primary" size={20} />
          Комментарии ({comments.length})
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <img
              src={comment.avatar}
              alt={comment.author}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{comment.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {comment.timestamp}
                  </p>
                </div>
              </div>
              <p className="text-sm mt-1 text-foreground">{comment.text}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => toggleCommentLike(comment.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Heart
                    size={14}
                    className={comment.liked ? "fill-red-500 text-red-500" : ""}
                  />
                  <span>{comment.likes > 0 ? comment.likes : ""}</span>
                </button>
                <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Ответить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment Input */}
      <div className="border-t border-glass-light/10 pt-4 flex gap-2">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser"
          alt="Your avatar"
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAddComment();
            }}
            placeholder="Добавить комментарий..."
            className="flex-1 glass-morphism rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="glass-button rounded-full p-2.5 bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
