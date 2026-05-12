import React,{useEffect,useRef,useState} from "react";
import { useSelector } from "react-redux";

export default function ContrastSliderChallenge({onFinish}) {
  const selectedWeek = useSelector(s => s.user.selectedWeek || 1);
  const difficulty = 1 + (selectedWeek -1)*0.18;

  const DURATION = 30;
  const MAX_SCORE = 100;

  const [timeLeft,setTimeLeft] = useState(DURATION);
  const [running,setRunning] = useState(false);
  const [score,setScore] = useState(0);

  const [targetContrast,setTargetContrast] = useState(1);
  const [current,setCurrent] = useState(1);

  const tickRef = useRef(null);
  const reported = useRef(false);

  function start() {
    reported.current = false;
    setScore(0);
    setTimeLeft(DURATION);
    setRunning(true);
    newRound();
  }

  function newRound() {
    // narrower range with difficulty
    const tc = 0.6 + Math.random()*0.4;
    setTargetContrast(tc);
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
        });
      },1000)
    }
    return () => clearInterval(tickRef.current);
  },[running]);

  function submit() {
    if (!running) return;
    const diff = Math.abs(current - targetContrast);
    const tolerance = Math.max(0.05, 0.18/difficulty);
    if (diff <= tolerance) setScore(s => Math.min(MAX_SCORE, s+6));
    else setScore(s => Math.max(0, s-1));
    newRound();
  }

  useEffect(() => {
    if (!running && timeLeft===0 && !reported.current) {
      reported.current = true;
      onFinish?.(score);
    }
  }, [running,timeLeft,score,onFinish]);

  return (
    <div className="text-white">
      <div className="text-green-300 mb-2 font-semibold">Contrast Slider Challenge</div>
      
      <div className="flex gap-3 items-center mb-3">
        <button className="px-3 py-1 rounded bg-green-500 text-black" onClick={start}>Start</button>
        <span className="text-sm text-slate-400">Week {selectedWeek}</span>
      </div>

      <p>Time: {timeLeft}s</p>
      <p className="mb-4">Score: {score}</p>

      <div className="mb-2">Match this contrast:</div>
      <div className="w-32 h-20 rounded bg-white mb-3"
        style={{opacity: targetContrast}} />

      <input type="range" min="0.4" max="1" step="0.01"
        value={current} onChange={e=>setCurrent(parseFloat(e.target.value))}
        className="w-full mb-4"
      />

      <div className="w-32 h-20 rounded bg-white mb-3"
        style={{opacity: current}} />

      <button onClick={submit}
        className="px-3 py-1 bg-slate-800 rounded border border-slate-600">
        Check
      </button>
    </div>
  );
}
