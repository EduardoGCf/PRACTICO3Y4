import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

interface Libro {
  id: number;
  titulo: string;
  precio: number;
}

interface ItemCompra {
  id: number;
  libro: Libro;
  precio_unitario: number;
  cantidad: number;
}

interface CompraConItems {
  id: number;
  usuario: string;
  fecha: string;
  total: string;
  estado: string;
  comprobante: string | null;
  items: ItemCompra[];
}

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number>(0);
  const [carritoId, setCarritoId] = useState<number | null>(null);

  
  useEffect(() => {
    cargarCarrito();
  }, []);

  
  useEffect(() => {
    const suma = items.reduce((acc, i) => acc + Number(i.libro.precio) * i.cantidad, 0);
    setTotal(suma);
  }, [items]);

  
  const cargarCarrito = async () => {
    try {
      const { data } = await api.get<CompraConItems>('/compras/mi-carrito/');
      setItems(data.items);
      setCarritoId(data.id);
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const eliminarItem = async (itemId: number) => {
    if (!carritoId) return;
    try {
      await api.delete(`/compras/${carritoId}/eliminar-item/${itemId}/`);
      cargarCarrito();
    } catch (err) {
      alert('Error al eliminar el libro del carrito');
    }
  };

  if (loading) return <p>Cargando carrito...</p>;
  if (!carritoId || items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Mi Carrito</h1>
        <p>Tu carrito está vacío.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mi Carrito</h1>
      <table className="min-w-full mb-4">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Título</th>
            <th className="px-4 py-2 text-right">Precio Unitario</th>
            <th className="px-4 py-2 text-center">Cantidad</th>
            <th className="px-4 py-2 text-right">Subtotal</th>
            <th className="px-4 py-2 text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => {
            const precioNumber = Number(i.libro.precio);
            const subtotal = precioNumber * i.cantidad;
            return (
              <tr key={i.id} className="border-b">
                <td className="px-4 py-2">{i.libro.titulo}</td>
                <td className="px-4 py-2 text-right">${precioNumber.toFixed(2)}</td>
                <td className="px-4 py-2 text-center">{i.cantidad}</td>
                <td className="px-4 py-2 text-right">${subtotal.toFixed(2)}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => eliminarItem(i.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                    title="Eliminar del carrito"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-end">
        <span className="text-xl font-semibold">Total: ${total.toFixed(2)}</span>
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={() => navigate(`/checkout/${carritoId}`)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors"
        >
          Confirmar compra
        </button>
      </div>
    </div>
  );
}
