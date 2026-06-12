import { useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";

const SWIPE_RATIO = 0.26;
const ROTATION_FACTOR = 12;

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
  const nextNextItem = index < items.length - 2 ? items[index + 2] : null;

  const rotate = useTransform(x, [-cardWidth, 0, cardWidth], [-ROTATION_FACTOR, 0, ROTATION_FACTOR]);

  const opacity = useTransform(x, (v) => {
    const p = Math.min(Math.abs(v) / cardWidth, 1);
    return 1 - p * 0.3;
  });

  const likeOpacity = useTransform(x, [0, cardWidth * 0.25, cardWidth * 0.5], [0, 0.8, 1]);
  const nopeOpacity = useTransform(x, [-cardWidth * 0.5, -cardWidth * 0.25, 0], [1, 0.8, 0]);

  const nextScale = useTransform(x, [-cardWidth, 0, cardWidth], [1, 0.93, 1]);
  const nextOpacity = useTransform(x, [-cardWidth, -cardWidth * 0.2, 0, cardWidth * 0.2, cardWidth], [1, 0.7, 0.5, 0.7, 1]);

  const stackScale = useTransform(x, [-cardWidth, 0, cardWidth], [0.96, 0.87, 0.96]);
  const stackOpacity = useTransform(x, [-cardWidth, 0, cardWidth], [0.6, 0.3, 0.6]);

  const measure = () => {
    if (cardRef.current) setCardWidth(cardRef.current.offsetWidth || 340);
  };

  const settle = async (targetX: number, nextIndex?: number) => {
    setAnimating(true);
    await animate(x, targetX, { duration: 0.2, ease: [0.32, 0.72, 0, 1] });
    if (nextIndex !== undefined) {
      onIndexChange(nextIndex);
      x.set(0);
    } else {
      await animate(x, 0, { type: "spring", stiffness: 500, damping: 36 });
    }
    setAnimating(false);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (animating) return;
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if ((offset < -cardWidth * SWIPE_RATIO || velocity < -500) && hasNext) {
      void settle(-cardWidth * 1.2, index + 1);
      return;
    }
    if ((offset > cardWidth * SWIPE_RATIO || velocity > 500) && hasPrev) {
      void settle(cardWidth * 1.2, index - 1);
      return;
    }
    void settle(0);
  };

  if (!current) return null;

  return (
    <div className="relative w-full flex-1 flex items-center justify-center px-4 min-h-0 py-3">

      {nextNextItem && (
        <motion.div
          className="absolute z-0 w-full max-w-[390px] aspect-[4/5] rounded-2xl overflow-hidden pointer-events-none"
          style={{ scale: stackScale, opacity: stackOpacity, y: 8 }}
        >
          {renderCard(nextNextItem)}
        </motion.div>
      )}

      {(nextItem || prevItem) && (
        <motion.div
          className="absolute z-[1] w-full max-w-[390px] aspect-[4/5] rounded-2xl overflow-hidden pointer-events-none"
          style={{
            scale: nextScale,
            opacity: nextOpacity,
            y: 4,
          }}
        >
          {renderCard((nextItem || prevItem)!)}
        </motion.div>
      )}

      <motion.div
        ref={cardRef}
        className="feed-card relative z-10 w-full max-w-[390px] aspect-[4/5] rounded-2xl overflow-hidden"
        style={{
          x, rotate, opacity,
          border: "0.5px solid var(--separator)",
        }}
        drag={animating ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        dragMomentum={false}
        onDragStart={measure}
        onDragEnd={onDragEnd}
        onLayoutAnimationComplete={measure}
      >
        {renderCard(current)}

        <motion.div
          className="swipe-like"
          style={{ opacity: likeOpacity }}
        >
          Нравится
        </motion.div>

        <motion.div
          className="swipe-nope"
          style={{ opacity: nopeOpacity }}
        >
          Пропустить
        </motion.div>
      </motion.div>
    </div>
  );
}
