// frontend/src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import type { Libro, Genero } from '../types/models';
import { getGeneros } from '../api/generoService';
import { getTopLibros } from '../api/libroService';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [errorLibros, setErrorLibros] = useState<string | null>(null);

  useEffect(() => {
    
    getGeneros().then(setGeneros).catch(console.error);

    
    getTopLibros()
      .then((data) => {
        console.log('Libros recibidos en HomePage:', data);
        setLibros(data);
      })
      .catch((err) => {
        console.error('Error al llamar a /libros/:', err);
        setErrorLibros('No se pudieron cargar los libros.');
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Géneros</h1>
      <ul className="grid grid-cols-2 gap-4 mb-8">
        {generos.map((g) => (
          <li key={g.id} className="border p-2 rounded hover:shadow">
            <Link to={`/genero/${g.id}`} className="text-lg">
              {g.nombre}
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-bold mb-4">Libros</h2>
      {errorLibros ? (
        <p className="text-red-600 mb-4">{errorLibros}</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {libros.map((libro) => {
            const precioNum = Number(libro.precio);
            return (
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
                    <p className="mt-1 font-bold">
                      ${isNaN(precioNum) ? libro.precio : precioNum.toFixed(2)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
          {libros.length === 0 && (
            <p className="text-gray-600">No hay libros disponibles.</p>
          )}
        </ul>
      )}
    </div>
  );
}
