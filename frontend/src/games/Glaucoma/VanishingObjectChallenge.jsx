import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * VanishingObjectChallenge.jsx
 * - Objects appear and slowly fade toward edges; tap before they vanish.
 * - +3 per successful tap.
 */
export default function VanishingObjectChallenge({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const POINTS = 3;
  const MAX_SCORE = 100;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [objs, setObjs] = useState([]);
  const [score, setScore] = useState(0);

  const spawnRef = useRef(null);
  const tickRef = useRef(null);
  const reported = useRef(false);

  const baseSpawn = 900;
  const spawnMs = Math.max(260, Math.round(baseSpawn / difficulty));

  useEffect(() => {
    if (running) {
      spawnRef.current = setInterval(spawnObj, spawnMs);
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
    setObjs([]);
    setTimeLeft(DURATION);
    setRunning(true);
  }

  function spawnObj() {
    const id = Math.random().toString(36).slice(2, 9);
    const left = 8 + Math.random() * 84;
    const top = 8 + Math.random() * 84;
    // fade faster at higher difficulty
    const life = Math.max(420, Math.round(1400 / difficulty));
    const obj = { id, left, top, life, alpha: 1 };
    setObjs((a) => [...a, obj]);

    // fade alpha progressively
    const steps = 8;
    const stepMs = Math.max(40, Math.round(life / steps));
    let step = 0;
    const fade = setInterval(() => {
      step++;
      setObjs((cur) => cur.map((o) => (o.id === id ? { ...o, alpha: Math.max(0, 1 - step / steps) } : o)));
      if (step >= steps) {
        clearInterval(fade);
      }
    }, stepMs);

    setTimeout(() => {
      setObjs((a) => a.filter((x) => x.id !== id));
      clearInterval(fade);
    }, life + 40);
  }

  function tap(id) {
    if (!running) return;
    setObjs((arr) => {
      const o = arr.find((x) => x.id === id);
      if (!o) return arr;
      // require tapping before alpha < 0.6 to count
      if (o.alpha >= 0.3) {
        setScore((s) => Math.min(MAX_SCORE, s + POINTS));
      } else {
        setScore((s) => Math.max(0, s - 1));
      }
      return arr.filter((x) => x.id !== id);
    });
  }

  return (
    <div className="text-white">
      <div className="mb-2 text-green-300 font-semibold">Vanishing Object Challenge</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · spawn {spawnMs}ms</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="relative h-64 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden">
        {objs.map((o) => (
          <button
            key={o.id}
            onClick={() => tap(o.id)}
            className="absolute rounded-md"
            style={{
              left: `${o.left}%`,
              top: `${o.top}%`,
              transform: "translate(-50%,-50%)",
              width: 26,
              height: 26,
              background: "radial-gradient(circle,#7efc9f,#16a34a)",
              opacity: o.alpha,
              border: "1px solid rgba(34,197,94,0.5)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
