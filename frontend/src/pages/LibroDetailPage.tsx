import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Libro } from '../types/models';
import { getLibroById } from '../api/libroService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function LibroDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [libro, setLibro] = useState<Libro | null>(null);
  const [agregado, setAgregado] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const { addToCart, items, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getLibroById(Number(id)).then(setLibro).catch(console.error);
      if (user) fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  if (!libro) return <p className="p-4">Cargando...</p>;

  const yaEnCarrito = user ? items.some((i) => i.libro.id === libro.id) : false;

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (yaEnCarrito) {
      setAgregado(true);
      setTimeout(() => setAgregado(false), 1500);
      return;
    }
    setLoadingAdd(true);
    try {
      await addToCart({
        libro, cantidad: 1,
        id: 0,
      });
      setAgregado(true);
      await fetchCart();
      setTimeout(() => setAgregado(false), 1500);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    } finally {
      setLoadingAdd(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 bg-white shadow-2xl rounded-2xl p-6 border border-gray-200">
        <div className="md:w-1/3 flex justify-center items-start">
          <img
            src={libro.portada || "/noimage.jpg"}
            alt={libro.titulo}
            className="w-56 h-80 object-cover rounded-lg shadow-md border border-gray-100 bg-gray-50"
            onError={e => (e.currentTarget.src = "/noimage.jpg")}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <h1 className="text-4xl font-extrabold mb-2 text-gray-800">{libro.titulo}</h1>
          <div className="flex flex-wrap gap-2 mb-2">
            {libro.generos && libro.generos.length > 0 ? (
              libro.generos.map((g) => (
                <Link
                  key={g.id}
                  to={`/genero/${g.id}`}
                  className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium hover:bg-indigo-200 transition"
                >
                  {g.nombre}
                </Link>
              ))
            ) : (
              <span className="text-xs text-gray-400">Sin género</span>
            )}
          </div>
          <div className="text-lg text-gray-700 mb-1">
            <span className="font-semibold">Autor:</span> {libro.autor}
          </div>
          {libro.isbn && (
            <div className="text-sm text-gray-500 mb-1">
              <span className="font-semibold">ISBN:</span> {libro.isbn}
            </div>
          )}
          {typeof libro.ventas_totales === "number" && (
            <div className="text-xs text-gray-500 mb-3">
              <span className="font-semibold">Ventas:</span> {libro.ventas_totales}
            </div>
          )}
          <p className="mb-4 text-gray-700 leading-relaxed">{libro.descripcion}</p>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-green-700">
              ${Number(libro.precio).toFixed(2)}
            </span>
            <button
              disabled={loadingAdd || yaEnCarrito}
              onClick={handleAddToCart}
              className={`px-6 py-2 rounded-xl shadow font-bold text-white text-base transition-all
                ${loadingAdd
                  ? 'bg-gray-400 cursor-not-allowed'
                  : agregado || yaEnCarrito
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
                }
                ${agregado ? 'animate-pulse' : ''}
              `}
            >
              {!user
                ? 'Inicia sesión para comprar'
                : loadingAdd
                ? 'Agregando...'
                : agregado || yaEnCarrito
                ? 'Agregado ✓'
                : 'Agregar al carrito'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
