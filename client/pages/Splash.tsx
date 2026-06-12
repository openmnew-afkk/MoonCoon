import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/brand";

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [out, setOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const dur = 2200;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(100, Math.round(((Date.now() - start) / dur) * 100));
      setProgress(p);
      if (p < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const exit = setTimeout(() => {
      setOut(true);
      setTimeout(onComplete, 500);
    }, dur + 300);
    return () => clearTimeout(exit);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: "#000000",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        opacity: out ? 0 : 1,
        transform: out ? "scale(1.02)" : "scale(1)",
      }}
    >
      <div
        className="flex flex-col items-center gap-6"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          className="w-20 h-20 flex items-center justify-center"
          style={{
            borderRadius: 20,
            background: "var(--blue)",
          }}
        >
          <span
            className="text-[36px] font-bold text-white tracking-[-0.04em]"
            style={{ fontFamily: "Inter, -apple-system, sans-serif" }}
          >
            V
          </span>
        </div>

        <div className="text-center">
          <h1
            className="text-[34px] font-bold tracking-[-0.02em] text-[var(--text-primary)] m-0"
            style={{ fontFamily: "Inter, -apple-system, sans-serif" }}
          >
            {APP_NAME}
          </h1>
          <p className="text-[13px] font-medium mt-1.5 text-[var(--text-secondary)]">
            new era of communication
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[200px]"
        style={{ opacity: show ? 1 : 0, transition: "opacity 0.6s ease 0.5s" }}
      >
        <div
          className="h-[2px] rounded-full overflow-hidden"
          style={{ background: "var(--bg-tertiary)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "var(--blue)",
              transition: "width 0.12s linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
