import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosConfig";

// Async thunks
export const fetchUserUrls = createAsyncThunk(
  "urls/fetchUserUrls",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/urls/user");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch URLs",
      );
    }
  },
);

export const shortenUrl = createAsyncThunk(
  "urls/shortenUrl",
  async (longUrl, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/urls/create", {
        base_url: "http://www.activity-time.com",
        // custom_alias: "my-link",
        expires_at: "2024-12-31T23:59:59.000Z",
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to shorten URL",
      );
    }
  },
);

export const deleteUrl = createAsyncThunk(
  "urls/deleteUrl",
  async (urlId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/urls/${urlId}`);
      return urlId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete URL",
      );
    }
  },
);

const initialState = {
  urls: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

const urlSlice = createSlice({
  name: "urls",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch user URLs
    builder
      .addCase(fetchUserUrls.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserUrls.fulfilled, (state, action) => {
        state.isLoading = false;
        state.urls = action.payload;
      })
      .addCase(fetchUserUrls.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Shorten URL
    builder
      .addCase(shortenUrl.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(shortenUrl.fulfilled, (state, action) => {
        state.isLoading = false;
        state.urls.unshift(action.payload);
        state.successMessage = "URL shortened successfully!";
      })
      .addCase(shortenUrl.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete URL
    builder
      .addCase(deleteUrl.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUrl.fulfilled, (state, action) => {
        state.isLoading = false;
        state.urls = state.urls.filter((url) => url.id !== action.payload);
        state.successMessage = "URL deleted successfully!";
      })
      .addCase(deleteUrl.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, setSuccessMessage } =
  urlSlice.actions;
export default urlSlice.reducer;
