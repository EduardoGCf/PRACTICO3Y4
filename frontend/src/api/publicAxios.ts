import axios from "axios";

const publicApi = axios.create({
  baseURL: "/api",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicApi;
