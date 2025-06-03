import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearLibro } from '../api/libroService';
import { getGeneros } from '../api/generoService';
import type { Libro, Genero } from '../types/models';

export default function NuevoLibroPage() {
  const [form, setForm] = useState<Partial<Libro>>({
    titulo: '',
    autor: '',
    precio: '',
    descripcion: '',
    isbn: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [generosSeleccionados, setGenerosSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    getGeneros()
      .then(setGeneros)
      .catch(() => setError('Error al cargar los géneros'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      setFile(fileInput.files?.[0] || null);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleGeneroChange = (generoId: number) => {
    setGenerosSeleccionados(prev =>
      prev.includes(generoId) ? prev.filter(id => id !== generoId) : [...prev, generoId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (generosSeleccionados.length === 0)
      return setError('Debes seleccionar al menos un género');
    if (!form.titulo?.trim())
      return setError('El título es requerido');
    if (!form.autor?.trim())
      return setError('El autor es requerido');
    if (!form.precio || parseFloat(form.precio.toString()) <= 0)
      return setError('El precio debe ser mayor que 0');
    if (!form.isbn?.trim())
      return setError('El ISBN es requerido');

    setSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('titulo', form.titulo?.trim() || '');
      data.append('autor', form.autor?.trim() || '');
      data.append('precio', form.precio?.toString() || '');
      data.append('isbn', form.isbn?.trim() || '');
      data.append('descripcion', form.descripcion?.trim() || '');
      generosSeleccionados.forEach(generoId => {
        data.append('generos_ids', generoId.toString());
      });
      if (file) data.append('portada', file);

      await crearLibro(data);
      navigate('/admin/libros');
    } catch (err: any) {
      if (err?.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          }
          setError(errorMessages.join('\n'));
        } else {
          setError(errorData.detail || 'Error al crear libro');
        }
      } else {
        setError('Error de conexión al crear libro');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40 text-indigo-600 text-xl font-bold gap-3">
        <div className="animate-spin h-7 w-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
        Cargando géneros...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-extrabold mb-6 text-indigo-800 text-center">Nuevo Libro</h2>
      {error && (
        <div className="text-red-700 mb-4 p-3 bg-red-100 rounded-xl border border-red-200 animate-pulse">
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          name="titulo"
          placeholder="Título"
          className="border border-indigo-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
          value={form.titulo || ''}
          onChange={handleChange}
          required
        />
        <input
          name="autor"
          placeholder="Autor"
          className="border border-indigo-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
          value={form.autor || ''}
          onChange={handleChange}
          required
        />
        <input
          name="precio"
          placeholder="Precio"
          type="number"
          step="0.01"
          min="0.01"
          className="border border-indigo-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
          value={form.precio || ''}
          onChange={handleChange}
          required
        />
        <input
          name="isbn"
          placeholder="ISBN"
          className="border border-indigo-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
          value={form.isbn || ''}
          onChange={handleChange}
          required
        />
        <div className="border border-indigo-200 p-4 rounded-xl">
          <label className="block text-sm font-semibold mb-2 text-indigo-700">
            Géneros <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {generos.map(genero => (
              <label
                key={genero.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 p-2 rounded-lg transition"
              >
                <input
                  type="checkbox"
                  checked={generosSeleccionados.includes(genero.id)}
                  onChange={() => handleGeneroChange(genero.id)}
                  className="rounded accent-indigo-500 w-5 h-5"
                />
                <span className="text-base">{genero.nombre}</span>
              </label>
            ))}
          </div>
          {generosSeleccionados.length > 0 && (
            <div className="mt-2 text-sm text-green-600">
              Seleccionados: {generosSeleccionados.length} género(s)
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-indigo-700">
            Portada (opcional)
          </label>
          <input
            name="portada"
            type="file"
            className="border border-indigo-200 p-2 rounded-xl w-full focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange}
            accept="image/*"
          />
          {file && preview && (
            <div className="mt-3 flex flex-col items-start gap-1">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-44 object-cover rounded shadow border border-gray-200"
              />
              <span className="text-xs text-gray-500">{file.name}</span>
            </div>
          )}
        </div>
        <textarea
          name="descripcion"
          placeholder="Descripción"
          className="border border-indigo-200 p-3 rounded-xl h-28 resize-vertical focus:ring-2 focus:ring-indigo-400 text-base"
          value={form.descripcion || ''}
          onChange={handleChange}
        />
        <button
          type="submit"
          className={`bg-green-600 text-white font-bold p-3 rounded-xl shadow-lg transition-all
            hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed
            ${submitting ? "animate-pulse" : ""}
          `}
          disabled={submitting}
        >
          {submitting ? "Creando libro..." : "Crear Libro"}
        </button>
      </form>
    </div>
  );
}
