import axios from "axios";

const api = axios.create({
  baseURL: "https://rpf-ai-assistant-506261777635.herokuapp.com",
});

// Helper to always read the latest token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getData = async (endpoint: string, params?: Record<string, any>) => {
  try {
    const response = await api.get(endpoint, {
      params,
      headers: {
        ...getAuthHeaders(),
      },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export const postData = async (endpoint: string, body: Record<string, any>) => {
  try {
    const response = await api.post(endpoint, body, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const getCurrentUser = async () => {
  const result = await getData("/auth/me");

  if (result.success) {
    localStorage.setItem("userId", result.data.data.id);
    return result.data;
  } else {
    throw new Error(result.error || "Failed to fetch current user");
  }
};

export const getCitiesList = async () => {
  const result = await getData("/stats/cities");

  if (result.success) {
    console.log("cities fetched: ", result.data);
    return result.data;
  } else {
    throw new Error(result.error || "Failed to fetch cities list");
  }
};

// Fetch a single city's location (lat/lon) for map focusing
export const getCityLocation = async (city: string) => {
  const result = await getData(`/stats/location?city=${encodeURIComponent(city)}`);

  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error || "Failed to fetch city location");
  }
};

export default api;
