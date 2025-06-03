import api from "./axiosConfig";
import type { Libro } from "../types/models";

export async function getTopLibros(): Promise<Libro[]> {
  const res = await api.get("/libros/top/");
  return res.data;
}

export async function getLibros(): Promise<Libro[]> {
  const res = await api.get("/libros/");
  return res.data;
}

export async function getLibrosPorGenero(generoId: number) {
  const res = await api.get(`/generos/${generoId}/libros/`);
  return res.data;
}

export async function getLibroById(libroId: number): Promise<Libro> {
  const res = await api.get(`/libros/${libroId}/`);
  return res.data;
}

export async function crearLibro(data: FormData) {
  return await api.post("/libros/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
export async function editarLibro(id: number, data: FormData) {
  return await api.patch(`/libros/${id}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
