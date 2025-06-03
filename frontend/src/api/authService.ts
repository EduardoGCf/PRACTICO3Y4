import api from "./axiosConfig";
import type { Usuario } from "../types/models";
import Cookies from "js-cookie";

export interface LoginData {
  username: string;
  password: string;
}

export async function login(data: LoginData) {
  return (await api.post("/auth/login/", data)).data;
}

export async function register(data: {
  username: string;
  email: string;
  password: string;
  password2: string;
}) {
  return (await api.post("/auth/register/", data)).data;
}

export async function getCurrentUser(): Promise<Usuario> {
  const res = await api.get<Usuario>("/auth/user/");
  return res.data;
}

export async function logout() {
  try {
    await api.get("/auth/csrf/");

    await api.post("/auth/logout/");
  } catch (error) {
    console.log("Logout failed, cleaning cookies manually...", error);

    Cookies.remove("sessionid", { path: "/" });
    Cookies.remove("csrftoken", { path: "/" });

    Cookies.remove("sessionid", { path: "/", domain: "localhost" });
    Cookies.remove("csrftoken", { path: "/", domain: "localhost" });

    localStorage.removeItem("user");

    throw error;
  }
}
