import { useLoaderData, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();
  const loaderData = useLoaderData();

  useEffect(() => {
    if (loaderData?.redirect) {
      navigate(loaderData.redirect);
    }
  }, [loaderData, navigate]);

  return (
    <div>
      <h1>Welcome to URL Shortener</h1>
      {/* Add your home page content here */}
    </div>
  );
};

export default Home;
