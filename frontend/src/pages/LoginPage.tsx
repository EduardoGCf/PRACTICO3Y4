import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginUser(form.username, form.password);
      navigate('/');
    } catch {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-extrabold mb-6 text-green-700 text-center">
          Iniciar Sesión
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
            className="border border-green-200 p-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="border border-green-200 p-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-xl shadow transition-all text-lg"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
