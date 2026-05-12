import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const OBJECTS = ["🍎","🍌","🍇","🚗","🐶","⭐","⚽","🎧","🧸","🕶️"];

export default function FoggyVisionObjectMatch({ onFinish }) {
  const selectedWeek = useSelector(s => s.user.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1)*0.18;

  const DURATION = 30;
  const MAX_SCORE = 100;

  const [timeLeft,setTimeLeft] = useState(DURATION);
  const [running,setRunning] = useState(false);
  const [score,setScore] = useState(0);
  const [attempts,setAttempts] = useState(0);

  const [target,setTarget] = useState(null);
  const [choices,setChoices] = useState([]);

  const tickRef = useRef(null);
  const reported = useRef(false);

  function start() {
    reported.current = false;
    setRunning(true);
    setScore(0);
    setAttempts(0);
    setTimeLeft(DURATION);
    newRound();
  }

  useEffect(() => {
    if (running) {
      tickRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t<=1) {
            setRunning(false);
            return 0;
          }
          return t-1;
        })
      },1000);
    }
    return () => clearInterval(tickRef.current);
  }, [running]);

  function newRound() {
    const tgt = OBJECTS[Math.floor(Math.random()*OBJECTS.length)];
    const set = new Set([tgt]);
    while (set.size<4) {
      set.add(OBJECTS[Math.floor(Math.random()*OBJECTS.length)]);
    }
    const arr = Array.from(set).sort(() => 0.5 - Math.random());
    setTarget(tgt);
    setChoices(arr);
  }

  function choose(symbol) {
    if (!running) return;
    setAttempts(a => a+1);
    if (symbol === target) {
      setScore(s => Math.min(MAX_SCORE, s+5));
      setTimeout(newRound, 300);
    }
  }

  // dynamic blur scaling
  const blurAmount = difficulty;

  useEffect(() => {
    if (!running && timeLeft===0 && !reported.current) {
      reported.current = true;
      onFinish?.(score);
    }
  }, [running,timeLeft,score,onFinish]);

  return (
    <div className="text-white">
      <div className="text-green-300 mb-2 font-semibold">Foggy Vision Object Match</div>

      <div className="flex items-center gap-3 mb-3">
        <button className="px-3 py-1 rounded bg-green-500 text-black" onClick={start}>
          Start
        </button>
        <span className="text-sm text-slate-400">Week {selectedWeek} · blur {blurAmount}px</span>
      </div>

      <p className="mb-2">Time: {timeLeft}s</p>
      <p className="mb-4">Score: {score}</p>

      <div className="mb-3">
        Target: <span className="text-xl">{target}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-3">
        {choices.map(c => (
          <button key={c}
            onClick={() => choose(c)}
            className="aspect-square flex items-center justify-center bg-[#0a1120] rounded-lg text-3xl border border-slate-700"
            style={{ filter:`blur(${blurAmount}px) contrast(0.85)` }}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
