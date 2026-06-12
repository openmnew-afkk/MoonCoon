import { useState, useEffect } from "react";
import { Heart, Send } from "lucide-react";
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
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "0.5px solid var(--separator)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Комментарии ({comments.length})
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xl transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-3.5 mb-4 max-h-64 overflow-y-auto scrollbar-hide">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <img
              src={comment.avatar}
              alt={comment.author}
              className="w-8 h-8 rounded-full flex-shrink-0"
              style={{ border: "0.5px solid var(--separator)" }}
            />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{comment.author}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {comment.timestamp}
                  </p>
                </div>
              </div>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-primary)" }}>{comment.text}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => toggleCommentLike(comment.id)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: comment.liked ? "var(--red)" : "var(--text-secondary)" }}
                >
                  <Heart
                    size={13}
                    className={comment.liked ? "fill-[var(--red)]" : ""}
                  />
                  <span>{comment.likes > 0 ? comment.likes : ""}</span>
                </button>
                <button className="text-xs transition-colors" style={{ color: "var(--text-secondary)" }}>
                  Ответить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 flex gap-2" style={{ borderTop: "0.5px solid var(--separator)" }}>
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser"
          alt="Your avatar"
          className="w-8 h-8 rounded-full flex-shrink-0"
          style={{ border: "0.5px solid var(--separator)" }}
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
            className="ios-input flex-1 text-sm"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="rounded-full w-10 h-10 flex items-center justify-center transition-all disabled:opacity-30"
            style={{
              background: newComment.trim() ? "var(--blue)" : "var(--bg-tertiary)",
              color: newComment.trim() ? "#FFFFFF" : "var(--text-secondary)",
              border: `0.5px solid ${newComment.trim() ? "var(--blue)" : "var(--separator)"}`,
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
