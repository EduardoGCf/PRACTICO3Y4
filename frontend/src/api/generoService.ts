import api from "./axiosConfig";
import type { Genero } from "../types/models";

export async function getGeneros(): Promise<Genero[]> {
  const res = await api.get<Genero[]>("/generos/");
  return res.data;
}
