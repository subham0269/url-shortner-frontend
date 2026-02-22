# Redux Toolkit Integration Guide

## Overview
This project has been fully integrated with **Redux Toolkit**, providing centralized state management for authentication and URL management operations.

## Project Structure

```
src/
├── redux/
│   ├── store.js              # Redux store configuration
│   └── slices/
│       ├── authSlice.js      # Authentication state and actions
│       └── urlSlice.js       # URL management state and actions
├── components/
│   ├── Login.jsx             # Login component with Redux
│   ├── Signup.jsx            # Signup component with Redux
│   ├── Home.jsx              # Home component with Redux
│   ├── Auth.css
│   └── Home.css
├── utils/
│   ├── auth.js               # Authentication utilities
│   └── axiosConfig.js        # Axios configuration
├── App.jsx                   # Router configuration
└── main.jsx                  # Redux Provider setup
```

## Key Files & Changes

### 1. Redux Store Configuration (`src/redux/store.js`)
- Configured with Redux Toolkit's `configureStore`
- Combines two slices: `auth` and `urls`
- Enables Redux DevTools for debugging

```javascript
const store = configureStore({
  reducer: {
    auth: authReducer,
    urls: urlReducer,
  },
});
```

### 2. Authentication Slice (`src/redux/slices/authSlice.js`)
**State Structure:**
```javascript
{
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  successMessage: null
}
```

**Async Thunks:**
- `login(credentials)` - Authenticate user
- `signup(formData)` - Register new user
- `verifyAuth()` - Check authentication status
- `logout()` - Log out user

**Synchronous Actions:**
- `clearError()` - Clear error messages
- `clearSuccessMessage()` - Clear success messages
- `setSuccessMessage(message)` - Set success message

### 3. URL Management Slice (`src/redux/slices/urlSlice.js`)
**State Structure:**
```javascript
{
  urls: [],
  isLoading: false,
  error: null,
  successMessage: null
}
```

**Async Thunks:**
- `fetchUserUrls()` - Retrieve all user's shortened URLs
- `shortenUrl(longUrl)` - Create a new shortened URL
- `deleteUrl(urlId)` - Delete a shortened URL

**Synchronous Actions:**
- `clearError()` - Clear error messages
- `clearSuccessMessage()` - Clear success messages
- `setSuccessMessage(message)` - Set success message

### 4. Component Updates

#### Login Component (`src/components/Login.jsx`)
- Uses `useDispatch()` to dispatch `login` action
- Uses `useSelector()` to access auth state (isLoading, error, isAuthenticated)
- Automatically navigates to home on successful login
- Displays Redux-managed error messages

#### Signup Component (`src/components/Signup.jsx`)
- Uses `useDispatch()` to dispatch `signup` action
- Validates form client-side
- Uses `useSelector()` to access auth state
- Redirects to login on successful signup with success message

#### Home Component (`src/components/Home.jsx`)
- Uses `useDispatch()` to manage URL operations
- Uses `useSelector()` to access URLs and auth state
- Fetches URLs on component mount
- Added logout functionality
- Added delete URL capability with confirmation
- Auto-clear notifications after 3 seconds

### 5. Redux Provider Setup (`src/main.jsx`)
- Wrapped `App` component with Redux `Provider`
- Passes configured store to provider

```javascript
<Provider store={store}>
  <App />
</Provider>
```

## Redux Selectors Usage

### Auth Selectors
```javascript
// In any component
const { user, isAuthenticated, isLoading, error, successMessage } = useSelector(
  (state) => state.auth
);
```

### URL Selectors
```javascript
const { urls, isLoading, error, successMessage } = useSelector(
  (state) => state.urls
);
```

## Common Patterns

### Dispatching Async Actions
```javascript
import { useDispatch } from 'react-redux';
import { login } from '../redux/slices/authSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  
  const handleLogin = (credentials) => {
    dispatch(login(credentials));
  };
};
```

### Handling Thunk Results
```javascript
dispatch(signup(formData)).then((action) => {
  if (action.type === signup.fulfilled.type) {
    // Handle success
  }
});
```

### Async Operations with Auto-Clear Notifications
```javascript
useEffect(() => {
  if (successMessage) {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [successMessage, dispatch]);
```

## Benefits of Redux Toolkit Integration

1. **Centralized State Management** - Single source of truth for app state
2. **Reduced Boilerplate** - Redux Toolkit simplifies reducer creation
3. **Built-in DevTools** - Easy debugging with Redux DevTools extension
4. **Async Thunks** - Simplified async action handling
5. **Immer Integration** - Write "mutating" logic in reducers safely
6. **Better Performance** - Optimized re-renders with selectors
7. **Consistency** - Standardized patterns across components

## API Integration

All API calls are made through `axiosInstance` from `utils/axiosConfig.js`:

**Auth Endpoints:**
- `POST /auth/login` - Login user
- `POST /auth/signup` - Register user
- `GET /auth/verify` - Verify authentication
- `POST /auth/logout` - Logout user

**URL Endpoints:**
- `GET /urls/user` - Fetch user's URLs
- `POST /urls/shorten` - Create shortened URL
- `DELETE /urls/{id}` - Delete shortened URL

## Redux DevTools

To use Redux DevTools Chrome extension:
1. Install the extension from Chrome Web Store
2. Redux Toolkit automatically enables it in development
3. Open DevTools (F12) → Redux tab to inspect state changes

## Future Enhancements

1. Persist Redux state to localStorage using redux-persist
2. Add pagination to URL list
3. Implement URL search/filter
4. Add URL analytics
5. Implement error boundary for better error handling
6. Add loading skeletons for better UX
7. Implement optimistic updates for faster response
