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

function estadoBadge(estado: string) {
  switch (estado) {
    case "CONFIRMADA":
      return "bg-green-100 text-green-800 border border-green-300";
    case "RECHAZADA":
      return "bg-red-100 text-red-800 border border-red-300";
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-300";
  }
}

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
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-10 text-indigo-800 text-center">
        👤 Administración de Compras
      </h1>
      <div className="overflow-x-auto rounded-2xl shadow-xl border border-gray-100 bg-white">
        <table className="min-w-full text-sm text-gray-800">
          <thead>
            <tr className="bg-indigo-100 text-indigo-900 uppercase text-xs">
              <th className="py-3 px-2 font-bold">ID</th>
              <th className="py-3 px-2 font-bold">Usuario</th>
              <th className="py-3 px-2 font-bold">Total</th>
              <th className="py-3 px-2 font-bold">Estado</th>
              <th className="py-3 px-2 font-bold">Ítems</th>
              <th className="py-3 px-2 font-bold">Cambiar Estado</th>
              <th className="py-3 px-2 font-bold">Comprobante</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((c, idx) => (
              <tr
                key={c.id}
                className={`transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}
              >
                <td className="py-3 px-2 font-extrabold text-indigo-800 text-lg">{c.id}</td>
                <td className="py-3 px-2">
                  <span className="font-semibold">
                    {typeof c.usuario === "string" ? c.usuario : c.usuario?.username}
                  </span>
                </td>
                <td className="py-3 px-2 text-green-700 font-bold">
                  ${parseFloat(c.total).toFixed(2)}
                </td>
                <td className="py-3 px-2">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold ${estadoBadge(c.estado)}`}>
                    {c.estado}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <ul className="flex flex-col gap-2">
                    {c.items.map(i => (
                      <li
                        key={i.id}
                        className="flex flex-col sm:flex-row items-center sm:gap-2 text-sm"
                      >
                        <span className="font-medium text-gray-800">
                          {i.libro.titulo}
                        </span>
                        <span className="mx-1 text-gray-400">× {i.cantidad}</span>
                        <span className="text-green-600">${parseFloat(i.precio_unitario).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-3 px-2">
                  <select
                    value={c.estado}
                    onChange={e => cambiarEstado(c.id, e.target.value)}
                    className="border border-indigo-200 bg-indigo-50 rounded-full px-3 py-1 font-semibold text-indigo-700 shadow transition-all cursor-pointer disabled:opacity-70"
                    disabled={c.estado !== "PENDIENTE"}
                  >
                    {ESTADOS.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-2">
                  {c.comprobante ? (
                    <a href={c.comprobante} target="_blank" rel="noopener noreferrer">
                      <img
                        src={c.comprobante}
                        alt="Comprobante"
                        className="h-16 w-20 object-contain mx-auto rounded shadow border border-gray-300 hover:ring-2 hover:ring-indigo-400 transition"
                      />
                    </a>
                  ) : (
                    <span className="text-gray-300 italic">No subido</span>
                  )}
                </td>
              </tr>
            ))}
            {compras.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-gray-400 text-center text-lg">
                  No hay compras registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
