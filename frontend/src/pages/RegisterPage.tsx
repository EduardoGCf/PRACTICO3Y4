import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { registerUser } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      await registerUser(form.username, form.email, form.password, form.password2);
    } catch {
      setError('No fue posible registrar. Revisa los datos.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-extrabold mb-6 text-indigo-800 text-center">
          Crear Cuenta
        </h1>
        {error && (
          <div className="text-red-700 mb-4 p-3 bg-red-100 rounded-lg border border-red-200 animate-pulse text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Usuario"
            value={form.username}
            onChange={handleChange}
            className="border border-indigo-200 p-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            className="border border-indigo-200 p-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="border border-indigo-200 p-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            name="password2"
            type="password"
            autoComplete="new-password"
            placeholder="Confirmar contraseña"
            value={form.password2}
            onChange={handleChange}
            className="border border-indigo-200 p-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl shadow transition-all text-lg"
          >
            Registrarme
          </button>
        </form>
      </div>
    </div>
  );
}
