import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* =======================
   LOGIN USER
======================= */
export const loginUser = createAsyncThunk(
  "user/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        credentials,
        { withCredentials: true }
      );
      return data; // { user, token }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);

/* =======================
   GET CURRENT USER
======================= */
export const getCurrentUser = createAsyncThunk(
  "user/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        { withCredentials: true }
      );
      return data;
    } catch (err) {
      console.log("AUTH ERROR:", err.response); // 👈 add this
      return rejectWithValue(err.response?.data || "Unauthorized");
    }
  }
);

/* =======================
   LOGOUT USER
======================= */
export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      return true;
    } catch {
      return rejectWithValue("Logout failed");
    }
  }
);

/* =======================
   USER SLICE
======================= */
export const userSlice = createSlice({
  name: "user",

  initialState: {
    user: null,
    token: null,
    loading: false,
    checkingAuth: false,
    error: null,
    isAuthenticated: false,
  },

  reducers: {
    /* ✅ ADD THIS */
    setUser: (state, action) => {
      state.user = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
    resetAuthState: (state) => {
  state.loading = false;
  state.error = null;
},
  },

  extraReducers: (builder) => {
    builder

      /* LOGIN */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* AUTH CHECK */
      .addCase(getCurrentUser.pending, (state) => {
        state.checkingAuth = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.checkingAuth = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.checkingAuth = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      /* LOGOUT */
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
        state.isAuthenticated = false;
      });
  },
});
export const { setUser, logout, resetAuthState } = userSlice.actions;

export default userSlice.reducer;