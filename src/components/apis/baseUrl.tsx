import axios from "axios";

const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: "https://rpf-ai-assistant-506261777635.herokuapp.com"
});

export const getData = async (endpoint: string, params?: Record<string, any>) => {
  try {
    const response = await api.get(endpoint, {
      params, headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
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
        Authorization: token ? `Bearer ${token}` : undefined,
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
  const result = await getData('/auth/me', {headers:{
    Authorization: token? `Bearer ${token}`: undefined
  }});

  if (result.success) {
    localStorage.setItem("userId", result.data.data.id)
    return result.data;
  } else {
    throw new Error(result.error || 'Failed to fetch current user');
  }
};

export const getCitiesList= async () => {
  const result = await getData('/stats/cities', {headers:{
    Authorization: token? `Bearer ${token}`: undefined
  }});

  if (result.success) {
    console.log("cities fetched: ", result.data)
    return result.data;
  } else {
    throw new Error(result.error || 'Failed to fetch cities list');
  }
};

export default api;
