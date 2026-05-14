import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Thunk for login
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/login", { email, password });
      return data;
    } catch (error) {
      return rejectWithValue("Login failed");
    }
  }
);

// Thunk for register
export const registerUser = createAsyncThunk(
  "user/register",
  async ({ fullName, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/register", { fullName, email, password });
      return data;
    } catch (error) {
      return rejectWithValue("Registration failed");
    }
  }
);

// Thunk for getting user
export const getUser = createAsyncThunk(
  'user/getUser',
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/getUser', { headers: { token } });
      return data;
    } catch (error) {
      return rejectWithValue("Failed to get user");
    }
  }
);

// Thunk for updating user profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { data } = await axios.post(backendUrl + '/api/user/updateProfile', formData, { headers: { token: state.user.token } });
      return data;
    } catch (error) {
      return rejectWithValue("An error occurred");
    }
  }
);

const initialState = {
  token: localStorage.getItem('token') || "true",
  firstName: "Test",
  lastName: "User",
  email: "test@gmail.com",
  phone: "9999999999",
  photo: null,

  // Backend diagnosed disease
  detectedDisease: "Diabetic Retinopathy",

  // Weeks 1–4, each with 7 challenges
  scores: Array.from({ length: 4 }, () => Array(7).fill(0)),
  // scores: [
  //   [90, 90, 90, 90, 90, 90, 90],
  //   [0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0],
  // ],                             // for testing purposes

  curWeek: 1,
  curChallenge: 1,
  selectedWeek: 1,


  date: new Date().toISOString(),
  // date: "2024-01-01",              // for testing purposes

  // Track the last date (ISO yyyy-mm-dd) the user played any exercise.
  // This enforces the "one game per day" rule.
  lastPlayedDate: null,

  status: "idle", // loading, succeeded, failed

  badges: [],
  activityDates: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },

    updateSelectedWeek: (state, action) => {
      state.selectedWeek = action.payload;
    },

    setDisease: (state, action) => {
      state.detectedDisease = action.payload;
    },

    updateScore: (state, action) => {
      const { week, day, score } = action.payload;
      if (Number(score) > state.scores[week][day]) {
        state.scores[week][day] = Number(score);
      }
    },

    nextChallenge: (state) => {
      if (state.curChallenge < 7) {
        state.curChallenge++;
      } else {
        if (state.curWeek < 4) {
          state.curWeek++;
          state.curChallenge = 1;
        }
      }
    },

    setLastPlayedDate(state, action) {
      // action.payload should be ISO date string 'YYYY-MM-DD'
      state.lastPlayedDate = action.payload;
    },

    clearToken: (state) => {
      state.token = '';
      localStorage.setItem('token', '');
    },

    logoutUser(state) {
      localStorage.setItem('token', '');
      return initialState;
    },

    addActivityDate: (state, action) => {
			const { date, curWeek, curChallenge } = action.payload;
			// Avoid adding duplicate dates for the same challenge
			const existingActivity = state.activityDates.find(
				(activity) =>
				activity.date === date &&
				activity.weekNo === curWeek &&
				activity.challengeNo === curChallenge
			);

			if (!existingActivity) {
				state.activityDates.push({
				date: date,
				weekNo: curWeek,
				challengeNo: curChallenge,
				});
			}

			// Check if the user has completed all challenges for the current week consecutively
			const weekActivities = state.activityDates.filter(
				(activity) => activity.weekNo === curWeek
			);
			
			// Sort dates to check for consecutive streak
			weekActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
			
			// Check for consecutive dates
			const isConsecutive = weekActivities.every((_, index, arr) => {
				if (index === 0) return true;
				const prevDate = new Date(arr[index - 1].date);
				const currentDate = new Date(arr[index].date);
				const differenceInDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
				return differenceInDays === 1;
			});
			
			if (isConsecutive && weekActivities.length === 7) {
				// Mark the badge for this week as true
				state.badges[curWeek - 1] = true;
			}
		},
  },

  extraReducers: (builder) => {
    builder
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const data = action.payload;
        if (data.success) {
          localStorage.setItem('token', data.token);
          state.token = data.token;
          toast.success("Registration successful!");
        } else {
          toast.error(data.message);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        toast.error(action.payload);
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const data = action.payload;
        if (data.success) {
          localStorage.setItem('token', data.token);
          state.token = data.token;
          toast.success("Login successful!");
        } else {
          toast.error(data.message);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        toast.error(action.payload);
      })

      // getUser
      .addCase(getUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const data = action.payload;
        if (data.success) {
          Object.assign(state, data.message);
        } else {
          toast.error(data.message);
        }
      })
      .addCase(getUser.rejected, (state, action) => {
        state.status = "failed";
        toast.error(action.payload);
      })

      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        const data = action.payload;
        if (data.success) {
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        toast.error(action.payload);
      });
  },
});

export const {
  setUser,
  updateSelectedWeek,
  updateScore,
  nextChallenge,
  logoutUser,
  setDisease,
  setLastPlayedDate,
  clearToken,
  addActivityDate
} = userSlice.actions;

export default userSlice.reducer;