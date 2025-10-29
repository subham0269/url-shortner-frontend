import axios from "axios";

const baseUrl = import.meta.env.VITE_SERVER_BASEURL;
const axiosInstance = axios.create({
  baseURL: `${baseUrl}/api`,
  withCredentials: true, // This enables sending cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
