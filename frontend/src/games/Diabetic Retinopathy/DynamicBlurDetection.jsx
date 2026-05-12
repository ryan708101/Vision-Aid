import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * DynamicBlurDetection — blur toggle frequency increases with difficulty
 */
export default function DynamicBlurDetection({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const CORRECT = 3;
  const WRONG = -1;
  const MAX_SCORE = 100;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [isSharp, setIsSharp] = useState(false);
  const [score, setScore] = useState(0);
  const reported = useRef(false);

  // base flip interval (ms). Harder -> faster flips
  const flipBase = 900;
  const flipMs = Math.max(300, Math.round(flipBase / difficulty));

  useEffect(() => {
    let t, flipTimer;
    if (running) {
      setIsSharp(false);
      flipTimer = setInterval(() => setIsSharp((p) => !p), flipMs);
      t = setInterval(() => {
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
      clearInterval(flipTimer);
      clearInterval(t);
    };
  }, [running, flipMs]);

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
    setIsSharp(false);
    setRunning(true);
  }

  function onTap() {
    if (!running) return;
    if (isSharp) setScore((s) => Math.min(MAX_SCORE, s + CORRECT));
    else setScore((s) => Math.max(0, s + WRONG));
  }

  return (
    <div className="text-white">
      <div className="mb-3 text-green-300 font-semibold">Dynamic Blur Detection</div>
      <div className="flex gap-2 items-center mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · flip {flipMs}ms</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div
        onClick={onTap}
        className="h-64 rounded-lg border border-slate-800 flex items-center justify-center bg-[#020617] cursor-pointer"
        style={{
          filter: isSharp ? "blur(0px) contrast(1.05)" : "blur(4px) contrast(0.75)",
          transition: "filter 0.12s linear",
        }}
      >
        <div className="text-3xl font-semibold">{isSharp ? "CLEAR" : "BLUR"}</div>
      </div>
    </div>
  );
}
