// src/lib/http.js
import axios from "axios";

// Ambil dari env atau fallback:
const base = (
  import.meta.env.VITE_API_BASE_URL || "http://10.0.0.104/api/noah"
).replace(/\/+$/, "");

const http = axios.create({
  baseURL: base,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Authorization otomatis dari localStorage (opsional)
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_type");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default http;
