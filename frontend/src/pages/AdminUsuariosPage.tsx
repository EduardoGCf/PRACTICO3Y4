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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">👥 Usuarios registrados</h1>
      <table className="w-full border shadow rounded-lg overflow-x-auto bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Admin</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id} className="text-center border-t">
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.first_name}</td>
              <td>{u.last_name}</td>
              <td>{u.is_staff ? "✅" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
