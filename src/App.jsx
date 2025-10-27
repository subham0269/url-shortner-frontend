import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { checkAuth } from "./utils/auth";

// Loader function for protected routes
async function protectedLoader() {
  try {
    await checkAuth();
    return null; // Authentication successful
  } catch (error) {
    return Navigate({ to: "/login", replace: true });
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    loader: protectedLoader,
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
