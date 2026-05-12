import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",

  // Backend diagnosed disease
  detectedDisease: "Diabetic Retinopathy",

  // Weeks 1–4, each with 7 challenges
  scores: Array.from({ length: 4 }, () => Array(7).fill(0)),
  // scores: [
  //   [90, 90, 90, 90, 90, 90, 90],
  //   [0, 90, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0],
  // ],                             // for testing purposes

  curWeek: 1,
  curChallenge: 1,
  selectedWeek: 1,

  diagnosed: "Some Disorder",
  date: new Date().toISOString(),
  // date: "2024-01-01",              // for testing purposes

  // Track the last date (ISO yyyy-mm-dd) the user played any exercise.
  // This enforces the "one game per day" rule.
  lastPlayedDate: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateSelectedWeek: (state, action) => {
      state.selectedWeek = action.payload;
    },

    setDisease: (state, action) => {
      state.detectedDisease = action.payload;
    },

    updateScore: (state, action) => {
      const { week, day, score } = action.payload;
      state.scores[week][day] = score;
    },

    updateSelectedWeek: (state, action) => {
			state.selectedWeek = action.payload; // Update selectedWeek
		},

    nextChallenge: (state) => {
      if (state.curChallenge < 7) {
        state.curChallenge++;
      } else {
        if (state.curWeek < 7) {
          state.curWeek++;
          state.curChallenge = 1;
        }
      }
    },

    setLastPlayedDate(state, action) {
      // action.payload should be ISO date string 'YYYY-MM-DD'
      state.lastPlayedDate = action.payload;
    },

    logoutUser(state) {
      return initialState;
    },
  },
});

export const {
  updateSelectedWeek,
  updateScore,
  nextChallenge,
  logoutUser,
  setDisease,
  setLastPlayedDate,
} = userSlice.actions;

export default userSlice.reducer;
