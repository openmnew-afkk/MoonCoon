import type {
  CreateGoalRequest,
  CreateGoalResponse,
  Goal,
  GoalsListResponse,
  LedgerResponse,
  ModerateImageResponse,
} from "@shared/api";

export async function ensureDemoBalance(userId: string): Promise<number> {
  const res = await fetch("/api/stars/ensure-balance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  return data.balance ?? 0;
}

export async function fetchGoals(params?: {
  userId?: string;
  status?: string;
  feed?: string;
}): Promise<Goal[]> {
  const q = new URLSearchParams();
  if (params?.userId) q.set("userId", params.userId);
  if (params?.status) q.set("status", params.status);
  if (params?.feed) q.set("feed", params.feed);
  const res = await fetch(`/api/goals?${q}`);
  if (!res.ok) return [];
  const data: GoalsListResponse = await res.json();
  return data.goals || [];
}

export async function createGoal(
  body: CreateGoalRequest,
): Promise<CreateGoalResponse | { error: string }> {
  const res = await fetch("/api/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error || "Ошибка создания" };
  return data as CreateGoalResponse;
}

export async function submitProof(
  goalId: string,
  userId: string,
  proofImage: string,
  proofDescription: string,
): Promise<{ goal: Goal } | { error: string }> {
  const modRes = await fetch("/api/ai/moderate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proofImage, proofDescription }),
  });
  const mod: ModerateImageResponse = await modRes.json();
  if (!mod.approved) {
    await fetch(`/api/goals/${goalId}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: false, reason: mod.reason }),
    });
    return { error: mod.reason || "Фото не прошло проверку ИИ. Цель провалена." };
  }

  const res = await fetch(`/api/goals/${goalId}/proof`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, proofImage, proofDescription }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error || "Ошибка загрузки" };

  const modGoal = await fetch(`/api/goals/${goalId}/moderate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved: true }),
  });
  const modGoalData = await modGoal.json();
  return { goal: modGoalData.goal as Goal };
}

export async function voteGoal(
  goalId: string,
  userId: string,
  vote: "yes" | "no",
): Promise<{ goal: Goal } | { error: string }> {
  const res = await fetch(`/api/goals/${goalId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, vote }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error || "Ошибка голосования" };
  return { goal: data.goal };
}

export async function fetchLedger(userId: string): Promise<LedgerResponse> {
  const res = await fetch(`/api/stars/ledger?userId=${userId}`);
  if (!res.ok) {
    return { entries: [], fundTotal: 0, balance: 0 };
  }
  return res.json();
}

export async function backGoal(
  goalId: string,
  userId: string,
  amount: number,
): Promise<{ goal: Goal; balance: number } | { error: string }> {
  const res = await fetch(`/api/goals/${goalId}/back`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, amount }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error || "Ошибка поддержки" };
  return data;
}

export function votePercent(yes: number, no: number) {
  const total = yes + no;
  if (total === 0) return 0;
  return Math.round((yes / total) * 100);
}

export function resolveVoteLabel(yes: number, no: number): string {
  const total = yes + no;
  if (total < 3) return `Нужно ещё ${3 - total} голос(а)`;
  const pct = votePercent(yes, no);
  return pct > 50 ? "Большинство «Да»" : "Большинство «Нет»";
}
