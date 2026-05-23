import type { StarLedgerEntry, StarLedgerType } from "@shared/api";

const userStars: Record<string, number> = {};
const ledger: StarLedgerEntry[] = [];
let fundTotal = 0;

export function getUserBalance(userId: string): number {
  return userStars[userId] || 0;
}

export function setUserBalance(userId: string, amount: number) {
  userStars[userId] = Math.max(0, amount);
}

export function addStars(userId: string, amount: number) {
  userStars[userId] = (userStars[userId] || 0) + amount;
}

export function deductStars(userId: string, amount: number): boolean {
  const bal = getUserBalance(userId);
  if (bal < amount) return false;
  userStars[userId] = bal - amount;
  return true;
}

export function getLedger(): StarLedgerEntry[] {
  return [...ledger].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getFundTotal(): number {
  return fundTotal;
}

export function addLedgerEntry(params: {
  userId: string;
  goalId?: string;
  amount: number;
  type: StarLedgerType;
  counterparty: StarLedgerEntry["counterparty"];
  description: string;
}) {
  const entry: StarLedgerEntry = {
    id: `led_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: params.userId,
    goalId: params.goalId,
    amount: params.amount,
    type: params.type,
    counterparty: params.counterparty,
    description: params.description,
    createdAt: new Date().toISOString(),
  };
  ledger.unshift(entry);
  if (params.type === "fund" && params.amount > 0) {
    fundTotal += params.amount;
  }
}

/** Sync with legacy stars route module */
export function getLegacyUserStars(): Record<string, number> {
  return userStars;
}
