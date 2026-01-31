import axiosInstance from "./axiosConfig";

export const checkAuth = async () => {
  try {
    const response = await axiosInstance.get("/auth/verify");
    return response.data;
  } catch (error) {
    console.error("Error while verifying", error);
    throw new Error("Not authenticated");
  }
};
