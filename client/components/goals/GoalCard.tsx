import {
  Star,
  Camera,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@shared/api";
import { votePercent, resolveVoteLabel } from "@/lib/goalsApi";

function timeLeft(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Время вышло";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} д ${hours} ч`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} ч ${mins} мин`;
}

const statusColors: Record<string, string> = {
  active: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  pending_moderation: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  pending_vote: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  failed: "text-red-400 bg-red-400/10 border-red-400/20",
  expired: "text-red-400 bg-red-400/10 border-red-400/20",
};

const statusLabel: Record<string, string> = {
  active: "В процессе",
  pending_moderation: "Проверка ИИ",
  pending_vote: "Голосование",
  completed: "Выполнена ✓",
  failed: "Провалена",
  expired: "Истекла",
};

export interface GoalCardProps {
  goal: Goal;
  isOwn: boolean;
  hasVoted?: boolean;
  onVote: (id: string, vote: "yes" | "no") => void;
  onBack?: (id: string) => void; // New
  onSubmitProof: () => void;
  onDetail: () => void;
  animationDelay?: number;
}

export default function GoalCard({
  goal,
  isOwn,
  hasVoted,
  onVote,
  onBack, // New
  onSubmitProof,
  onDetail,
  animationDelay = 0,
}: GoalCardProps) {
  const pct = votePercent(goal.votesYes, goal.votesNo);
  const total = goal.votesYes + goal.votesNo;

  return (
    <div
      className="glass-surface-v2 overflow-hidden animate-fade-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src={goal.authorAvatar}
              alt={goal.authorName}
              className="w-9 h-9 rounded-full border border-white/10 flex-shrink-0"
            />
            <div>
              <p className="text-base font-semibold leading-none mb-0.5 tracking-tight">
                {goal.authorName}
              </p>
              <p className="text-caption">{timeLeft(goal.deadline)} осталось</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={cn(
                "text-[10px] font-semibold px-2 py-1 rounded-full border",
                statusColors[goal.status],
              )}
            >
              {statusLabel[goal.status]}
            </span>
            <button type="button" onClick={onDetail} className="text-white/30">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <h3 className="font-bold text-base mb-1 tracking-tight">{goal.title}</h3>
        {goal.description && (
          <p className="text-caption line-clamp-2">{goal.description}</p>
        )}

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-bold text-amber-400">
              Ставка: {goal.starsStaked} ⭐
            </span>
          </div>
          {goal.pot > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
              <Star size={10} className="text-emerald-400 fill-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400">
                Банк: +{goal.pot} ⭐
              </span>
            </div>
          )}
          {total > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5">
              <Users size={10} className="text-white/40" />
              <span className="text-[11px] text-white/40">{total} голосов</span>
            </div>
          )}
        </div>
      </div>

      {goal.proofImage && (
        <div className="mx-5 mb-4 rounded-2xl overflow-hidden">
          <img
            src={goal.proofImage}
            alt="proof"
            className="w-full h-40 object-cover"
          />
          {goal.proofDescription && (
            <div className="px-3 py-2 bg-white/5">
              <p className="text-xs text-white/70">{goal.proofDescription}</p>
            </div>
          )}
        </div>
      )}

      {goal.status === "pending_vote" && (
        <div className="px-5 pb-5">
          {total > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-caption mb-1">
                <span>✅ {goal.votesYes} Да</span>
                <span>{pct}% · {resolveVoteLabel(goal.votesYes, goal.votesNo)}</span>
                <span>❌ {goal.votesNo} Нет</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background:
                      pct > 50 && total >= 3
                        ? "linear-gradient(90deg, #10b981, #34d399)"
                        : "linear-gradient(90deg, #ef4444, #f87171)",
                  }}
                />
              </div>
            </div>
          )}

          {!isOwn && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onVote(goal.id, "yes")}
                disabled={hasVoted}
                className={cn(
                  "flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border",
                  hasVoted
                    ? "opacity-40 bg-white/5 border-white/10 text-white/40"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20",
                )}
              >
                <ThumbsUp size={12} />
                Да
              </button>
              <button
                type="button"
                onClick={() => onVote(goal.id, "no")}
                disabled={hasVoted}
                className={cn(
                  "flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border",
                  hasVoted
                    ? "opacity-40 bg-white/5 border-white/10 text-white/40"
                    : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20",
                )}
              >
                <ThumbsDown size={12} />
                Нет
              </button>
            </div>
          )}

          {isOwn && (
            <p className="text-xs text-center text-white/30">
              Ожидаем голосования (мин. 3 голоса, &gt;50% «Да»)
            </p>
          )}
        </div>
      )}

      {!isOwn && goal.status === "active" && onBack && (
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={() => onBack(goal.id)}
            className="w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
          >
            <Star size={14} className="fill-white" />
            Поддержать (от 5 ⭐)
          </button>
        </div>
      )}

      {isOwn && goal.status === "active" && (
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onSubmitProof}
            className="w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-amber-400/30 bg-amber-400/10 text-amber-300"
          >
            <Camera size={14} />
            Загрузить фото-отчёт
          </button>
        </div>
      )}

      {(goal.status === "completed" || goal.status === "failed") && (
        <div className="px-5 pb-5">
          <div
            className={cn(
              "rounded-2xl p-3 flex items-center gap-2",
              goal.status === "completed"
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-red-500/10 border border-red-500/20",
            )}
          >
            {goal.status === "completed" ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <XCircle size={16} className="text-red-400" />
            )}
            <p
              className={cn(
                "text-xs font-semibold",
                goal.status === "completed" ? "text-emerald-400" : "text-red-400",
              )}
            >
              {goal.status === "completed"
                ? `Цель выполнена! +${goal.starsStaked} ⭐ вернулись`
                : `Цель провалена. ${goal.starsStaked} ⭐ в фонд`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
