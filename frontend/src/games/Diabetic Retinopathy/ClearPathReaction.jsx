import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * ClearPathReaction — path clusters appear faster, clear probability lowers with difficulty
 */
export default function ClearPathReaction({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const POINTS = 2;
  const MAX_SCORE = 100;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [pathDots, setPathDots] = useState([]);
  const [score, setScore] = useState(0);

  const reported = useRef(false);
  const moveRef = useRef(null);

  // base interval 1400ms -> faster with difficulty
  const baseInterval = 1400;
  const intervalMs = Math.max(700, Math.round(baseInterval / difficulty));
  // clear probability reduces with difficulty
  const baseClearProb = 0.65;
  const clearProb = Math.max(0.28, baseClearProb / difficulty);

  useEffect(() => {
    let timer;
    if (running) {
      generatePath();
      moveRef.current = setInterval(generatePath, intervalMs);

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
  }, [running, intervalMs, clearProb]);

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

  function generatePath() {
    const dots = new Array(6).fill(0).map(() => {
      const clear = Math.random() < clearProb; // fewer clears when harder
      return {
        id: Math.random().toString(36).slice(2, 9),
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 70,
        clear,
        tapped: false,
      };
    });

    setPathDots(dots);
    // remove sooner when difficulty higher
    const removeMs = Math.max(420, Math.round(1350 / difficulty));
    setTimeout(() => setPathDots([]), removeMs);
  }

  function tap(id) {
    if (!running) return;
    setPathDots((arr) =>
      arr.map((d) => {
        if (d.id === id && !d.tapped) {
          if (d.clear) {
            setScore((s) => Math.min(MAX_SCORE, s + POINTS));
          }
          return { ...d, tapped: true };
        }
        return d;
      })
    );
  }

  return (
    <div className="text-white">
      <div className="mb-3 text-green-300 font-semibold">Clear Path Reaction</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · spawn {intervalMs}ms · clearProb {clearProb.toFixed(2)}</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="relative h-64 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden">
        {pathDots.map((dot) => (
          <button
            key={dot.id}
            onClick={() => tap(dot.id)}
            className="absolute rounded-full"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              transform: "translate(-50%,-50%)",
              width: 18,
              height: 18,
              background: dot.clear ? "linear-gradient(180deg,#10b981,#047857)" : "rgba(255,255,255,0.06)",
              filter: dot.clear ? "none" : "blur(2px)",
              opacity: dot.tapped ? 0.4 : 1,
            }}
            aria-label={`dot-${dot.id}`}
          />
        ))}
      </div>
    </div>
  );
}
