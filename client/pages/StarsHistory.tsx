import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { fetchLedger } from "@/lib/goalsApi";
import type { StarLedgerEntry } from "@shared/api";

const typeLabels: Record<string, string> = {
  stake: "Ставка",
  refund: "Возврат",
  forfeit: "Проигрыш",
  fund: "Фонд",
  purchase: "Пополнение",
  tip: "Чаевые",
};

const filterTabs = [
  ["all", "Все"],
  ["stake", "Ставки"],
  ["refund", "Возвраты"],
  ["forfeit", "Проигрыши"],
] as const;

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

  const filtered = filter === "all" ? entries : entries.filter((e) => e.type === filter);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header
        className="fixed top-0 left-0 right-0 z-30 ios-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/profile" className="ios-icon-btn">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="ios-title">Рейтинг звёзд</h1>
            <p className="ios-caption">История ставок и переводов</p>
          </div>
          <div className="text-right">
            <p className="ios-headline" style={{ color: "var(--text-primary)" }}>
              {balance} ⭐
            </p>
            <p className="ios-caption">В фонде: {fundTotal}</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-1" style={{ borderBottom: "1px solid var(--separator)" }}>
          {filterTabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className="flex-1 py-2 text-xs font-semibold transition-all"
              style={{
                color: filter === key ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: filter === key ? "2px solid var(--text-primary)" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div
        className="max-w-2xl mx-auto px-4 pb-28"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 7.5rem)" }}
      >
        {filtered.length === 0 ? (
          <div className="ios-card p-8 text-center">
            <Wallet className="mx-auto mb-3" size={32} style={{ color: "var(--text-tertiary)" }} />
            <p className="ios-body" style={{ color: "var(--text-secondary)" }}>
              Пока нет операций. Создай цель или поставь звёзды!
            </p>
          </div>
        ) : (
          <div className="ios-card-grouped">
            {filtered.map((entry, i) => (
              <div
                key={entry.id}
                className="ios-card-row"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: entry.amount >= 0 ? "rgba(48,209,88,0.12)" : "rgba(255,69,58,0.12)",
                    color: entry.amount >= 0 ? "var(--green)" : "var(--red)",
                  }}
                >
                  {entry.amount >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="ios-headline">{typeLabels[entry.type] || entry.type}</p>
                  <p className="ios-caption truncate">{entry.description}</p>
                  <p className="ios-footnote">
                    {new Date(entry.createdAt).toLocaleString("ru-RU")}
                  </p>
                </div>
                <p
                  className="ios-headline flex-shrink-0"
                  style={{ color: entry.amount >= 0 ? "var(--green)" : "var(--red)" }}
                >
                  {entry.amount >= 0 ? "+" : ""}
                  {entry.amount} ⭐
                </p>
                {i < filtered.length - 1 && (
                  <div className="ios-separator" style={{ position: "absolute", bottom: 0, left: 56, right: 0 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
