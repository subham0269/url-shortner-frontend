import axios from "axios";

const baseUrl = "https://vertex-zus-last-restoration.trycloudflare.com";
console.log(baseUrl);
const axiosInstance = axios.create({
  baseURL: `${baseUrl}/api`,
  withCredentials: true, // This enables sending cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
