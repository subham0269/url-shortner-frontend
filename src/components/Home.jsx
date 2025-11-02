import { useLoaderData, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const userData = useLoaderData();
  const [longUrl, setLongUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userData?.redirect) {
      navigate(userData.redirect);
      return;
    }

    // Load existing shortened URLs
    fetchUserUrls();
  }, [userData, navigate]);

  const fetchUserUrls = async () => {
    try {
      const response = await axiosInstance.get("/urls/user");
      setUrls(response.data);
    } catch (error) {
      console.error("Error fetching URLs:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/urls/shorten", { longUrl });
      setUrls((prevUrls) => [response.data, ...prevUrls]);
      setLongUrl("");
      setSuccess("URL shortened successfully!");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to shorten URL");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setSuccess("URL copied to clipboard!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to copy URL");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="home-container">
      <div className="user-info">
        <h2>Welcome, {userData?.fullName}!</h2>
        <p>Email: {userData?.emailId}</p>
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
        {success && <div className="success-message">{success}</div>}
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
              <button
                className="copy-button"
                onClick={() => copyToClipboard(url.shortUrl)}
              >
                Copy
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
