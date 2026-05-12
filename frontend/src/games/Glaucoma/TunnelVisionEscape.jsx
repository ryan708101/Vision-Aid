import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * TunnelVisionEscape.jsx
 * - Shrinking tunnel; targets appear near the ring's edge; user taps them.
 * - +4 per correct.
 * - Difficulty: ring shrinks faster and edge area narrower with week.
 */
export default function TunnelVisionEscape({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const MAX_SCORE = 100;
  const POINTS = 4;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [targets, setTargets] = useState([]);
  const [ringSize, setRingSize] = useState(100);
  const [score, setScore] = useState(0);

  const tickRef = useRef(null);
  const spawnRef = useRef(null);
  const reported = useRef(false);

  // ring shrink speed ms
  const baseShrinkMs = 700;
  const shrinkMs = Math.max(220, Math.round(baseShrinkMs / difficulty));
  const shrinkAmountPerTick = Math.min(4 + difficulty, 10);

  useEffect(() => {
    if (running) {
      setRingSize(100);
      spawnRef.current = setInterval(spawnEdgeTarget, Math.max(400, 1000 - difficulty * 80));
      tickRef.current = setInterval(() => {
        setRingSize((r) => Math.max(20, r - shrinkAmountPerTick));
        setTimeLeft((t) => {
          if (t <= 1) {
            setRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, shrinkMs);
    }
    return () => {
      clearInterval(spawnRef.current);
      clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, shrinkMs]);

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
    setRingSize(100);
    setTimeLeft(DURATION);
    setRunning(true);
  }

  function spawnEdgeTarget() {
    // spawn around the ring edge area: angle random, radius ~ ringSize/2 +/- small
    const angle = Math.random() * Math.PI * 2;
    const radius = 42 + (ringSize / 2) * 0.8; // closer to edge
    const centerX = 50;
    const centerY = 50;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const id = Math.random().toString(36).slice(2, 9);
    const life = Math.max(500, Math.round(1100 / difficulty));
    const t = { id, x, y, life, correct: true };
    setTargets((s) => [...s, t]);
    setTimeout(() => setTargets((s) => s.filter((z) => z.id !== id)), life);
  }

  function tap(id) {
    if (!running) return;
    setTargets((arr) => {
      const t = arr.find((x) => x.id === id);
      if (!t) return arr;
      if (t.correct) setScore((s) => Math.min(MAX_SCORE, s + POINTS));
      return arr.filter((x) => x.id !== id);
    });
  }

  return (
    <div className="text-white">
      <div className="mb-2 text-green-300 font-semibold">Tunnel Vision Escape</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · shrink {shrinkMs}ms</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="relative h-64 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden">
        {/* shrinking ring visual */}
        <div
          style={{
            position: "absolute",
            left: `${50 - ringSize / 2}%`,
            top: `${50 - ringSize / 2}%`,
            width: `${ringSize}%`,
            height: `${ringSize}%`,
            borderRadius: "50%",
            border: "4px solid rgba(255,255,255,0.04)",
            boxShadow: "inset 0 0 80px rgba(0,0,0,0.6)",
            transform: "translate(-50%,-50%)",
          }}
        />
        {targets.map((t) => (
          <button
            key={t.id}
            onClick={() => tap(t.id)}
            className="absolute rounded-full"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              transform: "translate(-50%,-50%)",
              width: 18,
              height: 18,
              background: "radial-gradient(circle,#7efc9f,#16a34a)",
              border: "1px solid rgba(34,197,94,0.6)",
            }}
            aria-label="edge-target"
          />
        ))}
      </div>
    </div>
  );
}
