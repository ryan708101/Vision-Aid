import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export default function FocusSwitch({ onFinish }) {
  const selectedWeek = useSelector(s => s.user.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1)*0.18;

  const DURATION = 30;
  const CORRECT = 3;
  const WRONG = -1;
  const MAX_SCORE = 100;

  const [running,setRunning] = useState(false);
  const [timeLeft,setTimeLeft] = useState(DURATION);
  const [score,setScore] = useState(0);
  const [clearMode,setClearMode] = useState(false);

  const switchRef = useRef(null);
  const tickRef = useRef(null);
  const reported = useRef(false);

  const baseInterval = 900;
  const interval = Math.max(240, Math.round(baseInterval / difficulty));

  function start() {
    setRunning(true);
    setScore(0);
    setTimeLeft(DURATION);
    setClearMode(false);
    reported.current = false;
  }

  useEffect(() => {
    if (running) {
      switchRef.current = setInterval(() => {
        setClearMode(p => !p);
      }, interval);

      tickRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setRunning(false);
            return 0;
          }
          return t - 1;
        })
      }, 1000);
    }
    return () => {
      clearInterval(switchRef.current);
      clearInterval(tickRef.current);
    };
  }, [running, interval]);

  function tap() {
    if (!running) return;
    if (clearMode) setScore(s => Math.min(MAX_SCORE, s+CORRECT));
    else setScore(s => Math.max(0, s+WRONG));
  }

  useEffect(() => {
    if (!running && timeLeft===0 && !reported.current) {
      reported.current = true;
      onFinish?.(score);
    }
  }, [running,timeLeft,score,onFinish]);

  return (
    <div className="text-white">
      <div className="mb-2 text-green-300 font-semibold">Focus Switch</div>

      <div className="flex items-center gap-3 mb-3">
        <button onClick={start}
          className="px-3 py-1 rounded bg-green-500 text-black">Start</button>
        <span className="text-sm text-slate-400">Week {selectedWeek} · switch {interval}ms</span>
      </div>

      <div className="mb-2">Time: {timeLeft}s</div>
      <div className="mb-4">Score: {score}</div>

      <div onClick={tap}
           className="h-64 border border-slate-800 bg-[#020617] rounded-lg flex items-center justify-center cursor-pointer"
           style={{
             filter: clearMode
               ? "blur(0px) brightness(1)"
               : `blur(${3 + difficulty}px) brightness(0.85)`
           }}>
        <div className="text-3xl">
          {clearMode ? "CLEAR" : "FOGGY"}
        </div>
      </div>
    </div>
  );
}
