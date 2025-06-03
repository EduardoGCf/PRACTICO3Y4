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
        setLibros(data);
      })
      .catch((err) => {
        setErrorLibros('No se pudieron cargar los libros.');
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-indigo-800 mb-6 text-center tracking-tight">
        Explora los mejores libros
      </h1>

      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Géneros</h2>
        <ul className="flex flex-wrap gap-4 justify-center">
          {generos.map((g) => (
            <li key={g.id}>
              <Link
                to={`/genero/${g.id}`}
                className="px-5 py-2 rounded-full shadow text-indigo-700 font-semibold bg-indigo-100 border border-indigo-200 hover:bg-indigo-200 hover:text-indigo-900 transition-all"
              >
                {g.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Libros</h2>
      {errorLibros ? (
        <p className="text-red-600 mb-4">{errorLibros}</p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {libros.map((libro, idx) => {
            const precioNum = Number(libro.precio);
            return (
              <li
                key={libro.id}
                className="group border rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-hidden flex flex-col relative"
              >
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-black rounded-full shadow border border-yellow-300">
                    #{idx + 1}
                  </span>
                </div>
                <Link to={`/libro/${libro.id}`} className="flex-1 flex flex-col h-full">
                  <div className="relative">
                    <img
                      src={libro.portada || '/noimage.jpg'}
                      alt={libro.titulo}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-2xl"
                      onError={e => (e.currentTarget.src = "/noimage.jpg")}
                    />
                    <div className="absolute top-2 right-2 bg-white/70 rounded-full px-3 py-1 text-xs font-bold text-green-700 shadow">
                      ${isNaN(precioNum) ? libro.precio : precioNum.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col p-4">
                    <h3 className="text-lg font-extrabold text-gray-900 mb-1">{libro.titulo}</h3>

                    <p className="text-xs text-gray-500 font-semibold mb-2">
                      Ventas: <span className="text-indigo-700">{libro.ventas_totales ?? 0}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Autor: <span className="font-medium">{libro.autor}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {libro.generos.map((genero) => (
                        <span
                          key={genero.id}
                          className="bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 px-3 py-0.5 rounded-full"
                        >
                          {genero.nombre}
                        </span>
                      ))}
                    </div>
                    <div className="flex-1"></div>
                    <button
                      className="mt-4 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow transition-all"
                      disabled
                    >
                      Ver detalles
                    </button>
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
