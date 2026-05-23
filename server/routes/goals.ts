import { RequestHandler } from "express";
import type { CreateGoalRequest, SubmitProofRequest, VoteGoalRequest } from "@shared/api";
import {
  getAllGoals,
  getGoalsByUser,
  getGoalById,
  createGoal,
  backGoal, // New
  submitProof,
  approveProof,
  rejectProof,
  castVote,
  seedDemoGoals,
} from "../store/goals-store";
import { getUserBalance, addStars } from "../store/stars-store";
import { getLedger, getFundTotal } from "../store/stars-store";

const demoSeed: Parameters<typeof seedDemoGoals>[0] = [
  {
    id: "demo-1",
    userId: "demo1",
    authorName: "Алекс К.",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    title: "Пробежать 5 км без остановки",
    description: "Тренируюсь уже 2 недели, пора доказать себе что могу!",
    starsStaked: 500,
    pot: 0,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending_vote",
    proofImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    proofDescription: "Вот мой трекер бега — 5.2 км за 28 минут! Сделал это 🔥",
    votesYes: 23,
    votesNo: 4,
    voterIds: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-2",
    userId: "demo2",
    authorName: "Мария В.",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    title: "30 дней без сахара",
    description: "Это будет сложно, но я готова. Ставлю 1000 звёзд!",
    starsStaked: 1000,
    pot: 0,
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    votesYes: 0,
    votesNo: 0,
    voterIds: [],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

let seeded = false;
function ensureSeed() {
  if (!seeded) {
    seedDemoGoals(demoSeed);
    seeded = true;
  }
}

export const handleGetGoals: RequestHandler = (req, res) => {
  ensureSeed();
  const { userId, status, feed } = req.query;
  let list = getAllGoals();
  if (userId && typeof userId === "string") {
    list = getGoalsByUser(userId);
  }
  if (status && typeof status === "string") {
    list = list.filter((g) => g.status === status);
  }
  if (feed === "photo-reports") {
    list = list.filter((g) => g.status === "pending_vote" && g.proofImage);
  }
  res.json({ goals: list });
};

export const handleBackGoal: RequestHandler = (req, res) => {
  ensureSeed();
  const { id } = req.params;
  const { userId, amount } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ error: "Неверные параметры" });
  }
  const result = backGoal(id, String(userId), Number(amount));
  if ("error" in result) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, goal: result.goal, balance: result.balance });
};

export const handleGetGoal: RequestHandler = (req, res) => {
  ensureSeed();
  const goal = getGoalById(req.params.id);
  if (!goal) return res.status(404).json({ error: "Цель не найдена" });
  res.json({ goal });
};

export const handleCreateGoal: RequestHandler = (req, res) => {
  ensureSeed();
  const body = req.body as CreateGoalRequest;
  const {
    userId,
    authorName,
    authorAvatar,
    title,
    description = "",
    starsStaked,
    deadlineDays = 7,
  } = body;
  if (!userId || !title || !starsStaked) {
    return res.status(400).json({ error: "Неверные параметры" });
  }
  const result = createGoal({
    userId: String(userId),
    authorName: authorName || "Пользователь",
    authorAvatar: authorAvatar || "",
    title: title.trim(),
    description: description || "",
    starsStaked: Number(starsStaked),
    deadlineDays: Math.min(30, Math.max(1, Number(deadlineDays) || 7)),
  });
  if ("error" in result) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, goal: result.goal, balance: result.balance });
};

export const handleSubmitProof: RequestHandler = (req, res) => {
  ensureSeed();
  const { id } = req.params;
  const { userId, proofImage, proofDescription } = req.body as SubmitProofRequest;
  if (!userId || !proofImage || !proofDescription?.trim()) {
    return res.status(400).json({ error: "Фото и описание обязательны" });
  }
  const result = submitProof(id, String(userId), proofImage, proofDescription);
  if ("error" in result) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, goal: result.goal, needsModeration: true });
};

export const handleModerateProof: RequestHandler = (req, res) => {
  ensureSeed();
  const { id } = req.params;
  const { approved, reason } = req.body as { approved: boolean; reason?: string };
  if (approved) {
    const goal = approveProof(id);
    if (!goal) return res.status(404).json({ error: "Цель не найдена" });
    return res.json({ success: true, goal, approved: true });
  }
  const goal = rejectProof(id, reason || "Фото не прошло проверку ИИ");
  if (!goal) return res.status(404).json({ error: "Цель не найдена" });
  res.json({ success: true, goal, approved: false, reason });
};

export const handleVoteGoal: RequestHandler = (req, res) => {
  ensureSeed();
  const { id } = req.params;
  const { userId, vote } = req.body as VoteGoalRequest;
  if (!userId || !vote) {
    return res.status(400).json({ error: "Неверные параметры" });
  }
  const result = castVote(id, String(userId), vote);
  if ("error" in result) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, goal: result.goal });
};

export const handleStarsLedger: RequestHandler = (req, res) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId обязателен" });
  }
  const entries = getLedger().filter((e) => e.userId === userId);
  res.json({
    entries,
    fundTotal: getFundTotal(),
    balance: getUserBalance(userId),
  });
};

/** Give new users starter balance for demo */
export const handleEnsureBalance: RequestHandler = (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId обязателен" });
  const id = String(userId);
  if (getUserBalance(id) === 0) {
    addStars(id, 5000);
  }
  res.json({ balance: getUserBalance(id) });
};
