import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { fetchGoals, voteGoal } from "@/lib/goalsApi";
import type { Goal } from "@shared/api";
import GoalCard from "@/components/goals/GoalCard";

export default function PhotoReports() {
  const { user } = useTelegram();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<Goal | null>(null);

  const load = useCallback(async () => {
    const list = await fetchGoals({ feed: "photo-reports" });
    setGoals(list);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleVote = async (goalId: string, vote: "yes" | "no") => {
    if (!user?.id) return;
    const result = await voteGoal(goalId, String(user.id), vote);
    if ("error" in result) {
      alert(result.error);
      return;
    }
    setVotedIds((prev) => new Set(prev).add(goalId));
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? result.goal : g)),
    );
    if (detail?.id === goalId) setDetail(result.goal);
  };

  return (
    <div className="min-h-screen bg-background">
      <header
        className="fixed top-0 left-0 right-0 z-30 border-b border-white/5 glass-morphism"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/profile"
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-bold">Фотоотчёты</h1>
            <p className="text-caption">
              Голосуй: &gt;50% «Да» и минимум 3 голоса
            </p>
          </div>
          <Camera className="text-accent" size={22} />
        </div>
      </header>

      <div
        className="max-w-2xl mx-auto px-4 pb-28 section-gap"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 5rem)" }}
      >
        {goals.length === 0 ? (
          <div className="glass-surface-v2 p-8 text-center animate-fade-up">
            <p className="text-sm text-white/50">
              Нет активных фотоотчётов на голосовании
            </p>
            <Link
              to="/goals"
              className="inline-block mt-3 text-sm text-primary font-medium"
            >
              Перейти к целям →
            </Link>
          </div>
        ) : (
          goals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isOwn={goal.userId === String(user?.id)}
              hasVoted={
                votedIds.has(goal.id) ||
                goal.voterIds?.includes(String(user?.id))
              }
              onVote={handleVote}
              onSubmitProof={() => {}}
              onDetail={() => setDetail(goal)}
              animationDelay={i * 50}
            />
          ))
        )}
      </div>

      {detail && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end"
          onClick={() => setDetail(null)}
          onKeyDown={() => {}}
          role="presentation"
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-6 pb-10 glass-surface-v2 border-t border-white/10 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={() => {}}
            role="dialog"
          >
            <h2 className="text-lg font-bold mb-2">{detail.title}</h2>
            <p className="text-caption mb-4">{detail.proofDescription}</p>
            {detail.proofImage && (
              <img
                src={detail.proofImage}
                alt=""
                className="w-full rounded-2xl mb-4 max-h-64 object-cover"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
