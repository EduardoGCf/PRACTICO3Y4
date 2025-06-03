import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

type Usuario = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    api.get<Usuario[]>("/usuarios/").then(res => setUsuarios(res.data));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-indigo-800 flex items-center gap-2">
          👥 Usuarios registrados
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-800">
            <thead>
              <tr className="bg-indigo-100 text-indigo-900 uppercase text-xs">
                <th className="py-3 px-2 font-bold">ID</th>
                <th className="py-3 px-2 font-bold">Username</th>
                <th className="py-3 px-2 font-bold">Email</th>
                <th className="py-3 px-2 font-bold">Nombre</th>
                <th className="py-3 px-2 font-bold">Apellido</th>
                <th className="py-3 px-2 font-bold">Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, idx) => (
                <tr
                  key={u.id}
                  className={`transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}
                >
                  <td className="py-3 px-2 font-extrabold text-indigo-700">{u.id}</td>
                  <td className="py-3 px-2">{u.username}</td>
                  <td className="py-3 px-2">{u.email}</td>
                  <td className="py-3 px-2">{u.first_name}</td>
                  <td className="py-3 px-2">{u.last_name}</td>
                  <td className="py-3 px-2">
                    {u.is_staff ? (
                      <span className="inline-block bg-green-100 text-green-700 rounded-full px-4 py-1 font-bold text-xs shadow border border-green-200">
                        ADMIN
                      </span>
                    ) : (
                      <span className="inline-block bg-gray-100 text-gray-500 rounded-full px-4 py-1 font-semibold text-xs shadow border border-gray-200">
                        Usuario
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-gray-400 text-center text-lg">
                    No hay usuarios registrados.
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
