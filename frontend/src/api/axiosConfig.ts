import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (method && ["post", "put", "patch", "delete"].includes(method)) {
    const csrfToken = Cookies.get("csrftoken");
    if (csrfToken) {
      config.headers!["X-CSRFToken"] = csrfToken;
    }
  }
  return config;
});

export default api;
