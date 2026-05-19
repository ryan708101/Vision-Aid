import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * Micro-Spot Eliminator (scaled by selectedWeek)
 */
export default function MicroSpotEliminator({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const MAX_SCORE = 100;
  const CORRECT_POINTS = 10;
  const WRONG_POINTS = -1;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [spots, setSpots] = useState([]);

  const spawnTimer = useRef(null);
  const countdown = useRef(null);
  const reported = useRef(false);

  // spawnRate gets faster with difficulty (lower ms)
  const baseSpawnMs = 900;
  const spawnMs = Math.max(220, Math.round(baseSpawnMs / difficulty));

  useEffect(() => {
    if (running) {
      spawnTimer.current = setInterval(() => spawnSpot(), spawnMs);
      countdown.current = setInterval(() => {
        setTimeLeft((s) => {
          if (s <= 1) {
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(spawnTimer.current);
      clearInterval(countdown.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, spawnMs]);

  useEffect(() => {
    if (!running && timeLeft === 0) {
      if (!reported.current && typeof onFinish === "function") {
        reported.current = true;
        onFinish(score);
      }
    }
  }, [running, timeLeft, score, onFinish]);

  function start() {
    reported.current = false;
    setScore(0);
    setSpots([]);
    setTimeLeft(DURATION);
    setRunning(true);
  }

  function spawnSpot() {
    // harder -> slightly fewer targets and smaller targets, shorter life
    const baseTargetProb = 0.66;
    const isTarget = Math.random() < baseTargetProb / difficulty; // less likely to be target as difficulty rises
    const id = Math.random().toString(36).slice(2, 9);

    const sizeBase = 20; // baseline
    const size = Math.max(8, sizeBase / difficulty + Math.random() * (18 / difficulty));
    const left = 6 + Math.random() * 88;
    const top = 6 + Math.random() * 88;
    const lifeBase = 1200;
    const life = Math.max(550, lifeBase / difficulty + Math.random() * 300);

    const spot = { id, isTarget, size, left, top, life };
    setSpots((s) => [...s, spot]);

    setTimeout(() => {
      setSpots((s) => s.filter((x) => x.id !== id));
    }, life);
  }

  function onClickSpot(spotId) {
    if (!running) return;
    setSpots((current) => {
      const spot = current.find((s) => s.id === spotId);
      if (!spot) return current;
      if (spot.isTarget) setScore((p) => Math.min(MAX_SCORE, p + CORRECT_POINTS));
      else setScore((p) => Math.max(0, p + WRONG_POINTS));
      return current.filter((s) => s.id !== spotId);
    });
  }

  return (
    <div className="text-white">
      <div className="mb-3 text-green-300 font-semibold text-lg">Micro-Spot Eliminator</div>

      <div className="flex gap-2 items-center mb-3">
        <button onClick={start} className="px-3 py-1 rounded bg-green-500 text-black">Start</button>
        <div className="text-sm text-slate-300">Week: {selectedWeek} · Difficulty ×{difficulty.toFixed(2)}</div>
      </div>

      <div className="mb-2">Time Left: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="relative h-64 border border-slate-800 rounded-lg overflow-hidden bg-[#020617]">
        {spots.map((s) => (
          <button
            key={s.id}
            onClick={() => onClickSpot(s.id)}
            className="absolute rounded-full"
            style={{
              width: s.size,
              height: s.size,
              left: `${s.left}%`,
              top: `${s.top}%`,
              transform: "translate(-50%,-50%)",
              background: s.isTarget ? "radial-gradient(circle,#10b981,#064e3b)" : "radial-gradient(circle,#333,#111)",
              border: s.isTarget ? "1px solid rgba(34,197,94,0.6)" : "1px solid rgba(255,255,255,0.06)",
            }}
            aria-label={s.isTarget ? "target" : "decoy"}
          />
        ))}
      </div>
    </div>
  );
}
