export interface Genero {
  id: number;
  nombre: string;
}

export interface Libro {
  id: number;
  titulo: string;
  autor: string;
  precio: string;
  isbn: string;
  descripcion: string;
  portada: string;
  generos: Genero[];
  ventas_totales: number;
}

export interface ItemCompra {
  id: number;
  libro: Libro;
  precio_unitario: number;
  cantidad: number;
}

export type EstadoCompra = "PENDIENTE" | "CONFIRMADA" | "RECHAZADA";

export interface Compra {
  id: number;
  usuario: string;
  fecha: string;
  total: number;
  estado: EstadoCompra;
  comprobante: string | null;
  items: ItemCompra[];
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}
