import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

/**
 * DistortionIdentifier — wavy distortion intensity reduced with difficulty
 * (we reduce the feDisplacementMap scale as difficulty increases, making the distortion subtler)
 */
export default function DistortionIdentifier({ onFinish }) {
  const selectedWeek = useSelector((s) => s.user?.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek - 1) * 0.18;

  const DURATION = 30;
  const POINTS = 7;
  const MAX_SCORE = 100;

  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [cells, setCells] = useState([]);
  const [target, setTarget] = useState(null);
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
    const idx = Math.floor(Math.random() * 16);
    setCells(new Array(16).fill(0).map((_, i) => i === idx));
    setTarget(idx);
  }

  function pick(i) {
    if (!running) return;
    if (i === target) setScore((s) => Math.min(MAX_SCORE, s + POINTS));
    setTimeout(newRound, 220);
  }

  // distortion scale is smaller with higher difficulty (thus subtler)
  const distortionScale = Math.max(2, Math.round(8 / difficulty));

  return (
    <div className="text-white">
      <div className="mb-3 text-green-300 font-semibold">Distortion Identifier</div>
      <div className="flex items-center gap-3 mb-3">
        <button onClick={start} className="px-3 py-1 bg-green-500 text-black rounded">Start</button>
        <div className="text-sm text-slate-300">Week {selectedWeek} · distortion scale {distortionScale}</div>
      </div>

      <div className="mb-2">Time: <strong>{timeLeft}s</strong></div>
      <div className="mb-4">Score: <strong className="text-green-300">{score}</strong></div>

      <div className="grid grid-cols-4 gap-2">
        {cells.map((isTarget, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            className="aspect-square rounded-md border border-slate-700 overflow-hidden"
            aria-label={`cell-${i}`}
          >
            {isTarget ? (
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <filter id={`w-${distortionScale}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feTurbulence baseFrequency="0.02" numOctaves="2" seed="2" />
                    <feDisplacementMap in="SourceGraphic" scale={distortionScale} />
                  </filter>
                </defs>
                <rect width="100" height="100" fill="#0b1120" filter={`url(#w-${distortionScale})`} />
              </svg>
            ) : (
              <div className="w-full h-full bg-[#0b1120]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
