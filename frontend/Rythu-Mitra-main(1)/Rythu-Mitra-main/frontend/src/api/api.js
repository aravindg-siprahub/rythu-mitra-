import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 15000, // 15 sec timeout for slow TensorFlow requests
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===========================================================
   🔐 JWT AUTH SETUP
   Called when user logs in OR token is stored in localStorage
=========================================================== */
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete API.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

/* ===========================================================
   🔁 Automatically load saved token (if present)
=========================================================== */
const savedToken = localStorage.getItem("token");
if (savedToken) {
  setAuthToken(savedToken);
}

/* ===========================================================
   ⚠ GLOBAL ERROR HANDLER (Optional but useful)
=========================================================== */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response || error.message);

    // Auto-logout on 401
    if (error?.response?.status === 401) {
      setAuthToken(null);
    }

    return Promise.reject(error);
  }
);

export default API;
