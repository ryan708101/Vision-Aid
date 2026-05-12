import React,{useEffect,useRef,useState} from "react";
import { useSelector } from "react-redux";

export default function HazyMotionTracking({onFinish}) {
  const selectedWeek = useSelector(s=>s.user.selectedWeek||1);
  const difficulty = 1 + (selectedWeek-1)*0.18;

  const DURATION=30;
  const MAX_SCORE=100;
  const CORRECT=4;

  const [running,setRunning]=useState(false);
  const [timeLeft,setTimeLeft]=useState(DURATION);
  const [score,setScore]=useState(0);

  const [pos,setPos]=useState({x:50,y:50});
  const [paused,setPaused]=useState(false);

  const moveRef=useRef(null);
  const tickRef=useRef(null);
  const reported=useRef(false);

  const blurAmount = 3 + difficulty*1.6;

  function start(){
    reported.current=false;
    setScore(0);
    setRunning(true);
    setPaused(false);
    setTimeLeft(DURATION);
  }

  useEffect(()=>{
    if(running){
      // movement speed
      const moveMs = Math.max(40, Math.round(120/difficulty));

      moveRef.current=setInterval(()=>{
        // random stop?
        if(Math.random() < (0.07*difficulty)){
          setPaused(true);
          setTimeout(()=>setPaused(false), Math.max(200,500 - difficulty*50));
        } 
        if(!paused){
          setPos(p=>({
            x: Math.max(10, Math.min(90, p.x + (Math.random()*10-5))),
            y: Math.max(10, Math.min(90, p.y + (Math.random()*10-5)))
          }));
        }
      }, moveMs);

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
      clearInterval(moveRef.current);
      clearInterval(tickRef.current);
    }
  },[running,paused,difficulty]);

  function tap(){
    if(!running)return;
    if(paused) setScore(s=>Math.min(MAX_SCORE,s+CORRECT));
    else setScore(s=>Math.max(0,s-1));
  }

  useEffect(()=>{
    if(!running && timeLeft===0 && !reported.current){
      reported.current=true;
      onFinish?.(score);
    }
  },[running,timeLeft,score,onFinish]);

  return(
    <div className="text-white">
      <div className="text-green-300 mb-2 font-semibold">Hazy Motion Tracking</div>
      
      <div className="flex gap-3 items-center mb-3">
        <button className="px-3 py-1 bg-green-500 text-black rounded" onClick={start}>Start</button>
        <span className="text-sm text-slate-400">Week {selectedWeek} · blur {blurAmount}px</span>
      </div>

      <p>Time: {timeLeft}s</p>
      <p className="mb-4">Score: {score}</p>

      <div className="relative h-64 bg-[#020617] rounded border border-slate-800 overflow-hidden">
        <button
          onClick={tap}
          className="absolute rounded-full"
          style={{
            left:`${pos.x}%`,
            top:`${pos.y}%`,
            transform:'translate(-50%,-50%)',
            width:30,height:30,
            filter:`blur(${blurAmount}px)`,
            background:"radial-gradient(circle,#7efc9f,#16a34a)",
            border:"1px solid rgba(34,197,94,0.6)"
          }}
        />
      </div>
    </div>
  )
}
