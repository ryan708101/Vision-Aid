import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

/* ==================================================================
   ASYNC THUNKS - API CALLS
================================================================== */

// Login user
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/login", { 
        email, 
        password 
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Register user
export const registerUser = createAsyncThunk(
  "user/register",
  async ({ fullName, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/register", { 
        fullName, 
        email, 
        password 
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

// Get user data
export const getUser = createAsyncThunk(
  'user/getUser',
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/getUser', { 
        headers: { token } 
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to get user");
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { data } = await axios.post(
        backendUrl + '/api/user/updateProfile', 
        formData, 
        { headers: { token: state.user.token } }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

// Update detected disease after diagnosis
export const updateDetectedDisease = createAsyncThunk(
  'user/updateDetectedDisease',
  async ({ disease }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { data } = await axios.post(
        `${backendUrl}/api/user/updateDisease`,
        { detectedDisease: disease },
        { headers: { token: state.user.token } }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update disease");
    }
  }
);

// Handle game completion
export const handleGameCompletion = createAsyncThunk(
  'user/handleGameCompletion',
  async ({ score, week, day, lastPlayedDate }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { curWeek, curChallenge } = state.user;
      
      // Calculate next week and challenge based on score
      let nextWeek = curWeek;
      let nextChallenge = curChallenge;
      
      if (score >= 80) {
        if (curChallenge === 7) {
          if (curWeek < 4) {
            nextWeek = curWeek + 1;
            nextChallenge = 1;
          }
        } else {
          nextChallenge = curChallenge + 1;
        }
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/handleGameCompletion`,
        {
          score,
          week,
          day,
          curWeek,
          curChallenge,
          nextWeek,
          nextChallenge,
          lastPlayedDate,
          date: new Date().toISOString()
        },
        { headers: { token: state.user.token } }
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete game");
    }
  }
);

/* ==================================================================
   INITIAL STATE
================================================================== */

const initialState = {
  token: localStorage.getItem('token') || "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  photo: null,

  // Detected disease from diagnosis
  detectedDisease: "",

  // Progress tracking
  curWeek: 1,
  curChallenge: 1,
  selectedWeek: 1,

  // Scores: 4 weeks x 7 challenges
  scores: Array.from({ length: 4 }, () => Array(7).fill(0)),

  // Badges and activity tracking
  badges: Array(4).fill(false),
  activityDates: [],

  // Last played date for daily limit
  lastPlayedDate: null,

  // Account creation date
  date: new Date().toISOString(),

  // Loading status
  status: "idle",
};

/* ==================================================================
   SLICE
================================================================== */

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set multiple user properties at once
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },

    // Update selected week for UI
    updateSelectedWeek: (state, action) => {
      state.selectedWeek = action.payload;
    },

    // Clear token (logout helper)
    clearToken: (state) => {
      state.token = '';
      localStorage.setItem('token', '');
    },

    // Full logout - reset to initial state
    logoutUser: () => {
      localStorage.setItem('token', '');
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ============================================================
         REGISTER USER
      ============================================================ */
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

      /* ============================================================
         LOGIN USER
      ============================================================ */
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

      /* ============================================================
         GET USER
      ============================================================ */
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

      /* ============================================================
         UPDATE PROFILE
      ============================================================ */
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
      })

      /* ============================================================
         UPDATE DETECTED DISEASE
      ============================================================ */
      .addCase(updateDetectedDisease.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateDetectedDisease.fulfilled, (state, action) => {
        state.status = "succeeded";
        const data = action.payload;
        if (data.success) {
          state.detectedDisease = data.detectedDisease;
          toast.success("Diagnosis saved successfully!");
        } else {
          toast.error(data.message);
        }
      })
      .addCase(updateDetectedDisease.rejected, (state, action) => {
        state.status = "failed";
        toast.error(action.payload);
      })

      /* ============================================================
         HANDLE GAME COMPLETION
      ============================================================ */
      .addCase(handleGameCompletion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(handleGameCompletion.fulfilled, (state, action) => {
        state.status = "succeeded";
        const data = action.payload;
        if (data.success) {
          // Update all game-related fields from backend
          state.scores = data.updatedUser.scores;
          state.curWeek = data.updatedUser.curWeek;
          state.curChallenge = data.updatedUser.curChallenge;
          state.lastPlayedDate = data.updatedUser.lastPlayedDate;
          state.activityDates = data.updatedUser.activityDates;
          state.badges = data.updatedUser.badges;
        } else {
          toast.error(data.message);
        }
      })
      .addCase(handleGameCompletion.rejected, (state, action) => {
        state.status = "failed";
        toast.error(action.payload);
      });
  },
});

/* ==================================================================
   EXPORTS
================================================================== */

export const {
  setUser,
  updateSelectedWeek,
  clearToken,
  logoutUser,
} = userSlice.actions;

export default userSlice.reducer;