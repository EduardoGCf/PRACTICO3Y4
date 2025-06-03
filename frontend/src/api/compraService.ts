import api from "./axiosConfig";
import type { Compra } from "../types/models";

interface ItemCrear {
  libro_id: number;
  precio_unitario: number;
  cantidad: number;
}

export async function crearCompra(items: ItemCrear[]): Promise<Compra> {
  const res = await api.post<Compra>("/compras/", { items });
  return res.data;
}

export async function subirComprobante(
  compraId: number,
  file: File
): Promise<Compra> {
  const formData = new FormData();
  formData.append("comprobante", file);
  const res = await api.patch<Compra>(`/compras/${compraId}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getComprasUsuario(): Promise<Compra[]> {
  const res = await api.get<Compra[]>("/compras/");
  return res.data;
}
export async function getMisCompras() {
  const { data } = await api.get("/compras/");
  return data; // array de compras
}
