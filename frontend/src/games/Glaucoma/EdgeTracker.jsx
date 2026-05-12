import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * EdgeTracker.jsx
 * - Peripheral motion detection: a short motion strip appears; user drags central marker in direction.
 * - +4 correct per detection.
 */
export default function EdgeTracker({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const POINTS = 4;
  const MAX_SCORE = 100;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [motions, setMotions] = useState([]); // {id, dir:'left'|'right'|'up'|'down', left, top, life}
  const [score, setScore] = useState(0);

  const spawnRef = useRef(null);
  const tickRef = useRef(null);
  const reported = useRef(false);

  const baseInterval = 1200;
  const interval = Math.max(420, Math.round(baseInterval / difficulty));

  useEffect(() => {
    if (running) {
      spawnRef.current = setInterval(spawnMotion, Math.max(380, interval));
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
  }, [running, interval]);

  useEffect(() => {
    if (!running && timeLeft === 0 && !reported.current) {
      reported.current = true;
      onFinish?.(score);
    }
  }, [running, timeLeft, score, onFinish]);

  function start() {
    reported.current = false;
    setScore(0);
    setMotions([]);
    setTimeLeft(DURATION);
    setRunning(true);
  }

  function spawnMotion() {
    const dirs = ["left", "right", "up", "down"];
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    const id = Math.random().toString(36).slice(2, 9);
    const left = 10 + Math.random() * 80;
    const top = 10 + Math.random() * 80;
    const life = Math.max(520, Math.round(1200 / difficulty));
    const m = { id, dir, left, top, life };
    setMotions((a) => [...a, m]);
    setTimeout(() => setMotions((a) => a.filter((x) => x.id !== id)), life);
  }

  function respond(id, dirChosen) {
    if (!running) return;
    setMotions((arr) =>
      arr.map((m) => {
        if (m.id === id) {
          if (m.dir === dirChosen) {
            setScore((s) => Math.min(MAX_SCORE, s + POINTS));
          } else {
            setScore((s) => Math.max(0, s - 1));
          }
          return { ...m, tapped: true };
        }
        return m;
      })
    );
  }

  return (
    <div className="text-white">
      <div className="mb-2 text-green-300 font-semibold">Edge Tracker</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · spawn {interval}ms</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="relative h-64 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden">
        {motions.map((m) => (
          <div key={m.id} className="absolute" style={{ left: `${m.left}%`, top: `${m.top}%`, transform: "translate(-50%,-50%)" }}>
            <div className="mb-2 text-xs text-slate-400 text-center">Motion</div>
            <div className="flex gap-2">
              <button onClick={() => respond(m.id, "left")} className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Left</button>
              <button onClick={() => respond(m.id, "right")} className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Right</button>
              <button onClick={() => respond(m.id, "up")} className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Up</button>
              <button onClick={() => respond(m.id, "down")} className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Down</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
