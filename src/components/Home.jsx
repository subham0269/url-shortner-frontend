import { useLoaderData, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserUrls,
  shortenUrl,
  deleteUrl,
  clearError,
  clearSuccessMessage,
} from "../redux/slices/urlSlice";
import { logout } from "../redux/slices/authSlice";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const userData = useLoaderData();
  const dispatch = useDispatch();
  const [longUrl, setLongUrl] = useState("");
  const { urls, isLoading, error, successMessage } = useSelector(
    (state) => state.urls,
  );
  const authUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (userData?.redirect) {
      navigate(userData.redirect);
      return;
    }

    // Load existing shortened URLs
    dispatch(fetchUserUrls());
  }, [userData, navigate, dispatch]);

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(shortenUrl(longUrl));
    setLongUrl("");
  };

  const copyToClipboard = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      dispatch(clearSuccessMessage());
      // We could add a separate notification state for copy action
      setTimeout(() => {
        alert("URL copied to clipboard!");
      }, 100);
    } catch (e) {
      // eslint-disable-line no-unused-vars
      alert("Failed to copy URL");
    }
  };

  const handleDeleteUrl = (urlId) => {
    if (window.confirm("Are you sure you want to delete this shortened URL?")) {
      dispatch(deleteUrl(urlId));
    }
  };

  const handleLogout = async () => {
    dispatch(logout()).then(() => {
      navigate("/login");
    });
  };

  const displayUser = authUser || userData;

  return (
    <div className="home-container">
      <div className="user-info">
        <div>
          <h2>Welcome, {displayUser?.fullName || "User"}!</h2>
          <p>Email: {displayUser?.emailId || displayUser?.email}</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="url-form">
        <h3>Shorten a URL</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Enter your long URL here"
            required
            disabled={isLoading}
          />
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Shortening..." : "Shorten URL"}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
      </div>

      <div className="url-list">
        <h3>Your Shortened URLs</h3>
        {urls.length === 0 ? (
          <p>No URLs shortened yet</p>
        ) : (
          urls.map((url) => (
            <div key={url.id} className="url-item">
              <div>
                <div>Original: {url.longUrl}</div>
                <a
                  href={url.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shortened-url"
                >
                  Shortened: {url.shortUrl}
                </a>
              </div>
              <div className="url-actions">
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(url.shortUrl)}
                >
                  Copy
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteUrl(url.id)}
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
