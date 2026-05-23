import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Star, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { fetchLedger } from "@/lib/goalsApi";
import type { StarLedgerEntry } from "@shared/api";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  stake: "Ставка",
  refund: "Возврат",
  forfeit: "Проигрыш",
  fund: "Фонд",
  purchase: "Пополнение",
  tip: "Чаевые",
};

export default function StarsHistory() {
  const { user } = useTelegram();
  const [entries, setEntries] = useState<StarLedgerEntry[]>([]);
  const [balance, setBalance] = useState(0);
  const [fundTotal, setFundTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | "stake" | "refund" | "forfeit">("all");

  useEffect(() => {
    if (!user?.id) return;
    fetchLedger(String(user.id)).then((data) => {
      setEntries(data.entries);
      setBalance(data.balance);
      setFundTotal(data.fundTotal);
    });
  }, [user?.id]);

  const filtered =
    filter === "all"
      ? entries
      : entries.filter((e) => e.type === filter);

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
            <h1 className="text-base font-bold">Рейтинг звёзд</h1>
            <p className="text-caption">История ставок и переводов</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">{balance} ⭐</p>
            <p className="text-[10px] text-white/40">В фонде: {fundTotal}</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-1">
          {(
            [
              ["all", "Все"],
              ["stake", "Ставки"],
              ["refund", "Возвраты"],
              ["forfeit", "Проигрыши"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                filter === key
                  ? "bg-primary/20 text-primary"
                  : "text-white/40",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div
        className="max-w-2xl mx-auto px-4 pb-28 section-gap"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 7.5rem)" }}
      >
        {filtered.length === 0 ? (
          <div className="glass-surface-v2 p-8 text-center animate-fade-up">
            <Wallet className="mx-auto mb-3 text-muted-foreground" size={32} />
            <p className="text-sm text-white/50">
              Пока нет операций. Создай цель или поставь звёзды!
            </p>
          </div>
        ) : (
          filtered.map((entry, i) => (
            <div
              key={entry.id}
              className="glass-surface-v2 p-4 flex items-start gap-3 animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  entry.amount >= 0
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400",
                )}
              >
                {entry.amount >= 0 ? (
                  <TrendingUp size={18} />
                ) : (
                  <TrendingDown size={18} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">
                  {typeLabels[entry.type] || entry.type}
                </p>
                <p className="text-caption truncate">{entry.description}</p>
                <p className="text-[10px] text-white/30 mt-1">
                  {new Date(entry.createdAt).toLocaleString("ru-RU")}
                </p>
              </div>
              <p
                className={cn(
                  "text-sm font-bold flex-shrink-0",
                  entry.amount >= 0 ? "text-emerald-400" : "text-red-400",
                )}
              >
                {entry.amount >= 0 ? "+" : ""}
                {entry.amount} ⭐
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
