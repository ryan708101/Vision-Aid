import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * BlindSpotMaze.jsx
 * - Dot moves along circular path; when it disappears into a simulated blind spot,
 *   user presses a button to mark disappearance.
 * - +5 per correct detection.
 */
export default function BlindSpotMaze({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const POINTS = 5;
  const MAX_SCORE = 100;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [dotAngle, setDotAngle] = useState(0);
  const [score, setScore] = useState(0);
  const [hiddenPhase, setHiddenPhase] = useState(false);

  const tickRef = useRef(null);
  const moveRef = useRef(null);
  const reported = useRef(false);

  // movement speed increases with difficulty
  const baseMoveMs = 120;
  const moveMs = Math.max(40, Math.round(baseMoveMs / difficulty));

  useEffect(() => {
    if (running) {
      moveRef.current = setInterval(() => {
        setDotAngle((a) => (a + 8 + difficulty) % 360);
        // occasionally enter hidden phase (simulate blind-spot)
        if (Math.random() < 0.06 * difficulty) {
          setHiddenPhase(true);
          setTimeout(() => setHiddenPhase(false), Math.max(380, Math.round(800 / difficulty)));
        }
      }, moveMs);

      tickRef.current = setInterval(() => {
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
      clearInterval(tickRef.current);
    };
  }, [running, moveMs, difficulty]);

  useEffect(() => {
    if (!running && timeLeft === 0 && !reported.current) {
      reported.current = true;
      onFinish?.(score);
    }
  }, [running, timeLeft, score, onFinish]);

  function start() {
    reported.current = false;
    setScore(0);
    setDotAngle(0);
    setHiddenPhase(false);
    setTimeLeft(DURATION);
    setRunning(true);
  }

  function markHidden() {
    if (!running) return;
    if (hiddenPhase) {
      setScore((s) => Math.min(MAX_SCORE, s + POINTS));
      setHiddenPhase(false); // mark detected
    } else {
      setScore((s) => Math.max(0, s - 2)); // wrong press penalty
    }
  }

  // compute dot position
  const cx = 50, cy = 50, radius = 30;
  const rad = (dotAngle * Math.PI) / 180;
  const dotX = cx + Math.cos(rad) * radius;
  const dotY = cy + Math.sin(rad) * radius;

  return (
    <div className="text-white">
      <div className="mb-2 text-green-300 font-semibold">Blind-Spot Maze</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · speed {moveMs}ms</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="relative h-64 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
        <div style={{ position: "relative", width: "220px", height: "220px" }}>
          {/* circular path */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" />
            {/* blind spot marker - a sector */}
            <path d="M70 50 A20 20 0 0 1 50 30 L50 50 Z" fill="rgba(255,255,255,0.02)" />
          </svg>

          {/* dot */}
          {!hiddenPhase && (
            <div
              style={{
                position: "absolute",
                left: `${dotX}%`,
                top: `${dotY}%`,
                transform: "translate(-50%,-50%)",
                width: 14,
                height: 14,
                borderRadius: 8,
                background: "radial-gradient(circle,#7efc9f,#16a34a)",
                border: "1px solid rgba(34,197,94,0.6)",
              }}
            />
          )}

          {/* when hiddenPhase true, dot is not visible */}
        </div>

        <div className="absolute bottom-4 flex gap-3">
          <button onClick={markHidden} className="px-3 py-1 bg-slate-800 text-slate-200 rounded border border-slate-700">Mark Hidden</button>
        </div>
      </div>
    </div>
  );
}
