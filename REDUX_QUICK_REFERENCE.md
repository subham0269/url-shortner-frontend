# Redux Toolkit Quick Reference Guide

## 🏗️ File Structure

```
src/
├── redux/
│   ├── store.js              # Redux store with configureStore
│   └── slices/
│       ├── authSlice.js      # Auth state: user, auth status, loading, errors
│       └── urlSlice.js       # URLs state: list, loading, errors
├── components/
│   ├── Login.jsx             # Uses Redux auth actions
│   ├── Signup.jsx            # Uses Redux auth actions
│   └── Home.jsx              # Uses Redux auth & URLs actions
├── App.jsx                   # Router with protected routes
└── main.jsx                  # Redux Provider wrapper
```

## 📌 Quick Commands

### Import Redux Hooks

```javascript
import { useDispatch, useSelector } from "react-redux";
```

### Import Actions

```javascript
// Auth actions
import {
  login,
  signup,
  verifyAuth,
  logout,
  clearError,
} from "../redux/slices/authSlice";

// URL actions
import {
  fetchUserUrls,
  shortenUrl,
  deleteUrl,
  clearError,
} from "../redux/slices/urlSlice";
```

## 🎬 Common Patterns

### Get State from Redux

```javascript
// In any component
const { user, isAuthenticated, isLoading, error } = useSelector(
  (state) => state.auth,
);

const { urls, isLoading, error } = useSelector((state) => state.urls);
```

### Dispatch Actions

```javascript
const dispatch = useDispatch();

// Async action (thunk)
dispatch(login({ email: "user@example.com", password: "pass" }));

// Sync action
dispatch(clearError());
```

### Handle Async Results

```javascript
dispatch(signup(formData)).then((action) => {
  if (action.type === signup.fulfilled.type) {
    console.log("Signup successful!");
    navigate("/login");
  }
});
```

## 🔑 Auth State Usage

```javascript
const {
  user, // null | { fullName, emailId, id, ... }
  isAuthenticated, // true | false
  isLoading, // true | false (during API calls)
  error, // null | string (error message)
  successMessage, // null | string (success message)
} = useSelector((state) => state.auth);
```

## 🔗 URL State Usage

```javascript
const {
  urls, // array of { id, longUrl, shortUrl, ... }
  isLoading, // true | false (during API calls)
  error, // null | string (error message)
  successMessage, // null | string (success message)
} = useSelector((state) => state.urls);
```

## 📡 Auth Thunks

| Thunk        | Parameters                      | Returns         | Side Effect       |
| ------------ | ------------------------------- | --------------- | ----------------- |
| `login`      | `{ email, password }`           | user data       | Sets auth state   |
| `signup`     | `{ fullName, email, password }` | success message | Shows message     |
| `verifyAuth` | none                            | user data       | Loads auth data   |
| `logout`     | none                            | null            | Clears auth state |

## 🔗 URL Thunks

| Thunk           | Parameters       | Returns       | Effect               |
| --------------- | ---------------- | ------------- | -------------------- |
| `fetchUserUrls` | none             | array of URLs | Populates urls array |
| `shortenUrl`    | string (longUrl) | URL object    | Adds to urls array   |
| `deleteUrl`     | string (urlId)   | urlId         | Removes from array   |

## 🎨 Error Handling Example

```javascript
const { error } = useSelector((state) => state.auth);

return (
  <div>
    {error && <div className="error-message">{error}</div>}
    <button onClick={() => dispatch(login(credentials))}>Login</button>
  </div>
);
```

## ⏱️ Auto-Clear Notifications

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

## 🔐 Protected Route Check

```javascript
// In route loader
async function protectedLoader() {
  try {
    const response = await axiosInstance.get("/auth/verify");
    return response.data;
  } catch (e) {
    return redirect("/login");
  }
}
```

## 💾 Redux DevTools

1. Install Redux DevTools Chrome extension
2. Open DevTools (F12) → Redux tab
3. See all dispatched actions and state changes in real-time

## 🚀 Performance Tips

1. **Use specific selectors** instead of accessing entire state
2. **Memoize selectors** if component receives same data
3. **Avoid creating new objects** in selectors
4. **Use useCallback** for dispatch dependencies

## 🐛 Debugging Tips

1. Check Redux DevTools for action history
2. Use `console.log` with `useSelector` to debug state
3. Look at error state in Redux DevTools
4. Check network tab for API calls
5. Verify thunk is dispatched (Redux DevTools)

## 📋 State Flow Example

```
User fills login form
    ↓
dispatch(login({ email, password }))
    ↓
login thunk starts (pending)
    ↓
Component shows "Logging in..." (isLoading = true)
    ↓
API call to /auth/login
    ↓
Success received
    ↓
login thunk fulfills
    ↓
Store updates: isAuthenticated = true, user = {...}
    ↓
Component re-renders
    ↓
useNavigate redirects to "/"
```

## 🎯 Testing Actions

```javascript
// Test login
it("should login user", () => {
  const credentials = { email: "test@test.com", password: "password" };
  store.dispatch(login(credentials));
  const state = store.getState();
  expect(state.auth.isLoading).toBe(true);
});
```

---

**For more details, see:**

- `REDUX_TOOLKIT_INTEGRATION.md` - Comprehensive guide
- `REDUX_INTEGRATION_SUMMARY.md` - Implementation summary
