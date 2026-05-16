import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * PeripheralTargetCatch.jsx
 * - Objects pop up near screen edges; tap quickly.
 * - +3 per correct tap, -1 per wrong tap.
 * - 30s timer, reports score 0-100 via onFinish once.
 */
export default function PeripheralTargetCatch({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const MAX_SCORE = 100;
  const CORRECT = 10;
  const WRONG = -1;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);

  const spawnRef = useRef(null);
  const tickRef = useRef(null);
  const reported = useRef(false);

  // faster spawn with difficulty
  const baseSpawn = 900;
  const spawnMs = Math.max(240, Math.round(baseSpawn / difficulty));

  useEffect(() => {
    if (running) {
      spawnRef.current = setInterval(spawnTarget, spawnMs);
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
      clearInterval(spawnRef.current);
      clearInterval(tickRef.current);
    };
  }, [running, spawnMs]);

  useEffect(() => {
    if (!running && timeLeft === 0 && !reported.current) {
      reported.current = true;
      onFinish?.(score);
    }
  }, [running, timeLeft, score, onFinish]);

  function start() {
    reported.current = false;
    setScore(0);
    setTargets([]);
    setTimeLeft(DURATION);
    setRunning(true);
  }

  function spawnTarget() {
    const isReal = Math.random() < Math.max(0.45, 0.75 / difficulty); // fewer real on high difficulty
    const id = Math.random().toString(36).slice(2, 9);
    // place near left or right edge
    const side = Math.random() < 0.5 ? "left" : "right";
    const left = side === "left" ? (3 + Math.random() * 10) : (90 + Math.random() * 6);
    const top = 6 + Math.random() * 88;
    const life = Math.max(500, Math.round(1200 / difficulty + Math.random() * 400));
    const size = Math.max(10, Math.round(18 / difficulty));

    const t = { id, isReal, left, top, life, size };
    setTargets((s) => [...s, t]);

    setTimeout(() => {
      setTargets((s) => s.filter((x) => x.id !== id));
    }, life);
  }

  function tap(id) {
    if (!running) return;
    setTargets((arr) => {
      const t = arr.find((x) => x.id === id);
      if (!t) return arr;
      if (t.isReal) setScore((s) => Math.min(MAX_SCORE, s + CORRECT));
      else setScore((s) => Math.max(0, s + WRONG));
      return arr.filter((x) => x.id !== id);
    });
  }

  return (
    <div className="text-white">
      <div className="mb-2 text-green-300 font-semibold">Peripheral Target Catch</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · spawn {spawnMs}ms</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="relative h-64 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden">
        {targets.map((t) => (
          <button
            key={t.id}
            onClick={() => tap(t.id)}
            className="absolute rounded-full"
            style={{
              left: `${t.left}%`,
              top: `${t.top}%`,
              transform: "translate(-50%,-50%)",
              width: t.size,
              height: t.size,
              background: t.isReal ? "radial-gradient(circle,#7efc9f,#16a34a)" : "radial-gradient(circle,#555,#222)",
              border: t.isReal ? "1px solid rgba(34,197,94,0.6)" : "1px solid rgba(255,255,255,0.06)",
            }}
            aria-label={t.isReal ? "target" : "decoy"}
          />
        ))}
      </div>
    </div>
  );
}
