import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  redirect,
} from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import store from "./redux/store";
import { verifyAuth } from "./redux/slices/authSlice";

// Loader factory that takes store and returns loader function
const createProtectedLoader = (reduxStore) => async () => {
  try {
    const action = await reduxStore.dispatch(verifyAuth());
    if (action.type === verifyAuth.fulfilled.type) {
      return action.payload; // Return user data from the authentication check
    }
  } catch (e) {
    // eslint-disable-line no-unused-vars
    return redirect("/login");
  }
  return redirect("/login");
};

// Root component that wraps the protected route
const ProtectedRoute = () => {
  return <Home />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    loader: createProtectedLoader(store),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
