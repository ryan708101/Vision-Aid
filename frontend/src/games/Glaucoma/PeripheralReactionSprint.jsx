import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * PeripheralReactionSprint.jsx
 * - 4 corner zones; targets appear there; tap the correct corner.
 * - +2 per correct tap.
 */
export default function PeripheralReactionSprint({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const POINTS = 2;
  const MAX_SCORE = 100;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [targets, setTargets] = useState([]); // {id, corner:0..3}
  const [score, setScore] = useState(0);
  const spawnRef = useRef(null);
  const tickRef = useRef(null);
  const reported = useRef(false);

  const baseSpawn = 900;
  const spawnMs = Math.max(260, Math.round(baseSpawn / difficulty));

  useEffect(() => {
    if (running) {
      spawnRef.current = setInterval(spawnCornerTarget, spawnMs);
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

  function spawnCornerTarget() {
    const corner = Math.floor(Math.random() * 4);
    const id = Math.random().toString(36).slice(2, 9);
    const life = Math.max(500, Math.round(1200 / difficulty));
    setTargets((t) => [...t, { id, corner, life }]);
    setTimeout(() => setTargets((t) => t.filter((x) => x.id !== id)), life);
  }

  function tapCorner(index, id) {
    if (!running) return;
    setTargets((arr) =>
      arr.map((t) => {
        if (t.id === id) {
          if (t.corner === index) setScore((s) => Math.min(MAX_SCORE, s + POINTS));
          else setScore((s) => Math.max(0, s - 1));
          return { ...t, tapped: true };
        }
        return t;
      })
    );
  }

  const cornerToStyle = (i) => {
    if (i === 0) return { left: "6%", top: "6%" };
    if (i === 1) return { left: "94%", top: "6%" };
    if (i === 2) return { left: "6%", top: "94%" };
    return { left: "94%", top: "94%" };
  };

  return (
    <div className="text-white">
      <div className="mb-2 text-green-300 font-semibold">Peripheral Reaction Sprint</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · spawn {spawnMs}ms</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="relative h-64 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden">
        {/* render corners */}
        {targets.map((t) => {
          const pos = cornerToStyle(t.corner);
          return (
            <div key={t.id} style={{ position: "absolute", left: pos.left, top: pos.top, transform: "translate(-50%,-50%)" }}>
              <div className="flex gap-2">
                <button onClick={() => tapCorner(t.corner, t.id)} className="w-12 h-12 rounded-full bg-green-500/80 border border-slate-700" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
