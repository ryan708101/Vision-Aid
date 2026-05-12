import React,{useEffect,useRef,useState} from "react";
import { useSelector } from "react-redux";

const SYMBOLS = ["@", "#", "%", "&", "$", "+"];

export default function LowContrastSymbolSort({onFinish}) {
  const selectedWeek = useSelector(s=>s.user.selectedWeek||1);
  const difficulty = 1 + (selectedWeek-1)*0.18;

  const DURATION=30;
  const POINTS=2;
  const MAX_SCORE=100;

  const [running,setRunning]=useState(false);
  const [timeLeft,setTimeLeft]=useState(DURATION);
  const [score,setScore]=useState(0);

  const [target,setTarget]=useState(null);
  const [symbols,setSymbols]=useState([]);

  const spawnRef=useRef(null);
  const tickRef=useRef(null);
  const reported=useRef(false);

  const baseSpawn=1000;
  const spawnMs=Math.max(260,Math.round(baseSpawn/difficulty));

  function start(){
    reported.current=false;
    setRunning(true);
    setScore(0);
    setSymbols([]);
    setTimeLeft(DURATION);
    pickTarget();
  }

  function pickTarget(){
    const t = SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)];
    setTarget(t);
  }

  useEffect(()=>{
    if(running){
      spawnRef.current=setInterval(spawnSymbol,spawnMs);

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

    return ()=>{
      clearInterval(spawnRef.current);
      clearInterval(tickRef.current);
    }
  },[running,spawnMs]);

  function spawnSymbol(){
    const id=Math.random().toString(36).slice(2,9);
    const left=8+Math.random()*84;
    const top=8+Math.random()*84;

    const s={
      id,
      symbol: SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)],
      left, top,
      life:Math.max(400,Math.round(1200/difficulty)),
      opacity:0.1 + Math.random()*0.4 // low contrast
    };

    setSymbols(arr=>[...arr,s]);

    setTimeout(()=>{
      setSymbols(arr=>arr.filter(x=>x.id!==id));
    },s.life);
  }

  function tap(id){
    if(!running)return;
    setSymbols(arr=>{
      const o=arr.find(x=>x.id===id);
      if(!o)return arr;
      if(o.symbol===target) setScore(s=>Math.min(MAX_SCORE,s+POINTS));
      else setScore(s=>Math.max(0,s-1));
      return arr.filter(x=>x.id!==id);
    })
  }

  // report once
  useEffect(()=>{
    if(!running && timeLeft===0 && !reported.current){
      reported.current=true;
      onFinish?.(score);
    }
  },[running,timeLeft,score,onFinish]);

  return(
    <div className="text-white">
      <div className="text-green-300 mb-2 font-semibold">Low-Contrast Symbol Sort</div>

      <div className="flex items-center gap-3 mb-3">
        <button className="px-3 py-1 bg-green-500 text-black rounded" onClick={start}>Start</button>
        <span className="text-sm text-slate-400">Week {selectedWeek} · spawn {spawnMs}ms</span>
      </div>

      <p>Time: {timeLeft}s</p>
      <p className="mb-4">Score: {score}</p>

      <div className="mb-3">Target Symbol: <span className="text-xl">{target}</span></div>

      <div className="relative h-64 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden">
        {symbols.map(s=>(
          <button
            key={s.id}
            onClick={()=>tap(s.id)}
            className="absolute flex items-center justify-center text-2xl rounded p-1"
            style={{
              left:`${s.left}%`,
              top:`${s.top}%`,
              transform:"translate(-50%,-50%)",
              opacity:s.opacity,
              color:"white"
            }}
          >
            {s.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
