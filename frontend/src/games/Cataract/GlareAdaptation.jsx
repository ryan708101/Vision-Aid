import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

export default function GlareAdaptation({ onFinish }) {
  const selectedWeek = useSelector(s => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const CORRECT = 3;
  const WRONG = -1;
  const MAX_SCORE = 100;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [glares, setGlares] = useState([]);
  const [score, setScore] = useState(0);

  const spawnRef = useRef(null);
  const tickRef = useRef(null);
  const reported = useRef(false);

  const baseSpawn = 1000;
  const spawnMs = Math.max(260, Math.round(baseSpawn / difficulty));

  function start() {
    reported.current = false;
    setScore(0);
    setGlares([]);
    setTimeLeft(DURATION);
    setRunning(true);
  }

  useEffect(() => {
    if (running) {
      spawnRef.current = setInterval(spawnGlare, spawnMs);

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
      clearInterval(spawnRef.current);
      clearInterval(tickRef.current);
    };
  }, [running, spawnMs]);

  function spawnGlare() {
    const id = Math.random().toString(36).slice(2,9);
    const left = 10 + Math.random() * 80;
    const top = 10 + Math.random() * 80;

    const size = Math.max(40, 90 / difficulty);
    const life = Math.max(600, Math.round(1500 / difficulty));

    const glare = {
      id,
      left,
      top,
      size,
      innerSize: size * (0.28 + Math.random()*0.15),
      life
    };

    setGlares(g => [...g, glare]);

    setTimeout(() => {
      setGlares(g => g.filter(x => x.id !== id));
    }, life);
  }

  function tap(id, isInner) {
    if (!running) return;
    setGlares(cur =>
      cur.filter(g => {
        if (g.id === id) {
          if (isInner) setScore(s => Math.min(MAX_SCORE, s + CORRECT));
          else setScore(s => Math.max(0, s + WRONG));
        }
        return g.id !== id;
      })
    );
  }

  // FIRE FINAL SCORE ONCE
  useEffect(() => {
    if (!running && timeLeft === 0 && !reported.current) {
      reported.current = true;
      onFinish?.(score);
    }
  }, [running, timeLeft, score, onFinish]);

  return (
    <div className="text-white">
      <div className="mb-2 text-green-300 font-semibold">Glare Adaptation</div>

      <div className="flex items-center gap-3 mb-3">
        <button onClick={start}
          className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <span className="text-sm text-slate-400">Week {selectedWeek} · spawn {spawnMs}ms</span>
      </div>

      <div className="mb-2">Time: {timeLeft}s</div>
      <div className="mb-4">Score: {score}</div>

      <div className="relative h-64 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden">

        {glares.map(g => (
          <div key={g.id} className="absolute"
               style={{ left:`${g.left}%`, top:`${g.top}%`, transform:'translate(-50%,-50%)' }}>
             
            {/* Outer Glare */}
            <div
              onClick={() => tap(g.id, false)}
              style={{
                width:g.size, height:g.size,
                borderRadius:'50%',
                background:'radial-gradient(circle,#ffffffaa,#ffffff07)',
                filter:`blur(${8 / difficulty}px) brightness(1.3)`,
                position:'absolute',
                left:0, top:0
              }}
            />

            {/* Inner Correct Spot */}
            <div
              onClick={() => tap(g.id, true)}
              style={{
                width:g.innerSize, height:g.innerSize,
                borderRadius:'50%',
                background:'radial-gradient(circle,#16a34a,#065f46)',
                position:'absolute',
                top:'50%', left:'50%',
                transform:'translate(-50%,-50%)',
                border:'1px solid rgba(34,197,94,0.45)'
              }}
            />

          </div>
        ))}

      </div>
    </div>
  );
}
