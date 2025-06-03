import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

type Genero = { id: number; nombre: string };

export default function AdminGenerosPage() {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [nuevoGenero, setNuevoGenero] = useState("");
  const [agregando, setAgregando] = useState(false);

  const fetchGeneros = async () => {
    const { data } = await api.get<Genero[]>("/generos/");
    setGeneros(data);
  };

  useEffect(() => { fetchGeneros(); }, []);

  const agregarGenero = async () => {
    if (!nuevoGenero.trim()) return;
    setAgregando(true);
    await api.post("/generos/", { nombre: nuevoGenero.trim() });
    setNuevoGenero("");
    await fetchGeneros();
    setAgregando(false);
  };

  const eliminarGenero = async (id: number) => {
    if (window.confirm("¿Eliminar este género?")) {
      await api.delete(`/generos/${id}/`);
      fetchGeneros();
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-indigo-700 flex items-center gap-2">
          🏷️ Administración de Géneros
        </h1>
        <div className="mb-6 flex gap-2 items-center">
          <input
            value={nuevoGenero}
            onChange={e => setNuevoGenero(e.target.value)}
            placeholder="Nuevo género"
            className="flex-1 border border-indigo-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow transition"
            onKeyDown={e => {
              if (e.key === "Enter") agregarGenero();
            }}
            disabled={agregando}
          />
          <button
            onClick={agregarGenero}
            className={`flex items-center gap-1 px-5 py-2 rounded-xl font-semibold text-white shadow
              ${agregando ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"} transition-all`}
            disabled={agregando}
          >
            <span className="text-lg">+</span>
            {agregando ? "Agregando..." : "Agregar"}
          </button>
        </div>
        <ul className="divide-y divide-gray-100">
          {generos.map(g => (
            <li
              key={g.id}
              className="flex justify-between items-center px-3 py-3 hover:bg-indigo-50 rounded-xl transition"
            >
              <span className="font-medium text-gray-800">{g.nombre}</span>
              <button
                onClick={() => eliminarGenero(g.id)}
                className="p-2 rounded-full hover:bg-red-100 transition text-red-600 hover:text-red-700"
                title="Eliminar género"
              >
                <span className="text-lg">🗑️</span>
              </button>
            </li>
          ))}
          {generos.length === 0 && (
            <li className="text-gray-400 text-center py-8">No hay géneros registrados.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
