/**
 * Shared code between client and server
 */

export interface DemoResponse {
  message: string;
}

export interface StarsAddRequest {
  userId: string;
  amount: number;
}

export interface StarsAddResponse {
  success: boolean;
  balance: number;
  message: string;
}

export interface StarsWithdrawRequest {
  userId: string;
  amount: number;
}

export interface StarsWithdrawResponse {
  success: boolean;
  balance: number;
  withdrawn: number;
  commission: number;
  message: string;
}

export interface StarsBalanceResponse {
  success: boolean;
  balance: number;
  source?: string;
}

export type GoalStatus =
  | "active"
  | "pending_moderation"
  | "pending_vote"
  | "completed"
  | "failed"
  | "expired";

export type StarLedgerType =
  | "stake"
  | "refund"
  | "forfeit"
  | "fund"
  | "purchase"
  | "tip";

export interface StarLedgerEntry {
  id: string;
  userId: string;
  goalId?: string;
  amount: number;
  type: StarLedgerType;
  counterparty: "user" | "platform_fund" | "creator";
  description: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  description: string;
  starsStaked: number;
  pot: number; // New: Stars collected from supporters
  deadline: string;
  status: GoalStatus;
  proofImage?: string;
  proofDescription?: string;
  votesYes: number;
  votesNo: number;
  voterIds: string[];
  createdAt: string;
}

export interface CreateGoalRequest {
  userId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  description?: string;
  starsStaked: number;
  deadlineDays?: number;
}

export interface CreateGoalResponse {
  success: boolean;
  goal: Goal;
  balance: number;
}

export interface GoalsListResponse {
  goals: Goal[];
}

export interface SubmitProofRequest {
  userId: string;
  proofImage: string;
  proofDescription: string;
}

export interface VoteGoalRequest {
  userId: string;
  vote: "yes" | "no";
}

export interface LedgerResponse {
  entries: StarLedgerEntry[];
  fundTotal: number;
  balance: number;
}

export interface ModerateImageResponse {
  approved: boolean;
  reason?: string;
}
