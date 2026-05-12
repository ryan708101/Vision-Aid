import React,{useEffect,useRef,useState} from "react";
import { useSelector } from "react-redux";

const SHAPES = ["●","■","▲","★","◆","⬟"];

export default function BlurredShapeRecognition({onFinish}) {
  const selectedWeek = useSelector(s=>s.user.selectedWeek||1);
  const difficulty = 1 + (selectedWeek-1)*0.18;

  const DURATION=30;
  const MAX_SCORE=100;
  const CORRECT=4;

  const [running,setRunning]=useState(false);
  const [timeLeft,setTimeLeft]=useState(DURATION);
  const [score,setScore]=useState(0);

  const [target,setTarget]=useState("●");
  const [choices,setChoices]=useState([]);

  const tickRef=useRef(null);
  const reported=useRef(false);

  const blurAmount = 2 + difficulty*1.4;

  function start(){
    reported.current=false;
    setScore(0);
    setRunning(true);
    setTimeLeft(DURATION);
    newRound();
  }

  function newRound(){
    const tgt = SHAPES[Math.floor(Math.random()*SHAPES.length)];
    const arr = new Set([tgt]);
    while(arr.size<4){
      arr.add(SHAPES[Math.floor(Math.random()*SHAPES.length)]);
    }
    setTarget(tgt);
    setChoices(Array.from(arr).sort(()=>0.5-Math.random()));
  }

  useEffect(()=>{
    if(running){
      tickRef.current=setInterval(()=>{
        setTimeLeft(t=>{
          if(t<=1){
            setRunning(false);
            return 0;
          }
          return t-1;
        })
      },1000)
    }
    return ()=>clearInterval(tickRef.current);
  },[running]);

  function tap(shape){
    if(!running)return;
    if(shape===target){
      setScore(s=>Math.min(MAX_SCORE,s+CORRECT));
      setTimeout(newRound,200);
    } else {
      setScore(s=>Math.max(0,s-1));
    }
  }

  useEffect(()=>{
    if(!running && timeLeft===0 && !reported.current){
      reported.current=true;
      onFinish?.(score);
    }
  },[running,timeLeft,score,onFinish]);

  return(
    <div className="text-white">
      <div className="text-green-300 mb-2 font-semibold">Blurred Shape Recognition</div>
      
      <div className="flex items-center gap-3 mb-3">
        <button className="px-3 py-1 rounded bg-green-500 text-black" onClick={start}>Start</button>
        <span className="text-sm text-slate-400">Week {selectedWeek} · blur {blurAmount}px</span>
      </div>

      <p>Time: {timeLeft}s</p>
      <p className="mb-3">Score: {score}</p>
      <p className="mb-2">Target Shape: <span className="text-2xl">{target}</span></p>

      <div className="grid grid-cols-4 gap-3 max-sm:grid-cols-3">
        {choices.map(s=>(
          <button key={s} onClick={()=>tap(s)}
            className="aspect-square text-3xl flex items-center justify-center bg-[#0d1527] border border-slate-700 rounded"
            style={{filter:`blur(${blurAmount}px)`}}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
