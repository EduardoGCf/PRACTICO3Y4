// src/pages/AdminComprasPage.tsx
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

type Libro = { id: number; titulo: string; precio: string };
type ItemCompra = { id: number; libro: Libro; cantidad: number; precio_unitario: string };
type Compra = {
  id: number;
  usuario: { id: number; username: string } | string;
  total: string;
  estado: string;
  items: ItemCompra[];
  comprobante?: string | null;
};

const ESTADOS = ["PENDIENTE", "CONFIRMADA", "RECHAZADA"];

export default function AdminComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);

  const fetchCompras = async () => {
    const { data } = await api.get<Compra[]>("/compras/");
    setCompras(data);
  };

  useEffect(() => { fetchCompras(); }, []);

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    await api.patch(`/compras/${id}/`, { estado: nuevoEstado });
    fetchCompras();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">👤 Administración de Compras</h1>
      <table className="w-full border shadow rounded-lg overflow-x-auto bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th>ID</th>
            <th>Usuario</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Items</th>
            <th>Cambiar Estado</th>
            <th>Comprobante</th>
          </tr>
        </thead>
        <tbody>
          {compras.map(c => (
            <tr key={c.id} className="text-center border-t">
              <td>{c.id}</td>
              <td>
                {typeof c.usuario === "string"
                  ? c.usuario
                  : c.usuario?.username}
              </td>
              <td>${parseFloat(c.total).toFixed(2)}</td>
              <td>{c.estado}</td>
              <td>
                <ul>
                  {c.items.map(i => (
                    <li key={i.id}>
                      {i.libro.titulo} x {i.cantidad} (${parseFloat(i.precio_unitario).toFixed(2)})
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                <select
                  value={c.estado}
                  onChange={e => cambiarEstado(c.id, e.target.value)}
                  className="border rounded p-1"
                  disabled={c.estado !== "PENDIENTE"}
                >
                  {ESTADOS.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </td>
              <td>
                {c.comprobante ? (
                  <a href={c.comprobante} target="_blank" rel="noopener noreferrer">
                    <img
                      src={c.comprobante}
                      alt="Comprobante"
                      className="h-12 mx-auto rounded border"
                      style={{ maxWidth: 80, objectFit: 'contain' }}
                    />
                  </a>
                ) : (
                  <span className="text-gray-400">No subido</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
