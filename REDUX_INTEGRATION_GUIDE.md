# Redux Toolkit Integration Guide for URL Shortener Frontend

## Table of Contents

1. [Setup & Installation](#setup--installation)
2. [Project Structure](#project-structure)
3. [State Design](#state-design)
4. [Best Practices](#best-practices)
5. [Production Optimizations](#production-optimizations)
6. [Implementation Steps](#implementation-steps)
7. [Migration Strategy](#migration-strategy)

---

## Setup & Installation

### 1. Install Redux Toolkit and React-Redux

```bash
npm install @reduxjs/toolkit react-redux
```

### 2. Project Dependencies Context

Your current stack:

- **React**: 19.1.1 (latest)
- **React Router**: 7.9.4 (latest)
- **Axios**: 1.13.0 (API client)
- **Vite**: 7.1.7 (bundler)

Redux Toolkit is production-ready with your current setup.

---

## Project Structure

### Recommended Redux Folder Structure

```
src/
├── redux/
│   ├── store.js                    # Redux store configuration
│   ├── slices/
│   │   ├── authSlice.js           # Authentication state & thunks
│   │   ├── urlSlice.js            # URL shortening state & thunks
│   │   └── uiSlice.js             # UI state (loading, notifications)
│   ├── thunks/
│   │   ├── authThunks.js          # API calls for auth
│   │   └── urlThunks.js           # API calls for URLs
│   ├── selectors/
│   │   ├── authSelectors.js       # Auth state selectors
│   │   ├── urlSelectors.js        # URL state selectors
│   │   └── uiSelectors.js         # UI state selectors
│   └── hooks.js                    # Custom Redux hooks (useAppDispatch, useAppSelector)
├── components/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── Auth.jsx
├── utils/
│   ├── axiosConfig.js
│   └── constants.js               # Redux-related constants
├── App.jsx
└── main.jsx
```

---

## State Design

### 1. Authentication State

```javascript
{
  auth: {
    user: null,          // { id, email, name }
    token: null,         // JWT token
    isAuthenticated: false,
    loading: false,
    error: null
  }
}
```

### 2. URL Shortening State

```javascript
{
  urls: {
    items: [],           // Array of shortened URLs
    loading: false,
    error: null,
    totalCount: 0,       // For pagination
    currentPage: 1
  }
}
```

### 3. UI State

```javascript
{
  ui: {
    notifications: [],   // { id, message, type: 'success'|'error' }
    isLoading: false,
    notifications: {
      message: null,
      type: null,        // 'success' | 'error' | 'warning'
      visible: false
    }
  }
}
```

---

## Best Practices

### 1. **Use Redux Toolkit's createSlice**

- Automatically generates action creators
- Built-in Immer for immutable updates
- Simpler API than classic Redux

```javascript
// ✅ DO
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload; // Immer handles immutability
    },
  },
});

// ❌ DON'T
// Don't manually create action creators or write complex reducer logic
```

### 2. **Use createAsyncThunk for API Calls**

- Handles pending, fulfilled, rejected states automatically
- Better error handling
- Integrates with Redux DevTools

```javascript
// ✅ DO
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// ❌ DON'T
// Don't make API calls directly in components
// Don't dispatch multiple actions manually for loading/error states
```

### 3. **Create Custom Hooks**

Encapsulate Redux logic for type safety and consistency.

```javascript
// src/redux/hooks.js
import { useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
```

### 4. **Use Selectors**

Memoize selectors to prevent unnecessary re-renders.

```javascript
// src/redux/selectors/authSelectors.js
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

// Memoized selectors
export const selectUserName = (state) => state.auth.user?.name;
```

### 5. **Normalize State Shape**

Keep state flat and avoid deeply nested structures.

```javascript
// ✅ DO - Flat structure
{
  urls: {
    byId: { '1': { id: '1', shortCode: 'abc123', ... } },
    allIds: ['1', '2', '3'],
    loading: false
  }
}

// ❌ DON'T - Deeply nested
{
  urls: [
    { id: '1', user: { id: 1, name: 'John', data: {...} }, ... }
  ]
}
```

### 6. **Error Handling Strategy**

```javascript
// Consistent error handling across slices
const handleError = (state, action) => {
  state.loading = false;
  state.error = action.payload?.message || "An error occurred";
};
```

### 7. **Environment Variables**

```javascript
// .env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_REDUX_DEVTOOLS_ENABLED=true
```

---

## Production Optimizations

### 1. **Enable Redux DevTools Safely**

```javascript
// src/redux/store.js
const store = configureStore({
  reducer: {
    auth: authReducer,
    urls: urlReducer,
    ui: uiReducer,
  },
  devTools: import.meta.env.DEV, // Only enable in development
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific actions that contain non-serializable values
        ignoredActions: ["auth/loginUser/fulfilled"],
        ignoredActionPaths: ["payload.timestamp"],
        ignoredPaths: ["auth.lastError.config"],
      },
    }),
});
```

### 2. **Code Splitting with Redux**

```javascript
// Create separate stores for different features if needed
// Or lazy load slices with dynamic imports
const authSlice = await import("./slices/authSlice");
```

### 3. **Memoization & Performance**

```javascript
// Use shallowEqual for multiple selectors
import { shallowEqual } from "react-redux";

// Avoid selector chains
// ✅ DO
const user = useAppSelector((state) => state.auth.user);

// ❌ DON'T
const user = useAppSelector((state) => state.auth)?.user;
```

### 4. **Bundle Size Optimization**

```javascript
// Redux Toolkit is ~6KB gzipped (minimal impact)
// Compare with Context API + useReducer: ~0KB but more boilerplate

// Monitor bundle size
npm run build -- --analyze
```

### 5. **Async Thunk Optimization**

```javascript
// Use condition to prevent duplicate requests
export const fetchUserUrls = createAsyncThunk(
  "urls/fetchUserUrls",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    // Skip if already loading
    if (state.urls.loading) {
      return state.urls.items;
    }
    try {
      const response = await axiosInstance.get("/urls/user");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);
```

### 6. **Middleware Configuration**

```javascript
// Only add necessary middleware
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    immutableCheck: !import.meta.env.PROD, // Disable in production
    serializableCheck: !import.meta.env.PROD,
  });
```

### 7. **State Persistence (Optional)**

```javascript
// Install: npm install redux-persist
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
  blacklist: ["ui"], // Don't persist UI state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
```

---

## Implementation Steps

### Step 1: Create Store Configuration

```javascript
// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import urlReducer from "./slices/urlSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    urls: urlReducer,
    ui: uiReducer,
  },
  devTools: import.meta.env.DEV,
});
```

### Step 2: Wrap App with Redux Provider

```javascript
// src/main.jsx
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
```

### Step 3: Create Auth Slice

```javascript
// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosConfig";

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/verify");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/signup", credentials);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("token");
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Auth check failed";
        state.isAuthenticated = false;
        state.user = null;
      })
      // loginUser
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
        state.error = action.payload?.message || "Login failed";
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
```

### Step 4: Create URL Slice

```javascript
// src/redux/slices/urlSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosConfig";

export const fetchUserUrls = createAsyncThunk(
  "urls/fetchUserUrls",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/urls/user");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const createShortenedUrl = createAsyncThunk(
  "urls/createShortenedUrl",
  async (longUrl, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/urls/shorten", { longUrl });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
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
      return rejectWithValue(error.response?.data);
    }
  },
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  totalCount: 0,
};

const urlSlice = createSlice({
  name: "urls",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserUrls
      .addCase(fetchUserUrls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserUrls.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchUserUrls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch URLs";
      })
      // createShortenedUrl
      .addCase(createShortenedUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShortenedUrl.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createShortenedUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to shorten URL";
      })
      // deleteUrl
      .addCase(deleteUrl.fulfilled, (state, action) => {
        state.items = state.items.filter((url) => url.id !== action.payload);
        state.totalCount -= 1;
      });
  },
});

export const { clearError } = urlSlice.actions;
export default urlSlice.reducer;
```

### Step 5: Create Custom Hooks

```javascript
// src/redux/hooks.js
import { useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
```

### Step 6: Create Selectors

```javascript
// src/redux/selectors/authSelectors.js
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

// src/redux/selectors/urlSelectors.js
export const selectUrls = (state) => state.urls.items;
export const selectUrlsLoading = (state) => state.urls.loading;
export const selectUrlsError = (state) => state.urls.error;
export const selectUrlsCount = (state) => state.urls.totalCount;
```

---

## Migration Strategy

### Phase 1: Setup (No Breaking Changes)

1. Install Redux Toolkit and React-Redux
2. Create Redux folder structure
3. Set up store and wrap App with Provider
4. Keep existing components working

### Phase 2: Migrate Authentication

1. Create authSlice with thunks
2. Update `App.jsx` route loader to use Redux dispatch
3. Replace `checkAuth()` utility with Redux thunk
4. Update `Login.jsx` and `Signup.jsx` to use Redux

### Phase 3: Migrate URL Management

1. Create urlSlice with thunks
2. Update `Home.jsx` to use Redux selectors
3. Replace local state with Redux state
4. Remove axios calls from components

### Phase 4: Cleanup

1. Remove unused local state management
2. Add Redux DevTools extension
3. Optimize selectors for performance
4. Add error boundary and error handling

---

## File Templates

### Before (Current) - With Local State

```jsx
// src/components/Home.jsx
const Home = () => {
  const [longUrl, setLongUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/urls/shorten", { longUrl });
      setUrls([response.data, ...urls]);
    } catch (error) {
      setError(error.response?.data?.message);
    }
  };
};
```

### After (Redux) - Cleaner Component

```jsx
// src/components/Home.jsx
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectUrls, selectUrlsLoading } from "../redux/selectors/urlSelectors";
import { createShortenedUrl, fetchUserUrls } from "../redux/slices/urlSlice";

const Home = () => {
  const dispatch = useAppDispatch();
  const urls = useAppSelector(selectUrls);
  const loading = useAppSelector(selectUrlsLoading);

  useEffect(() => {
    dispatch(fetchUserUrls());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createShortenedUrl(longUrl));
  };
};
```

---

## Key Advantages for Your Project

✅ **Centralized State Management** - All authentication and URL data in one place
✅ **Predictable State Updates** - Easier to debug with Redux DevTools
✅ **Better Performance** - Memoized selectors prevent unnecessary re-renders
✅ **Cleaner Components** - Remove local state logic from components
✅ **Scalability** - Easy to add features (pagination, filtering, caching)
✅ **Type Safety** - Ready for TypeScript migration
✅ **Testing** - Pure reducers are easier to test

---

## Production Checklist

- [ ] Disable Redux DevTools in production
- [ ] Remove console.log statements
- [ ] Configure error handling and logging
- [ ] Implement state persistence (if needed)
- [ ] Add TypeScript for better type safety
- [ ] Set up error boundaries
- [ ] Configure middleware for API error handling
- [ ] Test all async thunks thoroughly
- [ ] Optimize selector memoization
- [ ] Review bundle size impact

---

## Common Pitfalls to Avoid

❌ **Don't** mutate state directly (Redux Toolkit's Immer prevents this)
❌ **Don't** put API URLs in actions (use constants or environment variables)
❌ **Don't** store everything in Redux (only global state)
❌ **Don't** create selectors inside components (create at module level)
❌ **Don't** ignore error handling in thunks
❌ **Don't** use `useSelector` without selectors
❌ **Don't** dispatch thunks from the reducer

---

## Resources

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Redux Style Guide](https://redux.js.org/style-guide/style-guide)
- [Immer Documentation](https://immerjs.github.io/immer/)
- [React-Redux Hooks API](https://react-redux.js.org/api/hooks)
