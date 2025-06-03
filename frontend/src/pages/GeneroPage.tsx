import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Libro } from '../types/models';
import { getLibrosPorGenero } from '../api/libroService';

export default function GeneroPage() {
  const { id } = useParams<{ id: string }>();
  const [libros, setLibros] = useState<Libro[]>([]);

  useEffect(() => {
    if (id) {
      getLibrosPorGenero(parseInt(id)).then(setLibros);
    }
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-indigo-800 mb-8 text-center">
        Libros por Género
      </h1>
      {libros.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <span className="text-5xl mb-4">😢</span>
          <p className="text-xl text-gray-500">No hay libros en este género.</p>
        </div>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {libros.map((libro) => (
            <li
              key={libro.id}
              className="group border rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-hidden flex flex-col"
            >
              <Link to={`/libro/${libro.id}`} className="flex-1 flex flex-col h-full">
                <div className="relative">
                  <img
                    src={libro.portada || '/noimage.jpg'}
                    alt={libro.titulo}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-2xl"
                    onError={e => (e.currentTarget.src = "/noimage.jpg")}
                  />
                  <div className="absolute top-2 right-2 bg-white/80 rounded-full px-3 py-1 text-xs font-bold text-green-700 shadow border border-green-200">
                    ${Number(libro.precio).toFixed(2)}
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-4">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">{libro.titulo}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Autor: <span className="font-medium">{libro.autor}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {libro.generos && libro.generos.length > 0 ? (
                      libro.generos.map((genero) => (
                        <span
                          key={genero.id}
                          className="bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 px-3 py-0.5 rounded-full"
                        >
                          {genero.nombre}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">Sin género</span>
                    )}
                  </div>
                  <button
                    className="mt-auto w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow transition-all"
                    disabled
                  >
                    Ver detalles
                  </button>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
