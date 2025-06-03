import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

interface Libro {
  id: number;
  titulo: string;
  precio: number;
  portada?: string | null;
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

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin h-12 w-12 border-4 border-indigo-300 border-t-indigo-600 rounded-full"></div>
      <span className="ml-4 text-lg text-indigo-700">Cargando carrito...</span>
    </div>
  );
  if (!carritoId || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-extrabold mb-3 text-indigo-800">Mi Carrito</h1>
        <span className="text-6xl mb-2">🛒</span>
        <p className="text-lg text-gray-400">Tu carrito está vacío.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow transition-all"
        >
          Ir a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-8 text-indigo-800 text-center">Mi Carrito</h1>
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="py-3 px-2 text-left text-xs font-bold text-gray-600 uppercase">Libro</th>
                <th className="py-3 px-2 text-right text-xs font-bold text-gray-600 uppercase">Precio</th>
                <th className="py-3 px-2 text-center text-xs font-bold text-gray-600 uppercase">Cantidad</th>
                <th className="py-3 px-2 text-right text-xs font-bold text-gray-600 uppercase">Subtotal</th>
                <th className="py-3 px-2 text-center text-xs font-bold text-gray-600 uppercase">Quitar</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => {
                const precioNumber = Number(i.libro.precio);
                const subtotal = precioNumber * i.cantidad;
                return (
                  <tr key={i.id} className="hover:bg-indigo-50 transition">
                    <td className="py-3 px-2 flex items-center gap-3">
                      {i.libro.portada && (
                        <img
                          src={i.libro.portada}
                          alt={i.libro.titulo}
                          className="h-12 w-10 object-cover rounded shadow border border-gray-100"
                          onError={e => (e.currentTarget.src = "/noimage.jpg")}
                        />
                      )}
                      <span className="font-semibold text-gray-800">{i.libro.titulo}</span>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-indigo-700">
                      ${precioNumber.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-center">{i.cantidad}</td>
                    <td className="py-3 px-2 text-right font-bold text-green-700">
                      ${subtotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => eliminarItem(i.id)}
                        className="p-2 rounded-full hover:bg-red-100 transition group"
                        title="Eliminar del carrito"
                      >
                        <span className="text-xl text-red-600 group-hover:scale-125 transition">X</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6">
          <span className="text-2xl font-bold text-gray-800">
            Total: <span className="text-green-700">${total.toFixed(2)}</span>
          </span>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => navigate(`/checkout/${carritoId}`)}
            className="px-8 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow transition-all"
          >
            Confirmar compra
          </button>
        </div>
      </div>
    </div>
  );
}
