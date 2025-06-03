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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Libros del Género</h1>
      {libros.length === 0 ? (
        <p>No hay libros en este género.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {libros.map((libro) => (
            <li
              key={libro.id}
              className="border rounded overflow-hidden hover:shadow"
            >
              <Link to={`/libro/${libro.id}`}>
                <img
                  src={libro.portada}
                  alt={libro.titulo}
                  className="w-full h-48 object-cover"
                />
                <div className="p-2">
                  <h3 className="font-semibold">{libro.titulo}</h3>
                  <p className="text-sm text-gray-600">Autor: {libro.autor}</p>
                  <p className="mt-1 font-bold">${libro.precio.fixed()}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
