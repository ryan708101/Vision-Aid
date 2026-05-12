import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * PixelClaritySprint — dot moves faster & smaller with difficulty
 */
export default function PixelClaritySprint({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const MAX_SCORE = 100;
  const POINTS = 5;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [dot, setDot] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);

  const reported = useRef(false);
  const moveRef = useRef(null);

  // base interval 600ms -> faster with difficulty
  const baseInterval = 600;
  const intervalMs = Math.max(180, Math.round(baseInterval / difficulty));
  // dot size shrinks with difficulty
  const baseSize = 20;
  const dotSize = Math.max(10, Math.round(baseSize / difficulty));

  useEffect(() => {
    let timer;
    if (running) {
      moveDot();
      moveRef.current = setInterval(moveDot, intervalMs);
      timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(moveRef.current);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, intervalMs]);

  useEffect(() => {
    if (!running && timeLeft === 0 && !reported.current) {
      reported.current = true;
      onFinish?.(score);
    }
  }, [running, timeLeft, score, onFinish]);

  function start() {
    reported.current = false;
    setScore(0);
    setTimeLeft(DURATION);
    setRunning(true);
  }

  function moveDot() {
    setDot({ x: 8 + Math.random() * 84, y: 8 + Math.random() * 84 });
  }

  function tap() {
    if (!running) return;
    setScore((s) => Math.min(MAX_SCORE, s + POINTS));
    moveDot();
  }

  return (
    <div className="text-white">
      <div className="mb-3 text-green-300 font-semibold">Pixel Clarity Sprint</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · speed {intervalMs}ms · dot {dotSize}px</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="relative h-64 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden">
        <button
          onClick={tap}
          className="absolute rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            transform: "translate(-50%,-50%)",
            width: dotSize,
            height: dotSize,
            background: "radial-gradient(circle,#7efc9f,#16a34a)",
            border: "1px solid rgba(34,197,94,0.6)",
          }}
          aria-label="moving-dot"
        />
      </div>
    </div>
  );
}
