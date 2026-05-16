// ============================================
// 1. UPDATED GameRouter.jsx
// ============================================
import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  handleGameCompletion,
} from "@/redux/userSlice";
import { toast } from "react-toastify";
import { todayISO, isSameDay } from "@/utils/dateUtils";
import { diseaseGameMap } from "@/constants/diseaseGameMap";

/* ------------------------------------------------------------------
    IMPORT — DIABETIC RETINOPATHY GAMES
------------------------------------------------------------------ */
import MicroSpotEliminator from "../games/Diabetic Retinopathy/MicroSpotEliminator";
import ContrastPrecisionGrid from "../games/Diabetic Retinopathy/ContrastPrecisionGrid";
import DynamicBlurDetection from "../games/Diabetic Retinopathy/DynamicBlurDetection";
import PixelClaritySprint from "../games/Diabetic Retinopathy/PixelClaritySprint";
import MicroContrastMatch from "../games/Diabetic Retinopathy/MicroContrastMatch";
import DistortionIdentifier from "../games/Diabetic Retinopathy/DistortionIdentifier";
import ClearPathReaction from "../games/Diabetic Retinopathy/ClearPathReaction";

/* ------------------------------------------------------------------
    IMPORT — GLAUCOMA GAMES
------------------------------------------------------------------ */
import PeripheralTargetCatch from "../games/Glaucoma/PeripheralTargetCatch";
import TunnelVisionEscape from "../games/Glaucoma/TunnelVisionEscape";
import SideFlashRecognizer from "../games/Glaucoma/SideFlashRecognizer";
import BlindSpotMaze from "../games/Glaucoma/BlindSpotMaze";
import EdgeTracker from "../games/Glaucoma/EdgeTracker";
import PeripheralReactionSprint from "../games/Glaucoma/PeripheralReactionSprint";
import VanishingObjectChallenge from "../games/Glaucoma/VanishingObjectChallenge";

/* ------------------------------------------------------------------
    IMPORT — CATARACT GAMES
------------------------------------------------------------------ */
import GlareAdaptation from "../games/Cataract/GlareAdaptation.jsx";
import FocusSwitch from "../games/Cataract/FocusSwitch";
import FoggyVisionObjectMatch from "../games/Cataract/FoggyVisionObjectMatch";
import ContrastSliderChallenge from "../games/Cataract/ContrastSliderChallenge";
import BlurredShapeRecognition from "../games/Cataract/BlurredShapeRecognition";
import HazyMotionTracking from "../games/Cataract/HazyMotionTracking";
import LowContrastSymbolSort from "../games/Cataract/LowContrastSymbolSort";

/* ==================================================================
    GAME ROUTER
================================================================== */
const GameRouter = () => {
  const { day } = useParams(); // "1" to "7"
  const index = Math.max(0, Math.min(6, Number(day) - 1));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user);
  const [submitting, setSubmitting] = useState(false);

  const detectedDisease = user?.detectedDisease || "Normal";
  const diseaseGames = diseaseGameMap[detectedDisease] ?? Array.from({ length: 7 }, (_, i) => `Game ${i+1}`);


  /* ------------------------------------------------------------------
      GAME COMPONENT MAPPING BY DISEASE
  ------------------------------------------------------------------ */
  const GameComponent = useMemo(() => {

    const drGames = [
      MicroSpotEliminator,
      ContrastPrecisionGrid,
      DynamicBlurDetection,
      PixelClaritySprint,
      MicroContrastMatch,
      DistortionIdentifier,
      ClearPathReaction,
    ];

    const glaucomaGames = [
      PeripheralTargetCatch,
      TunnelVisionEscape,
      SideFlashRecognizer,
      BlindSpotMaze,
      EdgeTracker,
      PeripheralReactionSprint,
      VanishingObjectChallenge,
    ];

    const cataractGames = [
      GlareAdaptation,
      FocusSwitch,
      FoggyVisionObjectMatch,
      ContrastSliderChallenge,
      BlurredShapeRecognition,
      HazyMotionTracking,
      LowContrastSymbolSort,
    ];

    const maps = {
      "Diabetic Retinopathy": drGames,
      "Glaucoma": glaucomaGames,
      "Cataract": cataractGames,
    };

    const chosen = maps[detectedDisease]?.[index];
    if (chosen) return chosen;

    return () => (
      <div className="p-6 text-white">
        <h3 className="text-lg">No game defined for: {detectedDisease}</h3>
      </div>
    );
  }, [detectedDisease, index]);

  /* ------------------------------------------------------------------
      ONE GAME PER DAY CHECK
  ------------------------------------------------------------------ */
  const alreadyPlayedToday = isSameDay(user?.lastPlayedDate, todayISO());

  const isAllowedToPlayThisDay = (() => {
    if (!alreadyPlayedToday) return true;
    const todayDayIndex = user.curChallenge - 1;
    return index === todayDayIndex;
  })();


  /* ------------------------------------------------------------------
      HANDLE GAME COMPLETION - NOW WITH BACKEND
  ------------------------------------------------------------------ */
  async function onFinish(finalScore) {
    if (typeof finalScore !== "number") {
      console.warn("onFinish requires a numeric score.");
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      const score = Math.max(0, Math.min(100, Number(finalScore.toFixed(2))));
      const week = user.selectedWeek - 1;
      const dayIndex = index;

      // Dispatch thunk to update backend and frontend
      const result = await dispatch(handleGameCompletion({
        score,
        week,
        day: dayIndex,
        lastPlayedDate: todayISO()
      })).unwrap();

      if (result.success) {
        if (score >= 80) {
          toast.success(`Great job! You scored ${score}. Moving to next challenge!`);
        } else {
          toast.info(`Score: ${score}. Aim for ≥ 80% to clear this day.`);
        }
        
        setTimeout(() => navigate("/exercise"), 900);
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to update score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ------------------------------------------------------------------
      BLOCK GAME IF ALREADY PLAYED TODAY
  ------------------------------------------------------------------ */
  if (!isAllowedToPlayThisDay) {
    return (
      <div className="pt-20 max-w-2xl mx-auto p-6">
        <div className="rounded-lg p-6 bg-gradient-to-b from-black to-[#02102a] border border-slate-800">
          <h2 className="text-xl font-semibold text-green-300">
            Locked — You've already played today's game
          </h2>
          <p className="mt-2 text-slate-300">
            Come back tomorrow to play the next challenge!
          </p>

          <button
            onClick={() => navigate("/exercise")}
            className="mt-4 px-4 py-2 bg-green-500 text-black rounded"
          >
            Back to Exercises
          </button>
        </div>
      </div>
    );
  }


  /* ------------------------------------------------------------------
      RENDER GAME PAGE
  ------------------------------------------------------------------ */
  const gameName = diseaseGames[index] ?? `Game ${index + 1}`;

  return (
    <div className="pt-40 max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">{gameName}</h1>
          <p className="text-sm text-slate-400">Disease: {detectedDisease}</p>
        </div>

        <button
          onClick={() => navigate("/exercise")}
          className="px-3 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"
        >
          Back
        </button>
      </div>

      <div className="rounded-lg p-4 bg-[#020617] border border-slate-800">
        <GameComponent onFinish={onFinish} />
      </div>
    </div>
  );
};

export default GameRouter;