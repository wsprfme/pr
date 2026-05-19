import axios from "axios";

export const API_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL + "/api",
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getUser()?.role === "admin";
}

export function isStaff() {
  const r = getUser()?.role;
  return r === "admin" || r === "petugas";
}

export function isMember() {
  return getUser()?.role === "member";
}

export function fileUrl(path) {
  if (!path) return "";
  return `${API_URL}/storage/${path}`;
}

export function formatRupiah(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

export default api;
