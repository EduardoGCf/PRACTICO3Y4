import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Link } from "react-router-dom";

type Libro = { id: number; titulo: string; autor: string; precio: string };

export default function AdminLibrosPage() {
  const [libros, setLibros] = useState<Libro[]>([]);

  const fetchLibros = async () => {
    const { data } = await api.get<Libro[]>("/libros/");
    setLibros(data);
  };

  useEffect(() => { fetchLibros(); }, []);

  const eliminarLibro = async (id: number) => {
    if (window.confirm("¿Eliminar este libro?")) {
      await api.delete(`/libros/${id}/`);
      fetchLibros();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
        <div className="flex flex-wrap items-center justify-between mb-8 gap-3">
          <h1 className="text-3xl font-extrabold text-indigo-800 flex items-center gap-2">
            📚 Administración de Libros
          </h1>
          <Link
            to="/admin/libros/crear"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-xl shadow transition-all"
          >
            <span className="text-xl">+</span> Nuevo libro
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-800">
            <thead>
              <tr className="bg-indigo-100 text-indigo-900 uppercase text-xs">
                <th className="py-3 px-2 font-bold">ID</th>
                <th className="py-3 px-2 font-bold">Título</th>
                <th className="py-3 px-2 font-bold">Autor</th>
                <th className="py-3 px-2 font-bold">Precio</th>
                <th className="py-3 px-2 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {libros.map((l, idx) => (
                <tr
                  key={l.id}
                  className={`transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}
                >
                  <td className="py-3 px-2 font-extrabold text-indigo-700">{l.id}</td>
                  <td className="py-3 px-2">{l.titulo}</td>
                  <td className="py-3 px-2">{l.autor}</td>
                  <td className="py-3 px-2 text-green-700 font-semibold">
                    ${parseFloat(l.precio).toFixed(2)}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-2 justify-center">
                      <Link
                        to={`/admin/libros/editar/${l.id}`}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold transition-all"
                        title="Editar libro"
                      >
                        ✏️ Editar
                      </Link>
                      <button
                        onClick={() => eliminarLibro(l.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold transition-all"
                        title="Eliminar libro"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {libros.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-gray-400 text-center text-lg">
                    No hay libros registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
