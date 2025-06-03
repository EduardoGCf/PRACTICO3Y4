// src/pages/AdminGenerosPage.tsx
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

type Genero = { id: number; nombre: string };

export default function AdminGenerosPage() {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [nuevoGenero, setNuevoGenero] = useState("");

  const fetchGeneros = async () => {
    const { data } = await api.get<Genero[]>("/generos/");
    setGeneros(data);
  };

  useEffect(() => { fetchGeneros(); }, []);

  const agregarGenero = async () => {
    if (!nuevoGenero) return;
    await api.post("/generos/", { nombre: nuevoGenero });
    setNuevoGenero("");
    fetchGeneros();
  };

  const eliminarGenero = async (id: number) => {
    if (window.confirm("¿Eliminar este género?")) {
      await api.delete(`/generos/${id}/`);
      fetchGeneros();
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">🏷️ Administración de Géneros</h1>
      <div className="mb-4 flex gap-2">
        <input
          value={nuevoGenero}
          onChange={e => setNuevoGenero(e.target.value)}
          placeholder="Nuevo género"
          className="border rounded px-3 py-2"
        />
        <button onClick={agregarGenero} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Agregar</button>
      </div>
      <ul className="border shadow rounded-lg bg-white">
        {generos.map(g => (
          <li key={g.id} className="flex justify-between items-center px-4 py-2 border-b">
            <span>{g.nombre}</span>
            <button onClick={() => eliminarGenero(g.id)} className="text-red-600">Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
