export interface ParsedGoalCommand {
  title: string;
  starsStaked: number;
}

export interface ParseGoalError {
  error: string;
}

const GOAL_RE =
  /ставлю\s+цель:\s*(.+?)\s+на\s+(\d+)\s*(?:зв[ёе]зд|⭐)?/i;

export function parseGoalCommand(
  text: string,
): ParsedGoalCommand | ParseGoalError | null {
  const trimmed = text.trim();
  const match = trimmed.match(GOAL_RE);
  if (!match) return null;

  const stars = Number(match[2]);
  if (Number.isNaN(stars) || stars < 100) {
    return { error: "Минимальная ставка — 100 звёзд. Пример: Ставлю цель: бег 5 км на 500" };
  }

  const title = match[1].trim();
  if (!title) {
    return { error: "Укажи описание цели после «Ставлю цель:»" };
  }

  return { title, starsStaked: stars };
}

export function isGoalStatusQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("статус цел") ||
    lower.includes("мои цел") ||
    lower.includes("моя цель")
  );
}
