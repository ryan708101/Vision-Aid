import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * Micro-Contrast Match (3 patches) — contrast delta reduces with difficulty
 */
export default function MicroContrastMatch({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const MAX_SCORE = 100;
  const POINTS = 5;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [patches, setPatches] = useState([]);
  const [target, setTarget] = useState(0);
  const [score, setScore] = useState(0);
  const reported = useRef(false);

  useEffect(() => {
    let timer;
    if (running) {
      newRound();
      timer = setInterval(() => {
        setTimeLeft((v) => {
          if (v <= 1) {
            setRunning(false);
            return 0;
          }
          return v - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [running]);

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

  function newRound() {
    const base = 0.28 + Math.random() * 0.36;
    const delta = Math.max(0.02, 0.08 / difficulty); // smaller delta with difficulty
    const idx = Math.floor(Math.random() * 3);
    const arr = [0, 1, 2].map((i) => (i === idx ? base + delta : base + (Math.random() - 0.5) * 0.01));
    setPatches(arr);
    setTarget(idx);
  }

  function pick(i) {
    if (!running) return;
    if (i === target) setScore((s) => Math.min(MAX_SCORE, s + POINTS));
    setTimeout(newRound, 200);
  }

  return (
    <div className="text-white">
      <div className="mb-3 text-green-300 font-semibold">Micro-Contrast Match</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · Δ={(Math.max(0.02, 0.08 / difficulty)).toFixed(3)}</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="flex gap-3 justify-center">
        {patches.map((v, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            className="w-20 h-20 rounded-md border border-slate-700"
            style={{ background: `rgba(255,255,255,${v})` }}
            aria-label={`patch-${i}`}
          />
        ))}
      </div>
    </div>
  );
}
