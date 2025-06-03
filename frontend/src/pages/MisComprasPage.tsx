import { useEffect, useState } from "react";
import { getMisCompras } from "../api/compraService";

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  portada?: string;
}

interface ItemCompra {
  id: number;
  libro: Libro;
  precio_unitario: number;
  cantidad: number;
}

interface Compra {
  id: number;
  fecha: string;
  total: string;
  estado: string;
  comprobante: string | null;
  items: ItemCompra[];
}

function estadoColor(estado: string) {
  switch (estado) {
    case "CONFIRMADA":
      return "bg-green-100 text-green-700 border-green-300";
    case "RECHAZADA":
      return "bg-red-100 text-red-700 border-red-300";
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "CARRITO":
      return "bg-gray-100 text-gray-700 border-gray-300";
    default:
      return "bg-blue-100 text-blue-700 border-blue-300";
  }
}

export default function MisComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMisCompras();
        setCompras(data);
      } catch {
        setCompras([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-300 border-t-indigo-700 rounded-full"></div>
        <span className="ml-4 text-lg text-indigo-700">Cargando compras...</span>
      </div>
    );
  if (compras.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <span className="text-5xl mb-2">🛍️</span>
        <div className="text-lg text-gray-400">No tienes compras realizadas.</div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-10 text-indigo-800 text-center">
        Mis Compras
      </h1>
      <div className="flex flex-col gap-10">
        {compras.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
          >
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <span className="font-bold text-lg">
                Compra #{c.id} <span className="font-normal text-gray-500 text-base">• {new Date(c.fecha).toLocaleString()}</span>
              </span>
              <span
                className={`inline-block px-4 py-1 rounded-full border font-semibold text-xs uppercase tracking-wider ${estadoColor(
                  c.estado
                )}`}
              >
                {c.estado}
              </span>
            </div>
            <ul className="divide-y divide-gray-100 mb-4">
              {c.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  {i.libro.portada && (
                    <img
                      src={i.libro.portada}
                      alt={i.libro.titulo}
                      className="h-14 w-11 object-cover rounded shadow border border-gray-200"
                      onError={(e) => (e.currentTarget.src = "/noimage.jpg")}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {i.cantidad} x {i.libro.titulo}
                    </div>
                    <div className="text-sm text-gray-500">
                      {i.libro.autor}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-green-700">
                      ${Number(i.precio_unitario).toFixed(2)}
                    </span>
                    <div className="text-xs text-gray-400">c/u</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center border-t pt-4">
              <span className="text-xl font-bold text-gray-800">
                Total: <span className="text-green-700">${Number(c.total).toFixed(2)}</span>
              </span>
              {c.comprobante && (
                <a
                  href={c.comprobante}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold transition shadow"
                >
                  Ver comprobante
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
