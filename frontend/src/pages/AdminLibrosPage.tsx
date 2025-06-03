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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📚 Administración de Libros</h1>
      <Link to="/admin/libros/crear" className="bg-green-600 text-white px-4 py-2 rounded mb-4 inline-block hover:bg-green-700">Nuevo libro</Link>
      <table className="w-full border shadow rounded-lg overflow-x-auto bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th>ID</th>
            <th>Título</th>
            <th>Autor</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {libros.map(l => (
            <tr key={l.id} className="text-center border-t">
              <td>{l.id}</td>
              <td>{l.titulo}</td>
              <td>{l.autor}</td>
              <td>${parseFloat(l.precio).toFixed(2)}</td>
              <td>
                <Link to={`/admin/libros/editar/${l.id}`} className="text-blue-700 px-2">Editar</Link>
                <button onClick={() => eliminarLibro(l.id)} className="text-red-600 px-2">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

