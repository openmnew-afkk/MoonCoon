import { useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";

const SWIPE_RATIO = 0.28;

interface FeedCardStackProps<T> {
  items: T[];
  index: number;
  onIndexChange: (index: number) => void;
  renderCard: (item: T) => ReactNode;
}

export default function FeedCardStack<T>({
  items,
  index,
  onIndexChange,
  renderCard,
}: FeedCardStackProps<T>) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(340);
  const [animating, setAnimating] = useState(false);
  const x = useMotionValue(0);

  const current = items[index];
  const hasNext = index < items.length - 1;
  const hasPrev = index > 0;
  const nextItem = hasNext ? items[index + 1] : null;
  const prevItem = hasPrev ? items[index - 1] : null;

  const scale = useTransform(x, (v) => {
    const p = Math.min(Math.abs(v) / cardWidth, 1);
    return 1 - p * 0.15;
  });
  const opacity = useTransform(x, (v) => {
    const p = Math.min(Math.abs(v) / cardWidth, 1);
    return 1 - p * 0.45;
  });
  const peekNextOpacity = useTransform(x, [-cardWidth, -20, 0], [0.85, 0.4, 0]);
  const peekPrevOpacity = useTransform(x, [0, 20, cardWidth], [0, 0.4, 0.85]);
  const peekNextScale = useTransform(x, [-cardWidth, 0], [1, 0.9]);
  const peekPrevScale = useTransform(x, [0, cardWidth], [0.9, 1]);

  const measure = () => {
    if (cardRef.current) setCardWidth(cardRef.current.offsetWidth || 340);
  };

  const settle = async (targetX: number, nextIndex?: number) => {
    setAnimating(true);
    await animate(x, targetX, { duration: 0.22, ease: [0.32, 0.72, 0, 1] });
    if (nextIndex !== undefined) {
      onIndexChange(nextIndex);
      x.set(0);
    } else {
      await animate(x, 0, { type: "spring", stiffness: 480, damping: 32 });
    }
    setAnimating(false);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (animating) return;
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if ((offset < -cardWidth * SWIPE_RATIO || velocity < -450) && hasNext) {
      void settle(-cardWidth * 1.1, index + 1);
      return;
    }
    if ((offset > cardWidth * SWIPE_RATIO || velocity > 450) && hasPrev) {
      void settle(cardWidth * 1.1, index - 1);
      return;
    }
    void settle(0);
  };

  if (!current) return null;

  return (
    <div className="relative w-full flex-1 flex items-center justify-center px-4 min-h-0 py-3">
      {nextItem && (
        <motion.div
          className="absolute z-0 w-full max-w-[390px] aspect-[4/5] rounded-2xl overflow-hidden pointer-events-none"
          style={{ opacity: peekNextOpacity, scale: peekNextScale }}
        >
          {renderCard(nextItem)}
        </motion.div>
      )}

      {prevItem && (
        <motion.div
          className="absolute z-0 w-full max-w-[390px] aspect-[4/5] rounded-2xl overflow-hidden pointer-events-none"
          style={{ opacity: peekPrevOpacity, scale: peekPrevScale }}
        >
          {renderCard(prevItem)}
        </motion.div>
      )}

      <motion.div
        ref={cardRef}
        className="feed-card-frame relative z-10 w-full max-w-[390px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/[0.06]"
        style={{ x, scale, opacity }}
        drag={animating ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.14}
        dragMomentum={false}
        onDragStart={measure}
        onDragEnd={onDragEnd}
        onLayoutAnimationComplete={measure}
      >
        {renderCard(current)}
      </motion.div>
    </div>
  );
}
