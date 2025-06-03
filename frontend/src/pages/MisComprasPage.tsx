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

  if (loading) return <div className="p-4">Cargando compras...</div>;
  if (compras.length === 0)
    return <div className="p-4">No tienes compras realizadas.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mis Compras</h1>
      <div className="flex flex-col gap-8">
        {compras.map((c) => (
          <div key={c.id} className="bg-white rounded shadow p-4">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">
                Compra #{c.id} - {new Date(c.fecha).toLocaleString()}
              </span>
              <span className={`font-bold ${c.estado === "CONFIRMADA" ? "text-green-600" : c.estado === "RECHAZADA" ? "text-red-600" : "text-gray-700"}`}>
                {c.estado}
              </span>
            </div>
            <ul className="mb-2">
              {c.items.map((i) => (
                <li key={i.id}>
                  <b>{i.cantidad} x {i.libro.titulo}</b> &nbsp; 
                  <span>({i.libro.autor})</span> - ${Number(i.precio_unitario).toFixed(2)} c/u
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total: ${Number(c.total).toFixed(2)}</span>
              {c.comprobante && (
                <a
                  href={c.comprobante}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
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
