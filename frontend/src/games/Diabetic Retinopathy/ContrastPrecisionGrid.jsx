import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * ContrastPrecisionGrid (4x4) — contrast delta reduced with difficulty
 */
export default function ContrastPrecisionGrid({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const POINTS = 4;
  const MAX_SCORE = 100;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [grid, setGrid] = useState([]);
  const [targetIndex, setTargetIndex] = useState(null);
  const [score, setScore] = useState(0);
  const reported = useRef(false);

  useEffect(() => {
    let timer;
    if (running) {
      newRound();
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
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const base = 0.25 + Math.random() * 0.45;
    // delta shrinks as difficulty increases
    const delta = Math.max(0.02, 0.09 / difficulty);

    const arr = Array.from({ length: 16 }, () => base + (Math.random() - 0.5) * 0.02);
    const idx = Math.floor(Math.random() * 16);
    arr[idx] = base + delta;
    setGrid(arr);
    setTargetIndex(idx);
  }

  function onPick(i) {
    if (!running) return;
    if (i === targetIndex) setScore((s) => Math.min(MAX_SCORE, s + POINTS));
    setTimeout(newRound, 200);
  }

  return (
    <div className="text-white">
      <div className="mb-3 text-green-300 font-semibold">Contrast Precision Grid</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · Δ={ (Math.max(0.02, 0.09 / difficulty)).toFixed(3) }</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="grid grid-cols-4 gap-2">
        {grid.map((v, i) => (
          <button
            key={i}
            onClick={() => onPick(i)}
            className="aspect-square rounded-md border border-slate-700"
            style={{ background: `rgba(255,255,255,${v})` }}
            aria-label={`square-${i}`}
          />
        ))}
      </div>
    </div>
  );
}
