import { useRef, useState, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";

const SWIPE_THRESHOLD = 0.3;

interface HorizontalPostViewerProps<T> {
  items: T[];
  index: number;
  onIndexChange: (index: number) => void;
  renderItem: (item: T, isActive: boolean) => ReactNode;
}

export default function HorizontalPostViewer<T>({
  items,
  index,
  onIndexChange,
  renderItem,
}: HorizontalPostViewerProps<T>) {
  const widthRef = useRef(
    typeof window !== "undefined" ? window.innerWidth : 375,
  );
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [bounce, setBounce] = useState(false);

  const current = items[index];
  const nextItem = index < items.length - 1 ? items[index + 1] : null;
  const prevItem = index > 0 ? items[index - 1] : null;

  const progress = Math.min(Math.abs(offsetX) / widthRef.current, 1);
  const currentScale = 1 - progress * 0.15;
  const peekScale = 0.9 + progress * 0.1;

  const snapBack = useCallback(async () => {
    const start = offsetX;
    await new Promise<void>((resolve) => {
      const startTime = performance.now();
      const duration = 320;
      const tick = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setOffsetX(start * (1 - eased));
        if (t < 1) requestAnimationFrame(tick);
        else {
          setOffsetX(0);
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }, [offsetX]);

  const flyOut = useCallback(
    async (direction: "left" | "right") => {
      const target = direction === "left" ? -widthRef.current * 1.15 : widthRef.current * 1.15;
      const start = offsetX;
      const startTime = performance.now();
      const duration = 260;

      await new Promise<void>((resolve) => {
        const tick = (now: number) => {
          const t = Math.min((now - startTime) / duration, 1);
          const eased = t * (2 - t);
          setOffsetX(start + (target - start) * eased);
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });

      const newIndex = direction === "left" ? index + 1 : index - 1;
      onIndexChange(newIndex);
      setOffsetX(direction === "left" ? widthRef.current * 0.4 : -widthRef.current * 0.4);
      setBounce(true);

      await new Promise<void>((resolve) => {
        const from = direction === "left" ? widthRef.current * 0.4 : -widthRef.current * 0.4;
        const startTime = performance.now();
        const duration = 480;
        const tick = (now: number) => {
          const t = Math.min((now - startTime) / duration, 1);
          const spring = 1 - Math.pow(Math.E, -6 * t) * Math.cos(8 * t);
          setOffsetX(from * (1 - spring));
          if (t < 1) requestAnimationFrame(tick);
          else {
            setOffsetX(0);
            setBounce(false);
            resolve();
          }
        };
        requestAnimationFrame(tick);
      });
    },
    [index, offsetX, onIndexChange],
  );

  const handlePanEnd = useCallback(
    async (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      setDragging(false);
      const ox = info.offset.x;
      const w = widthRef.current;

      if (ox < -w * SWIPE_THRESHOLD || info.velocity.x < -600) {
        if (nextItem) await flyOut("left");
        else await snapBack();
        return;
      }
      if (ox > w * SWIPE_THRESHOLD || info.velocity.x > 600) {
        if (prevItem) await flyOut("right");
        else await snapBack();
        return;
      }
      await snapBack();
    },
    [nextItem, prevItem, flyOut, snapBack],
  );

  if (!current) return null;

  const showNext = offsetX < 0 && nextItem;
  const showPrev = offsetX > 0 && prevItem;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      ref={(el) => {
        if (el) widthRef.current = el.offsetWidth || window.innerWidth;
      }}
    >
      {showPrev && prevItem && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            transform: `scale(${peekScale})`,
            opacity: 0.5 + progress * 0.5,
            transition: dragging ? "none" : "transform 0.2s",
          }}
        >
          {renderItem(prevItem, false)}
        </div>
      )}

      {showNext && nextItem && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            transform: `scale(${peekScale})`,
            opacity: 0.5 + progress * 0.5,
            transition: dragging ? "none" : "transform 0.2s",
          }}
        >
          {renderItem(nextItem, false)}
        </div>
      )}

      <motion.div
        className="absolute inset-0 z-10"
        style={{
          x: offsetX,
          scale: bounce ? 1.02 : dragging ? currentScale : 1,
        }}
        drag="x"
        dragElastic={0.15}
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
        onDrag={(_, info) => setOffsetX(info.offset.x)}
        onDragEnd={handlePanEnd}
        transition={
          bounce
            ? { type: "spring", stiffness: 500, damping: 22 }
            : { type: "spring", stiffness: 420, damping: 32 }
        }
      >
        {renderItem(current, true)}
      </motion.div>
    </div>
  );
}
