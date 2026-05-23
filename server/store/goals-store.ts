import type { Goal, GoalStatus, StarLedgerEntry } from "@shared/api";
import {
  getUserBalance,
  deductStars,
  addStars,
  addLedgerEntry,
  getFundTotal,
} from "./stars-store";

const goals: Goal[] = [];
const votes: Map<string, Map<string, "yes" | "no">> = new Map();

const CREATOR_USER_ID = process.env.ADMIN_USER_ID || "platform";

export function getAllGoals(): Goal[] {
  return [...goals].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getGoalsByUser(userId: string): Goal[] {
  return getAllGoals().filter((g) => g.userId === userId);
}

export function getGoalById(id: string): Goal | undefined {
  return goals.find((g) => g.id === id);
}

export function seedDemoGoals(demos: Goal[]) {
  for (const d of demos) {
    if (!goals.find((g) => g.id === d.id)) {
      goals.push({ ...d, voterIds: d.voterIds || [] });
      votes.set(d.id, new Map());
    }
  }
}

export function createGoal(params: {
  userId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  description: string;
  starsStaked: number;
  deadlineDays: number;
}): { goal: Goal; balance: number } | { error: string } {
  const { userId, starsStaked } = params;
  if (starsStaked < 100) {
    return { error: "Минимальная ставка: 100 звёзд" };
  }
  const balance = getUserBalance(userId);
  if (balance < starsStaked) {
    return { error: "Недостаточно звёзд на балансе" };
  }

  deductStars(userId, starsStaked);
  const goal: Goal = {
    id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: params.userId,
    authorName: params.authorName,
    authorAvatar: params.authorAvatar,
    title: params.title,
    description: params.description,
    starsStaked: params.starsStaked,
    pot: 0,
    deadline: new Date(
      Date.now() + params.deadlineDays * 24 * 60 * 60 * 1000,
    ).toISOString(),
    status: "active",
    votesYes: 0,
    votesNo: 0,
    voterIds: [],
    createdAt: new Date().toISOString(),
  };
  goals.unshift(goal);
  votes.set(goal.id, new Map());

  addLedgerEntry({
    userId,
    goalId: goal.id,
    amount: -starsStaked,
    type: "stake",
    counterparty: "platform_fund",
    description: `Ставка на цель: «${params.title}»`,
  });

  return { goal, balance: getUserBalance(userId) };
}

function forfeitStars(goal: Goal, reason: string) {
  addLedgerEntry({
    userId: goal.userId,
    goalId: goal.id,
    amount: 0,
    type: "forfeit",
    counterparty: "platform_fund",
    description: `${reason} (−${goal.starsStaked} ⭐)`,
  });
  addLedgerEntry({
    userId: CREATOR_USER_ID,
    goalId: goal.id,
    amount: goal.starsStaked,
    type: "fund",
    counterparty: "creator",
    description: `Фонд: «${goal.title}» — ${reason}`,
  });
}

export function backGoal(
  goalId: string,
  userId: string,
  amount: number,
): { goal: Goal; balance: number } | { error: string } {
  const goal = getGoalById(goalId);
  if (!goal) return { error: "Цель не найдена" };
  if (goal.status !== "active") return { error: "Цель уже завершена или на проверке" };
  if (goal.userId === userId) return { error: "Нельзя поддерживать самого себя" };
  if (amount < 5) return { error: "Минимальная поддержка — 5 ⭐" };

  const balance = getUserBalance(userId);
  if (balance < amount) return { error: "Недостаточно звёзд" };

  deductStars(userId, amount);
  goal.pot += amount;

  addLedgerEntry({
    userId,
    goalId: goal.id,
    amount: -amount,
    type: "tip",
    counterparty: "platform_fund",
    description: `Поддержка цели «${goal.title}»`,
  });

  return { goal, balance: getUserBalance(userId) };
}

function refundStars(goal: Goal) {
  const totalPot = goal.starsStaked + (goal.pot || 0);
  const commission = Math.floor(totalPot * 0.1); // 10% комиссия
  const finalWin = totalPot - commission;

  addStars(goal.userId, finalWin);
  
  // Комиссия платформе
  addLedgerEntry({
    userId: CREATOR_USER_ID,
    goalId: goal.id,
    amount: commission,
    type: "fund",
    counterparty: "creator",
    description: `Комиссия (10%) от цели «${goal.title}»`,
  });

  addLedgerEntry({
    userId: goal.userId,
    goalId: goal.id,
    amount: finalWin,
    type: "refund",
    counterparty: "user",
    description: `Победа! Цель выполнена «${goal.title}». Забрали банк (комиссия 10%: ${commission} ⭐)`,
  });
}

export function resolveVote(goal: Goal): "pending" | "passed" | "failed" {
  const total = goal.votesYes + goal.votesNo;
  if (total < 3) return "pending";
  const pct = goal.votesYes / total;
  return pct > 0.5 ? "passed" : "failed";
}

function finalizeGoal(goal: Goal) {
  const result = resolveVote(goal);
  if (result === "pending") return;
  if (result === "passed") {
    goal.status = "completed";
    refundStars(goal);
  } else {
    goal.status = "failed";
    forfeitStars(goal, "Голосование: большинство «Нет»");
  }
}

export function submitProof(
  goalId: string,
  userId: string,
  proofImage: string,
  proofDescription: string,
): { goal: Goal } | { error: string } {
  const goal = getGoalById(goalId);
  if (!goal) return { error: "Цель не найдена" };
  if (goal.userId !== userId) return { error: "Нет доступа" };
  if (goal.status !== "active") return { error: "Цель не активна" };
  if (!proofDescription.trim()) {
    return { error: "Описание фото обязательно" };
  }
  if (!proofImage) return { error: "Фото обязательно" };

  goal.proofImage = proofImage;
  goal.proofDescription = proofDescription.trim();
  goal.status = "pending_moderation";
  return { goal };
}

export function approveProof(goalId: string): Goal | undefined {
  const goal = getGoalById(goalId);
  if (!goal || goal.status !== "pending_moderation") return undefined;
  goal.status = "pending_vote";
  return goal;
}

export function rejectProof(goalId: string, reason: string): Goal | undefined {
  const goal = getGoalById(goalId);
  if (!goal || goal.status !== "pending_moderation") return undefined;
  goal.status = "failed";
  forfeitStars(goal, reason);
  return goal;
}

export function castVote(
  goalId: string,
  userId: string,
  vote: "yes" | "no",
): { goal: Goal } | { error: string } {
  const goal = getGoalById(goalId);
  if (!goal) return { error: "Цель не найдена" };
  if (goal.status !== "pending_vote") {
    return { error: "Голосование недоступно" };
  }
  if (goal.userId === userId) return { error: "Нельзя голосовать за свою цель" };

  const goalVotes = votes.get(goalId) || new Map();
  if (goalVotes.has(userId)) return { error: "Вы уже голосовали" };

  goalVotes.set(userId, vote);
  votes.set(goalId, goalVotes);
  goal.voterIds = [...goalVotes.keys()];
  if (vote === "yes") goal.votesYes += 1;
  else goal.votesNo += 1;

  finalizeGoal(goal);
  return { goal };
}

export { getFundTotal };
