import { useState, useRef, useEffect, useCallback } from "react";
import { Target, Plus, X, Camera } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import type { Goal } from "@shared/api";
import GoalCard from "@/components/goals/GoalCard";
import {
  fetchGoals,
  createGoal,
  submitProof,
  voteGoal,
  ensureDemoBalance,
} from "@/lib/goalsApi";

export default function Goals() {
  const { user } = useTelegram();
  const userId = user?.id ? String(user.id) : "";
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tab, setTab] = useState<"community" | "my">("community");
  const [showCreate, setShowCreate] = useState(false);
  const [showProof, setShowProof] = useState<string | null>(null);
  const [starsBalance, setStarsBalance] = useState(0);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [starsInput, setStarsInput] = useState("500");
  const [starsError, setStarsError] = useState("");
  const [newDays, setNewDays] = useState(7);
  const [creating, setCreating] = useState(false);

  const [proofImg, setProofImg] = useState<string | null>(null);
  const [proofDesc, setProofDesc] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);
  const proofFileRef = useRef<HTMLInputElement>(null);

  const loadGoals = useCallback(async () => {
    const all = await fetchGoals();
    setGoals(all);
  }, []);

  const loadBalance = useCallback(async () => {
    if (!userId) return;
    await ensureDemoBalance(userId);
    const res = await fetch(`/api/stars/balance?userId=${userId}`);
    if (res.ok) {
      const d = await res.json();
      setStarsBalance(d.balance ?? 0);
    }
  }, [userId]);

  useEffect(() => {
    loadGoals();
    loadBalance();
  }, [loadGoals, loadBalance]);

  const parsedStars = () => {
    const n = parseInt(starsInput.replace(/\s/g, ""), 10);
    return Number.isFinite(n) ? n : NaN;
  };

  const handleCreate = async () => {
    const newStars = parsedStars();
    if (!newTitle.trim() || !userId) return;
    if (Number.isNaN(newStars) || newStars < 100) {
      setStarsError("Минимум 100 звёзд");
      return;
    }
    setStarsError("");
    if (newStars > starsBalance) {
      alert("Недостаточно звёзд на балансе!");
      return;
    }
    setCreating(true);
    const result = await createGoal({
      userId,
      authorName: user?.first_name || "Вы",
      authorAvatar: user?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      title: newTitle,
      description: newDesc,
      starsStaked: newStars,
      deadlineDays: newDays,
    });
    setCreating(false);
    if ("error" in result) { alert(result.error); return; }
    setStarsBalance(result.balance);
    setShowCreate(false);
    setNewTitle(""); setNewDesc(""); setStarsInput("500");
    setTab("my");
    await loadGoals();
  };

  const handleVote = async (goalId: string, vote: "yes" | "no") => {
    if (!userId) return;
    const result = await voteGoal(goalId, userId, vote);
    if ("error" in result) { alert(result.error); return; }
    setVotedIds((prev) => new Set(prev).add(goalId));
    setGoals((prev) => prev.map((g) => (g.id === goalId ? result.goal : g)));
    await loadBalance();
  };

  const handleSubmitProof = async (goalId: string) => {
    if (!proofImg || !proofDesc.trim() || !userId) { alert("Загрузите фото и описание"); return; }
    setSubmittingProof(true);
    const result = await submitProof(goalId, userId, proofImg, proofDesc);
    setSubmittingProof(false);
    if ("error" in result) { alert(result.error); setShowProof(null); setProofImg(null); setProofDesc(""); await loadGoals(); await loadBalance(); return; }
    setShowProof(null); setProofImg(null); setProofDesc("");
    await loadGoals();
  };

  const filtered = tab === "my" ? goals.filter((g) => g.userId === userId) : goals.filter((g) => g.userId !== userId);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="fixed top-0 left-0 right-0 z-30 ios-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--yellow)" }}>
                <Target size={16} style={{ color: "#000" }} />
              </div>
              <div>
                <h1 className="ios-title-large">Цели</h1>
                <p className="ios-caption">Баланс: {starsBalance} ⭐</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowCreate(true)}
              className="ios-btn">
              <Plus size={14} /> Создать
            </button>
          </div>
          <div className="flex gap-1 rounded-xl p-1" style={{ background: "var(--bg-secondary)" }}>
            {(["community", "my"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={{
                  background: tab === t ? "var(--bg-tertiary)" : "transparent",
                  color: tab === t ? "var(--text-primary)" : "var(--text-secondary)",
                }}>
                {t === "community" ? "Сообщество" : "Мои цели"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-28"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 8rem)" }}>
        {filtered.length === 0 ? (
          <div className="ios-card p-8 text-center">
            <Target size={36} className="mx-auto mb-3" style={{ color: "var(--text-tertiary)" }} />
            <p className="ios-body" style={{ color: "var(--text-secondary)" }}>
              {tab === "my" ? "Создай первую цель" : "Цели сообщества появятся здесь"}
            </p>
          </div>
        ) : (
          filtered.map((goal, i) => (
            <GoalCard key={goal.id} goal={goal} isOwn={goal.userId === userId}
              hasVoted={votedIds.has(goal.id) || goal.voterIds?.includes(userId)}
              onVote={handleVote} onSubmitProof={() => setShowProof(goal.id)}
              onDetail={() => {}} animationDelay={i * 45} />
          ))
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end ios-blur"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowCreate(false)} role="presentation">
          <div className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
            style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--separator)" }}
            onClick={(e) => e.stopPropagation()} role="dialog">
            <h2 className="ios-title-large mb-4">Новая цель</h2>
            <div className="space-y-4">
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Например: Пробежать 10 км"
                className="ios-input" />
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} placeholder="Описание..."
                className="ios-input resize-none" />
              <div>
                <label className="ios-caption block mb-1.5">Ставка (мин. 100 ⭐)</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {[100, 250, 500, 1000, 5000].map((amt) => (
                    <button key={amt} type="button" onClick={() => { setStarsInput(String(amt)); setStarsError(""); }}
                      className="ios-badge touch-manipulation"
                      style={{
                        background: parsedStars() === amt ? "var(--bg-quaternary)" : "var(--bg-tertiary)",
                        color: parsedStars() === amt ? "var(--yellow)" : "var(--text-secondary)",
                      }}>
                      {amt} ⭐
                    </button>
                  ))}
                </div>
                <input type="text" inputMode="numeric" value={starsInput}
                  onChange={(e) => { setStarsInput(e.target.value.replace(/[^\d]/g, "")); setStarsError(""); }}
                  placeholder="Введите сумму (от 100)"
                  className="ios-input" />
                {starsError && <p className="ios-caption mt-1" style={{ color: "var(--red)" }}>{starsError}</p>}
              </div>
              <div>
                <label className="ios-caption block mb-1">Срок: {newDays} дн.</label>
                <input type="range" min={1} max={30} value={newDays} onChange={(e) => setNewDays(Number(e.target.value))} className="w-full" />
              </div>
              <button type="button" onClick={handleCreate} disabled={!newTitle.trim() || creating}
                className="ios-btn w-full">
                {creating ? "Создаём..." : `Создать — ${Number.isNaN(parsedStars()) ? "…" : parsedStars()} ⭐`}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProof && (
        <div className="fixed inset-0 z-50 flex items-end ios-blur"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowProof(null)} role="presentation">
          <div className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
            style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--separator)" }}
            onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="flex justify-between mb-4">
              <h2 className="ios-title-large">Фото-отчёт</h2>
              <button type="button" onClick={() => setShowProof(null)} className="ios-icon-btn" style={{ width: 32, height: 32 }}>
                <X size={16} />
              </button>
            </div>
            {proofImg ? (
              <div className="relative rounded-2xl overflow-hidden mb-3">
                <img src={proofImg} alt="" className="w-full h-40 object-cover" />
              </div>
            ) : (
              <button type="button" onClick={() => proofFileRef.current?.click()}
                className="w-full h-32 rounded-2xl flex flex-col items-center justify-center gap-2 mb-3 touch-manipulation"
                style={{
                  border: "1px dashed var(--separator-opaque)",
                  color: "var(--text-secondary)",
                  background: "var(--bg-tertiary)",
                }}>
                <Camera size={28} />
                <span className="ios-caption">Загрузить фото</span>
              </button>
            )}
            <input ref={proofFileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { const reader = new FileReader(); reader.onload = (ev) => setProofImg(ev.target?.result as string); reader.readAsDataURL(file); }
              }} />
            <textarea value={proofDesc} onChange={(e) => setProofDesc(e.target.value)} rows={3}
              placeholder="Описание обязательно: что сделано и что на фото"
              className="ios-input resize-none mb-3" />
            <p className="ios-caption mb-3" style={{ color: "var(--text-tertiary)" }}>ИИ проверит фото. При отклонении — цель провалена.</p>
            <button type="button" onClick={() => handleSubmitProof(showProof)}
              disabled={!proofImg || !proofDesc.trim() || submittingProof}
              className="ios-btn w-full">
              {submittingProof ? "Проверка ИИ..." : "Отправить на голосование"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
