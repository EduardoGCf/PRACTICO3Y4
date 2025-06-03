import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  // Solo sincroniza el carrito si el usuario está logueado
  useEffect(() => {
    if (id) {
      getLibroById(Number(id)).then(setLibro).catch(console.error);
      if (user) fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]); // agrega user para actualizar si se loguea

  if (!libro) return <p className="p-4">Cargando...</p>;

  // Solo verifica si el libro está en el carrito si hay usuario
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
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={libro.portada}
          alt={libro.titulo}
          className="w-full md:w-1/3 h-auto object-cover rounded"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{libro.titulo}</h1>
          <p className="text-lg text-gray-700 mb-1">Autor: {libro.autor}</p>
          <p className="text-xl font-semibold mb-4">
            ${Number(libro.precio).toFixed(2)}
          </p>
          <p className="mb-4">{libro.descripcion}</p>
          <button
            disabled={loadingAdd || yaEnCarrito}
            onClick={handleAddToCart}
            className={`px-4 py-2 rounded text-white 
              ${loadingAdd
                ? 'bg-gray-400 cursor-not-allowed'
                : agregado || yaEnCarrito
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
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
  );
}
