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
      return data; // { user }
    } catch {
      return rejectWithValue(null);
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
const userSlice = createSlice({
  name: "user",

  initialState: {
    user: null,
    token: null,
    loading: false,
    checkingAuth: true,
    error: null,
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
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.checkingAuth = false;
        state.user = null;
      })

      /* LOGOUT */
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { logout, setUser } = userSlice.actions;
export default userSlice.reducer;