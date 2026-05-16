import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { updateSelectedWeek } from "@/redux/userSlice";
import { useNavigate } from "react-router-dom";
import { assets } from "@/assets/assets";
import { diseaseGameMap } from "@/constants/diseaseGameMap";

const ExercisePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [detectedDisease, setDetectedDisease] = useState(
    user?.detectedDisease || "Normal"
  );

  const [progress, setProgress] = useState(0);

  // Redirect unauthenticated user
  useEffect(() => {
    if (!user.token) {
      navigate("/login");
      toast.error("Please Login First!");
    }
  }, [user.token]);

  // If user has no disorders
  if (user && user.detectedDisease === "Normal") {
    return (
      <div className="pt-40 pb-20 max-w-[1280px] mx-auto text-center font-bold text-3xl flex items-center flex-col">
        <span className="text-primary-blue">Congratulations!</span> <br />
        You have no diagnosed disorders. <br />
        Keep taking care of your well-being!
        <img className="w-[300px] h-[300px]" src={assets.PartyPopper} alt="" />
      </div>
    );
  }

  // Calculate progress bar %
  useEffect(() => {
    setProgress(
      (
        (((user.curWeek - 1) * 7 + (user.curChallenge - 1)) * 100) /
        28
      ).toFixed(2)
    );
  }, [user]);

  const handleWeekClick = (week) => {
    if (week > user.curWeek) {
      toast.error("Complete the current week's challenge to unlock this!");
    } else {
      dispatch(updateSelectedWeek(week));
    }
  };

  // Unlock logic
  const calculateUnlockDate = (creationDate, week, day) => {
    const base = new Date(creationDate);
    base.setDate(base.getDate() + week * 7 + day);
    return base;
  };

  const isChallengeAvailable = (week, day) => {
    const today = new Date();
    const unlockDate = calculateUnlockDate(user.date, week, day);
    return today >= unlockDate - 1;
  };

  const isPreviousChallengeSolved = (week, day) => {
    if (day === 0 && week === 0) return true;

    if (day > 0) day--;
    else {
      day = 6;
      week = week === 0 ? 0 : week - 1;
    }

    return user.scores[week][day] >= 80;
  };

  // Card Components
  const CompletedCard = ({ day, gameName }) => (
    <div
      onClick={() => navigate(`/exercise/${day + 1}`)}
      className="bg-[#17c964] cursor-pointer flex flex-col gap-2 text-white items-center px-4 py-2 rounded-xl min-h-[250px] justify-center"
    >
      <div className="text-black bg-white w-[120px] h-[120px] p-3 inline-flex justify-center items-center rounded-full font-medium text-2xl">
        Day {day + 1}
      </div>
      <p className="font-semibold text-lg">{gameName}</p>
      <p className="font-semibold text-lg mt-[-6px]">
        Best Score: {user.scores[user.selectedWeek - 1][day].toFixed(2)}%
      </p>
    </div>
  );

  const ChallengeCard = ({ day, gameName }) => {
    const colors = [
      assets.violet,
      assets.indigo,
      assets.blue,
      assets.green,
      assets.yellow,
      assets.orange,
      assets.red,
    ];

    const bgImage = colors[day];

    return (
      <div
        onClick={() => {
          if (isChallengeAvailable(user.selectedWeek - 1, day)) {
            if (!isPreviousChallengeSolved(user.selectedWeek - 1, day)) {
              toast.error("Please solve the previous challenge first!");
            } else navigate(`/exercise/${day + 1}`);
          } else {
            toast.error("Please wait for the challenge to unlock!");
          }
        }}
        className="flex flex-col gap-4 cursor-pointer text-white items-center px-4 py-2 rounded-xl min-h-[250px] justify-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-black bg-white w-[120px] h-[120px] p-3 inline-flex justify-center items-center rounded-full font-medium text-2xl">
          Day {day + 1}
        </div>
        <p className="font-semibold bg-white/60 text-black px-3 py-1 rounded-lg text-center min-h-[60px]">
          {gameName}
        </p>
      </div>
    );
  };

  const games = diseaseGameMap[detectedDisease] ?? Array(7).fill("Exercise");

  return (
    <div className="pt-40 max-w-[1280px] mx-auto flex flex-col pb-20 items-center max-md:pt-20">

      {/* Disease Name */}
      <div className="text-xl font-semibold mb-4 text-white">
        Exercises for:{" "}
        <span className="text-primary-blue">{detectedDisease}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 w-full px-10 max-w-[900px]">
        <p className="text-sm mt-2 text-white">Your Progress: {progress}%</p>
        <div className="h-4 bg-gray-200 rounded-full">
          <div
            className="h-4 bg-green-500 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Week Bar */}
      <div className="flex items-start gap-4">
        <span className="text-white">Week: </span>
        <div className="flex flex-wrap gap-4 max-380px:gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`p-2 rounded-md cursor-pointer w-[30px] h-[30px] inline-flex items-center justify-center ${
                i + 1 === user.selectedWeek
                  ? "bg-primary-blue text-white"
                  : i + 1 < user.curWeek
                  ? "bg-green-500 text-white"
                  : "bg-white text-black border border-black"
              }`}
              onClick={() => handleWeekClick(i + 1)}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,240px))] gap-4 p-4 w-full mx-auto justify-center max-w-[1100px]">
        {Array.from({ length: 7 }).map((_, i) => {
          const isCompleted =
            user.selectedWeek - 1 < user.curWeek - 1 ||
            (user.selectedWeek - 1 === user.curWeek - 1 &&
              i === user.curChallenge - 1 &&
              user.scores[user.curWeek - 1][user.curChallenge - 1] >= 80) ||
            (user.selectedWeek - 1 === user.curWeek - 1 &&
              i < user.curChallenge - 1);

          return isCompleted ? (
            <CompletedCard key={i} day={i} gameName={games[i]} />
          ) : (
            <ChallengeCard key={i} day={i} gameName={games[i]} />
          );
        })}
      </div>
    </div>
  );
};

export default ExercisePage;
