import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * SideFlashRecognizer.jsx
 * - Quick flashes appear left or right; press corresponding side.
 * - +2 correct, -1 wrong.
 * - Flashes faster at higher difficulty.
 */
export default function SideFlashRecognizer({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const CORRECT = 2;
  const WRONG = -1;
  const MAX_SCORE = 100;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [flashSide, setFlashSide] = useState(null); // "left" | "right" | null
  const [score, setScore] = useState(0);

  const flashRef = useRef(null);
  const tickRef = useRef(null);
  const reported = useRef(false);

  // flash frequency
  const baseInterval = 900;
  const interval = Math.max(260, Math.round(baseInterval / difficulty));

  useEffect(() => {
    if (running) {
      flashRef.current = setInterval(() => {
        setFlashSide(Math.random() < 0.5 ? "left" : "right");
        // clear after short random time
        setTimeout(() => setFlashSide(null), Math.max(180, 360 - difficulty * 20));
      }, interval);

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
      clearInterval(flashRef.current);
      clearInterval(tickRef.current);
    };
  }, [running, interval, difficulty]);

  useEffect(() => {
    if (!running && timeLeft === 0 && !reported.current) {
      reported.current = true;
      onFinish?.(score);
    }
  }, [running, timeLeft, score, onFinish]);

  function start() {
    reported.current = false;
    setScore(0);
    setFlashSide(null);
    setTimeLeft(DURATION);
    setRunning(true);
  }

  function respond(side) {
    if (!running) return;
    if (flashSide === null) {
      // early/false press - penalize slightly
      setScore((s) => Math.max(0, s + WRONG));
      return;
    }
    if (side === flashSide) setScore((s) => Math.min(MAX_SCORE, s + CORRECT));
    else setScore((s) => Math.max(0, s + WRONG));
    // hide current flash briefly
    setFlashSide(null);
  }

  return (
    <div className="text-white">
      <div className="mb-2 text-green-300 font-semibold">Side Flash Recognizer</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · interval {interval}ms</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="relative h-64 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden flex">
        {/* left flash */}
        <div className="w-1/2 flex items-center justify-center">
          <div className={`w-40 h-40 rounded-full transition-all ${flashSide === "left" ? "bg-green-400/80 scale-105" : "bg-white/3"}`} />
        </div>
        <div className="w-1/2 flex items-center justify-center">
          <div className={`w-40 h-40 rounded-full transition-all ${flashSide === "right" ? "bg-green-400/80 scale-105" : "bg-white/3"}`} />
        </div>

        {/* Controls overlay */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-3">
          <button onClick={() => respond("left")} className="px-3 py-1 bg-slate-800 text-slate-200 rounded border border-slate-700">Left</button>
          <button onClick={() => respond("right")} className="px-3 py-1 bg-slate-800 text-slate-200 rounded border border-slate-700">Right</button>
        </div>
      </div>
    </div>
  );
}
